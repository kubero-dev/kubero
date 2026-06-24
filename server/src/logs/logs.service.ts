import { Injectable, Logger } from '@nestjs/common';
import { ILoglines } from './logs.interface';
import { KubernetesService } from '../kubernetes/kubernetes.service';
import { PipelinesService } from '../pipelines/pipelines.service';
import { EventsGateway } from '../events/events.gateway';
import { Stream } from 'stream';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LogsService {
  private logger = new Logger(LogsService.name);
  private podLogStreams: string[] = [];

  constructor(
    private kubectl: KubernetesService,
    private pipelinesService: PipelinesService,
    private EventsGateway: EventsGateway,
  ) {}

  private logcolor(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += ('00' + value.toString(16)).substring(2);
    }
    return color;
  }

  public async emitLogs(
    pipelineName: string,
    phaseName: string,
    appName: string,
    podName: string,
    container: string,
    userGroups: string[],
  ) {
    const logStream = new Stream.PassThrough();

    logStream.on('data', (chunk: any) => {
      // use write rather than console.log to prevent double line feed
      //process.stdout.write(chunk);
      const roomname = `${pipelineName}-${phaseName}-${appName}`;
      const logline = {
        id: uuidv4(),
        time: new Date().getTime(),
        pipeline: pipelineName,
        phase: phaseName,
        app: appName,
        pod: podName,
        podID: podName.split('-')[3] + '-' + podName.split('-')[4],
        container: container,
        color: this.logcolor(podName),
        log: chunk.toString(),
      };
      this.EventsGateway.sendLogline(roomname, logline);
    });

    const contextName = await this.pipelinesService.getContext(
      pipelineName,
      phaseName,
      userGroups,
    );
    const namespace = pipelineName + '-' + phaseName;

    if (contextName) {
      this.kubectl.setCurrentContext(contextName);

      if (!this.podLogStreams.includes(podName)) {
        this.kubectl.log
          .log(namespace, podName, container, logStream, {
            follow: true,
            tailLines: 0,
            pretty: false,
            timestamps: false,
          })
          .then((_res) => {
            this.logger.debug('logs started for ' + podName + ' ' + container);
            this.podLogStreams.push(podName);
          })
          .catch((err) => {
            this.logger.error(
              'Failed to start logs for ' + podName + ' ' + container,
            );
            this.logger.error(err.body.message);
          });
      } else {
        this.logger.debug('logs already running ' + podName + ' ' + container);
      }
    }
  }

  public async startLogging(
    pipelineName: string,
    phaseName: string,
    appName: string,
    userGroups: string[],
  ) {
    const contextName = await this.pipelinesService.getContext(
      pipelineName,
      phaseName,
      userGroups,
    );
    const namespace = pipelineName + '-' + phaseName;

    if (contextName) {
      this.kubectl.getPods(namespace, contextName).then((pods: any[]) => {
        for (const pod of pods) {
          if (pod.metadata.name.startsWith(appName + '-kuberoapp')) {
            for (const container of pod.spec.containers) {
              this.emitLogs(
                pipelineName,
                phaseName,
                appName,
                pod.metadata.name,
                container.name,
                userGroups,
              );
            }
            /* TODO needs some improvements since it wont load web anymore
            for (const initcontainer of pod.spec.initContainers) {
                this.emitLogs(pipelineName, phaseName, appName, pod.metadata.name, initcontainer.name);
            }
            */
          }
        }
      });
    }
  }

  public async getLogsHistory(
    pipelineName: string,
    phaseName: string,
    appName: string,
    container: string,
    userGroups: string[],
  ) {
    const contextName = await this.pipelinesService.getContext(
      pipelineName,
      phaseName,
      userGroups,
    );
    const namespace = pipelineName + '-' + phaseName;

    let loglines: ILoglines[] = [];
    if (contextName) {
      const pods = await this.kubectl.getPods(namespace, contextName);
      for (const pod of pods) {
        if (pod.metadata?.name?.startsWith(appName)) {
          if (container == 'web') {
            for (const container of pod.spec?.containers || []) {
              // only fetch logs for the web container, exclude trivy and build jobs
              if (!pod.metadata?.labels?.['job-name']) {
                const ll = await this.fetchLogs(
                  namespace,
                  pod.metadata.name,
                  container.name,
                  pipelineName,
                  phaseName,
                  appName,
                );
                loglines = loglines.concat(ll);
              }
            }
          } else if (container == 'builder' || container == 'fetcher') {
            const ll = await this.fetchLogs(
              namespace,
              pod.metadata.name,
              'kuberoapp-' + container,
              pipelineName,
              phaseName,
              appName,
            );
            loglines = loglines.concat(ll);
          } else {
            // leace the loglines empty
            console.log('unknown container: ' + container);
          }
        }
      }
    }
    return loglines;
  }

  public async fetchLogs(
    namespace: string,
    podName: string,
    containerName: string,
    pipelineName: string,
    phaseName: string,
    appName: string,
  ): Promise<ILoglines[]> {
    const loglines: ILoglines[] = [];

    const logStream = new Stream.PassThrough();
    let logs: string = '';
    logStream.on('data', (chunk: any) => {
      //console.log(chunk.toString());
      logs += chunk.toString();
    });

    try {
      await this.kubectl.log.log(namespace, podName, containerName, logStream, {
        follow: false,
        tailLines: 80,
        pretty: false,
        timestamps: true,
      });
    } catch (_error) {
      console.log('error getting logs for ' + podName + ' ' + containerName);
      return [];
    }

    // sleep for 1 second to wait for all logs to be collected
    await new Promise((r) => setTimeout(r, 300));

    // split loglines into array
    const loglinesArray = logs.split('\n').reverse();
    for (const logline of loglinesArray) {
      if (logline.length > 0) {
        // split after first whitespace
        const loglineArray = logline.split(/(?<=^\S+)\s/);
        const loglineDate = new Date(loglineArray[0]);
        const loglineText = loglineArray[1];

        loglines.push({
          id: uuidv4(),
          time: loglineDate.getTime(),
          pipeline: pipelineName,
          phase: phaseName,
          app: appName,
          pod: podName,
          podID: podName.split('-')[3] + '-' + podName.split('-')[4],
          container: containerName,
          color: this.logcolor(podName),
          log: loglineText,
        });
      }
    }

    return loglines;
  }
}
