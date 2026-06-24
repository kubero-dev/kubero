import { Injectable, Logger } from '@nestjs/common';
import { GithubApi } from './git/github';
import { BitbucketApi } from './git/bitbucket';
import { GiteaApi } from './git/gitea';
import { GogsApi } from './git/gogs';
import { GitlabApi } from './git/gitlab';
import { IPullrequest } from './git/types';
import { IWebhook } from './git/types';
import { INotification } from '../notifications/notifications.interface';
import { NotificationsService } from '../notifications/notifications.service';
import { AppsService } from '../apps/apps.service';

@Injectable()
export class RepoService {
  private readonly logger = new Logger(RepoService.name);
  private githubApi: GithubApi;
  private giteaApi: GiteaApi;
  private gogsApi: GogsApi;
  private gitlabApi: GitlabApi;
  private bitbucketApi: BitbucketApi;

  constructor(
    private notificationsService: NotificationsService,
    private appsService: AppsService,
  ) {
    this.giteaApi = new GiteaApi(
      process.env.GITEA_BASEURL as string,
      process.env.GITEA_PERSONAL_ACCESS_TOKEN as string,
    );
    this.gogsApi = new GogsApi(
      process.env.GOGS_BASEURL as string,
      process.env.GOGS_PERSONAL_ACCESS_TOKEN as string,
    );
    this.githubApi = new GithubApi(
      process.env.GITHUB_BASEURL as string,
      process.env.GITHUB_PERSONAL_ACCESS_TOKEN as string,
    );
    this.gitlabApi = new GitlabApi(
      process.env.GITLAB_BASEURL as string,
      process.env.GITLAB_PERSONAL_ACCESS_TOKEN as string,
    );
    this.bitbucketApi = new BitbucketApi(
      process.env.BITBUCKET_USERNAME as string,
      process.env.BITBUCKET_APP_PASSWORD as string,
    );
  }

  public async listReferences(
    repoProvider: string,
    repoB64: string,
  ): Promise<string[]> {
    //return this.git.listRepoBranches(repo, repoProvider);
    let ref: Promise<string[]> = new Promise((resolve, _reject) => {
      resolve([]);
    });

    const repo = Buffer.from(repoB64, 'base64').toString('ascii');

    switch (repoProvider) {
      case 'github':
        ref = this.githubApi.getReferences(repo);
        break;
      case 'gitea':
        ref = this.giteaApi.getReferences(repo);
        break;
      case 'gogs':
        ref = this.gogsApi.getReferences(repo);
        break;
      case 'gitlab':
        ref = this.gitlabApi.getReferences(repo);
        break;
      case 'bitbucket':
        ref = this.bitbucketApi.getReferences(repo);
        break;
      case 'onedev':
      default:
        break;
    }

    return ref;
  }

  public async listRepositoriesByProvider(repoProvider: string) {
    this.logger.debug('listRepos: ' + repoProvider);

    switch (repoProvider) {
      case 'github':
        return this.githubApi.listRepos();
      case 'gitea':
        return this.giteaApi.listRepos();
      case 'gogs':
        return this.gogsApi.listRepos();
      case 'gitlab':
        return this.gitlabApi.listRepos();
      case 'bitbucket':
        return this.bitbucketApi.listRepos();
      case 'onedev':
      default:
        return { error: 'unknown repo provider' };
    }
  }

  public async connectRepo(repoProvider: string, repoAddress: string) {
    this.logger.debug('connectRepo: ' + repoProvider + ' ' + repoAddress);

    switch (repoProvider) {
      case 'github':
        return this.githubApi.connectRepo(repoAddress);
      case 'gitea':
        return this.giteaApi.connectRepo(repoAddress);
      case 'gogs':
        return this.gogsApi.connectRepo(repoAddress);
      case 'gitlab':
        return this.gitlabApi.connectRepo(repoAddress);
      case 'bitbucket':
        return this.bitbucketApi.connectRepo(repoAddress);
      case 'onedev':
      default:
        return { error: 'unknown repo provider' };
    }
  }

  public async disconnectRepo(repoProvider: string, repoAddress: string) {
    this.logger.debug('disconnectRepo: ' + repoProvider + ' ' + repoAddress);

    switch (repoProvider) {
      case 'github':
        return this.githubApi.disconnectRepo(repoAddress);
      case 'gitea':
        return this.giteaApi.disconnectRepo(repoAddress);
      case 'gogs':
        return this.gogsApi.disconnectRepo(repoAddress);
      case 'gitlab':
        return this.gitlabApi.disconnectRepo(repoAddress);
      case 'bitbucket':
        return this.bitbucketApi.disconnectRepo(repoAddress);
      case 'onedev':
      default:
        return { error: 'unknown repo provider' };
    }
  }

  public async listBranches(
    repoProvider: string,
    repoB64: string,
  ): Promise<string[]> {
    //return this.git.listRepoBranches(repo, repoProvider);
    let branches: Promise<string[]> = new Promise((resolve, _reject) => {
      resolve([]);
    });

    const repo = Buffer.from(repoB64, 'base64').toString('ascii');

    switch (repoProvider) {
      case 'github':
        branches = this.githubApi.getBranches(repo);
        break;
      case 'gitea':
        branches = this.giteaApi.getBranches(repo);
        break;
      case 'gogs':
        branches = this.gogsApi.getBranches(repo);
        break;
      case 'gitlab':
        branches = this.gitlabApi.getBranches(repo);
        break;
      case 'bitbucket':
        branches = this.bitbucketApi.getBranches(repo);
        break;
      case 'onedev':
      default:
        break;
    }

    return branches;
  }

  public async listPullrequests(
    repoProvider: string,
    repoB64: string,
  ): Promise<IPullrequest[]> {
    //return this.git.listRepoBranches(repo, repoProvider);
    let pulls: Promise<IPullrequest[]> = new Promise((resolve, _reject) => {
      resolve([]);
    });

    const repo = Buffer.from(repoB64, 'base64').toString('ascii');

    switch (repoProvider) {
      case 'github':
        pulls = this.githubApi.getPullrequests(repo);
        break;
      case 'gitea':
        pulls = this.giteaApi.getPullrequests(repo);
        break;
      case 'gogs':
        pulls = this.gogsApi.getPullrequests(repo);
        break;
      case 'gitlab':
        pulls = this.gitlabApi.getPullrequests(repo);
        break;
      case 'bitbucket':
        pulls = this.bitbucketApi.getPullrequests(repo);
        break;
      case 'onedev':
      default:
        break;
    }

    return pulls;
  }

  public listRepositories() {
    const repositories = {
      github: false,
      gitea: false,
      gitlab: false,
      gogs: false,
      onedev: false,
      bitbucket: false,
      docker: true,
    };

    if (process.env.GITHUB_PERSONAL_ACCESS_TOKEN) {
      repositories.github = true;
    }

    if (process.env.GITEA_PERSONAL_ACCESS_TOKEN) {
      repositories.gitea = true;
    }

    if (process.env.GITLAB_PERSONAL_ACCESS_TOKEN) {
      repositories.gitlab = true;
    }

    if (process.env.GOGS_PERSONAL_ACCESS_TOKEN) {
      repositories.gogs = true;
    }

    if (process.env.ONEDEV_PERSONAL_ACCESS_TOKEN) {
      repositories.onedev = true;
    }

    if (process.env.BITBUCKET_USERNAME && process.env.BITBUCKET_APP_PASSWORD) {
      repositories.bitbucket = true;
    }

    return repositories;
  }

  public async handleWebhook(
    repoProvider: string,
    //event: string,
    //delivery: string,
    //signature: string,
    headers: any,
    body: any,
  ) {
    this.logger.debug('handleWebhook: ' + repoProvider);

    let webhook: boolean | IWebhook = false;
    let event: string;
    let delivery: string;
    let signature: string;

    switch (repoProvider) {
      case 'github':
        event = headers['x-github-event'];
        delivery = headers['x-github-delivery'];
        signature = headers['x-hub-signature-256'];
        webhook = this.githubApi.getWebhook(event, delivery, signature, body);
        break;
      case 'gitea':
        event = headers['x-gitea-event'];
        delivery = headers['x-gitea-delivery'];
        signature = headers['x-hub-signature-256'];
        webhook = this.giteaApi.getWebhook(event, delivery, signature, body);
        break;
      case 'gogs':
        event = headers['x-gogs-event'];
        delivery = headers['x-gogs-delivery'];
        signature = headers['x-gogs-signature'];
        webhook = this.gogsApi.getWebhook(event, delivery, signature, body);
        break;
      case 'gitlab':
        event = headers['x-gitlab-event'];
        delivery = headers['x-gitlab-event-uuid'];
        signature = headers['x-gitlab-token'];
        break;
      case 'bitbucket':
        event = headers['x-event-key'];
        delivery = headers['x-request-uuid'];
        webhook = this.bitbucketApi.getWebhook(event, delivery, body);
        break;
      default:
        this.logger.debug('unknown repoprovider: ' + repoProvider);
        return;
    }

    if (typeof webhook != 'boolean') {
      switch (webhook.event) {
        case 'push':
          this.handleWebhookPush(webhook);
          break;
        case 'pull_request':
          this.handleWebhookPullRequest(webhook);
          break;
        default:
          this.logger.debug('webhook event not handled: ' + event);
          break;
      }
    }
  }

  private async handleWebhookPush(webhook: IWebhook) {
    this.logger.debug('handleWebhookPush');
    const apps = await this.appsService.getAppsByRepoAndBranch(
      webhook.repo.ssh_url,
      webhook.branch,
    );

    for (const app of apps) {
      const m = {
        name: 'handleWebhookPush',
        user: '',
        resource: 'app',
        action: 'push',
        severity: 'normal',
        message:
          'Pushed code to branch: ' +
          webhook.branch +
          ' in ' +
          webhook.repo.ssh_url +
          ' for app: ' +
          app.name +
          ' in pipeline: ' +
          app.pipeline +
          ' phase: ' +
          app.phase,
        pipelineName: app.pipeline,
        phaseName: app.phase,
        appName: app.name,
        data: {
          app: app,
        },
      } as INotification;
      this.notificationsService.send(m);

      this.appsService.rebuildApp(app, ['admin']); // return all pipelines to search for the app
    }
  }

  private async handleWebhookPullRequest(webhook: IWebhook) {
    this.logger.debug('handleWebhookPullRequest');

    switch (webhook.action) {
      case 'opened':
      case 'reopened':
        this.appsService.createPRApp(
          webhook.branch,
          webhook.branch,
          webhook.repo.ssh_url,
          undefined,
          ['admin'], // return all pipelines to search for the app
        ); // "undefined" will create the app in all pipelines
        break;
      case 'closed':
        this.appsService.deletePRApp(
          webhook.branch,
          webhook.branch,
          webhook.repo.ssh_url,
          ['admin'], // return all pipelines to search for the app
        );
        break;
      default:
        console.log(
          'webhook pull request action not handled: ' + webhook.action,
        );
        break;
    }
  }
}
