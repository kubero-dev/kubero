<template>
    <v-container>
        <v-row>
            <v-sheet
                width="100%"
                tile
                color="rgb(var(--v-theme-background))"
            >
                <div class="mb-5">
                    <h1>{{ appData.spec.name }}</h1>
                    <v-table density="compact" style="background:rgb(var(--v-theme-background))" v-if="appData.spec.gitrepo != undefined">
                        <tbody>
                        <tr>
                            <th>Domain</th>
                            <td>{{ appData.spec.domain }}</td>
                        </tr>
                        <tr>
                            <th>Deployment Strategy</th>
                            <td>{{ appData.spec.deploymentstrategy }}</td>
                        </tr>
                        <tr v-if="appData.spec.deploymentstrategy == 'git' && appData.spec.deploymentstrategy == 'plain'">
                            <th>Buildpack</th>
                            <td>{{ appData.spec.buildpack }}</td>
                        </tr>
                        <tr v-if="appData.spec.deploymentstrategy == 'git'">
                            <th>Build Strategy</th>
                            <td>{{ appData.spec.buildstrategy }}</td>
                        </tr>
                        <tr v-if="appData.spec.deploymentstrategy == 'git'">
                            <th>Git Repo</th>
                            <td><a :href="appData.spec.gitrepo.clone_url" target="_blank">{{ appData.spec.gitrepo.clone_url }}:{{ appData.spec.branch }}</a></td>
                        </tr>
                        <tr v-if="appData.spec.deploymentstrategy == 'git'">
                            <th>Autodeploy</th>
                            <td>{{ appData.spec.autodeploy }}</td>
                        </tr>
                        <tr>
                            <th>Pod Size</th>
                            <td>{{ appData.spec.podsize.description }}</td>
                        </tr>
                        <tr>
                            <th>Autoscale</th>
                            <td>{{ appData.spec.autoscale }}</td>
                        </tr>
                        <tr>
                            <th>Web Replicas</th>
                            <td>{{ appData.spec.web.replicaCount }}</td>
                        </tr>
                        <tr>
                            <th>Worker Replicas</th>
                            <td>{{ appData.spec.worker.replicaCount }}</td>
                        </tr>
                        </tbody>
                    </v-table>
                    <!--
                    <div><b>Deployment Strategy : </b>{{ appData.spec.deploymentstrategy }}</div>
                    <div><b>Domain : </b>{{ appData.spec.ingress.hosts[0].host }}</div>
                    <div><b>podsize : </b>{{ appData.spec.podsize.description }}</div>
                    <div><b>autoscale : </b>{{ appData.spec.autoscale }}</div>
                    <div><b>web : </b>{{ appData.spec.web.replicaCount }}</div>
                    <div><b>worker : </b>{{ appData.spec.worker.replicaCount }}</div>
                    -->
                </div>
                <div class="mb-3">
                    <h3>Consumption</h3>
                </div>
                <div class="px-5" v-if="metricsDisplay == 'bars'">
                    <v-row>
                        <v-col cols="6" class="pb-0 text-left text-caption font-weight-light">CPU</v-col>
                        <v-col cols="6" class="pb-0 text-right text-caption font-weight-light">Memory</v-col>
                    </v-row>
                    <v-row v-for="metric in metrics" :key="metric.name" style="height:20px">
                        <v-col cols="6" class="text-left"><v-progress-linear :value="metric.cpu.percentage" color="#8560A9" class="mr-6 float-left"></v-progress-linear></v-col>
                        <v-col cols="6" class="text-right"><v-progress-linear :value="metric.memory.percentage" color="#8560A9" class="float-left" ></v-progress-linear></v-col>
                    </v-row>
                </div>
                <div class="px-5" v-if="metricsDisplay == 'table'">
                    <v-row>
                        <v-col cols="8" class="pb-0 text-left text-caption font-weight-light">Pod</v-col>
                        <v-col cols="2" class="pb-0 text-left text-caption font-weight-light">CPU</v-col>
                        <v-col cols="2" class="pb-0 text-right text-caption font-weight-light">Memory</v-col>
                    </v-row>
                    <v-row v-for="metric in metrics" :key="metric.name" id="metrics">
                        <v-col cols="8" class="py-0 text-left">{{metric.name}}</v-col>
                        <v-col cols="2" class="py-0 text-left">{{metric.cpu.usage}}{{metric.cpu.unit}}</v-col>
                        <v-col cols="2" class="py-0 text-right">{{metric.memory.usage}}{{metric.memory.unit}}</v-col>
                    </v-row>
                </div>
                <div class="mb-5 mt-10">
                    <h3>Environment Variables</h3>
                    <v-table density="compact" style="background:rgb(var(--v-theme-background))">
                        <thead>
                        <tr>
                            <th class="text-left">
                            Name
                            </th>
                            <th class="text-left">
                            Value
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr
                            v-for="envVar in appData.spec.envVars" :key="envVar.name">
                            <td>{{ envVar.name }}</td>
                            <td>{{ envVar.value }}</td>
                        </tr>
                        </tbody>
                    </v-table>
                </div>
                <div class="mb-5">
                    <h3>Volumes</h3>
                    <!--{{ appData.spec.extraVolumes }}-->
                    <v-row class="pt-5">
                        <v-col 
                        v-for="volume in appData.spec.extraVolumes" :key="volume.name"
                        cols="12"
                        md="6"
                        >
                            <v-card
                            :title="volume.name"
                            :subtitle="volume.mountPath"
                            class="mx-auto"
                            color="cardBackground"
                            >
                                <v-row>
                                    <v-col class="center" style="width: 40px; flex-grow: 0;">
                                        <v-icon icon="mdi-harddisk" size="60" class="mx-auto"/>
                                    </v-col>
                                    <v-col>
                                        <v-card-text class="pt-0">
                                            <div><b>Size: </b>{{ volume.size }}</div>
                                            <div><b>Access Mode: </b>{{ volume.accessMode }}</div>
                                        </v-card-text>
                                    </v-col>
                                </v-row>
                            </v-card>
                        </v-col>
                    </v-row>
                </div>
                <div class="mb-5">
                    <h3>Cronjobs</h3>
                    <v-table density="compact" style="background:rgb(var(--v-theme-background))">
                        <thead>
                        <tr>
                            <th class="text-left">
                            Name
                            </th>
                            <th class="text-left">
                            Schedule
                            </th>
                            <th class="text-left">
                            Command
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr
                        v-for="cronjob in appData.spec.cronjobs" :key="cronjob.name">
                            <td>{{ cronjob.name }}</td>
                            <td>{{ cronjob.schedule }}</td>
                            <td>{{ cronjob.command.join(' ') }}</td>
                        </tr>
                        </tbody>
                    </v-table>
                </div>
                <div class="mb-5">
                    <h3>Addons</h3>
                    <Addons :addons="appData.spec.addons" :showButtons="false"/>
                </div>
            </v-sheet>
            
        </v-row>
    </v-container>
</template>

<script lang="ts">
import axios from "axios";
import { defineComponent } from 'vue'
//import { AppData } from '@/types/appData'
import Addons from './addons.vue'



interface GitRepo {
  admin: boolean;
  clone_url: string;
  ssh_url: string;
}

interface Resources {
  limits: {
    cpu: string;
    memory: string;
  };
  requests: {
    cpu: string;
    memory: string;
  };
}

interface PodSize {
  default: boolean;
  description: string;
  name: string;
  resources: Resources;
}

interface Autoscaling {
  maxReplicas: number;
  minReplicas: number;
  targetCPUUtilizationPercentage: number;
  targetMemoryUtilizationPercentage: number;
}

interface Web {
  autoscaling: Autoscaling;
  replicaCount: number;
}

interface Worker {
  autoscaling: Autoscaling;
  replicaCount: number;
}

interface SecurityContext {
  runAsUser: number;
  runAsGroup: number;
  allowPrivilegeEscalation: boolean;
  readOnlyRootFilesystem: boolean;
  runAsNonRoot: boolean;
  capabilities: {
    add: string[];
    drop: string[];
  };
}

interface Image {
  containerPort: number;
  pullPolicy: string;
  repository: string;
  tag: string;
  fetch: {
    readOnlyAppStorage: boolean;
    repository: string;
    securityContext: SecurityContext;
    tag: string;
  };
  build: {
    command: string;
    readOnlyAppStorage: boolean;
    repository: string;
    securityContext: SecurityContext;
    tag: string;
  };
  run: {
    command: string;
    readOnlyAppStorage: boolean;
    repository: string;
    securityContext: SecurityContext;
    tag: string;
  };
}

interface Host {
  host: string;
  paths: {
    path: string;
    pathType: string;
  }[];
}

interface Ingress {
  annotations: {};
  className: string;
  enabled: boolean;
  hosts: Host[];
  tls: any[];
}

interface ServiceAccount {
  annotations: {};
  create: boolean;
  name: string;
}

interface Spec {
  name: string;
  pipeline: string;
  phase: string;
  buildpack: string;
  deploymentstrategy: string;
  buildstrategy: string;
  gitrepo: GitRepo;
  branch: string;
  autodeploy: boolean;
  domain: string;
  podsize: PodSize;
  autoscale: boolean;
  envVars: any[];
  extraVolumes: any[];
  cronjobs: any[];
  addons: any[];
  web: Web;
  worker: Worker;
  affinity: {};
  autoscaling: {
    enabled: boolean;
  };
  fullnameOverride: string;
  image: Image;
  vulnerabilityscan: {
    enabled: boolean;
    image: {
      repository: string;
      tag: string;
    };
    schedule: string;
  };
  imagePullSecrets: any[];
  ingress: Ingress;
  nameOverride: string;
  nodeSelector: {};
  podAnnotations: {};
  podSecurityContext: {};
  replicaCount: number;
  resources: Resources;
  service: {
    port: number;
    type: string;
  };
  serviceAccount: ServiceAccount;
  tolerations: any[];
}

interface appDataa {
  resourceVersion: string;
  spec: Spec;
}

type appData = {
    resourceVersion: string,
    spec: {
        name: string,
        pipeline: string,
        phase: string,
        buildpack: string,
        deploymentstrategy: string,
        buildstrategy: string,
        gitrepo: GitRepo,
        branch: string,
        autodeploy: boolean,
        domain: string,
        podsize: PodSize,
        autoscale: boolean,
        envVars: any[],
        extraVolumes: any[],
        cronjobs: any[],
        addons: any[],
        web: Web,
        worker: Worker,
        affinity: {},
        autoscaling: {
            enabled: boolean,
        },
        fullnameOverride: string,
        image: Image,
        vulnerabilityscan: {
            enabled: boolean,
            image: {
                repository: string,
                tag: string,
            },
            schedule: string,
        },
        imagePullSecrets: any[],
        ingress: Ingress,
        nameOverride: string,
        nodeSelector: {},
        podAnnotations: {},
        podSecurityContext: {},
        replicaCount: number,
        resources: Resources,
        service: {
            port: number,
            type: string,
        },
        serviceAccount: ServiceAccount,
        tolerations: any[],
    }
}

type Metric = {
    name: string,
    cpu: {
        percentage: number,
        usage: number,
        unit: string,
    },
    memory: {
        percentage: number,
        usage: number,
        unit: string,
    }
}

export default defineComponent({
    props: {
        pipeline: {
            type: String,
            default: "MISSING"
        },
        phase: {
            type: String,
            default: "MISSING"
        },
        app: {
            type: String,
            default: "new"
        },
        appData: {
            type: Object,
            default: () => {}
        },
        pipelineData : {
            type: Object,
            default: () => {}
        },
    },
    data () {
        return {
            metrics: [] as Metric[],
            metricsDisplay: "bars",
            metricsInterval: 0 as any, // can't find the right type for this
        }
    },
    components: {
        Addons,
    },
    mounted() {
        this.loadMetrics();
        this.metricsInterval = setInterval(this.loadMetrics, 40000);
    },
    unmounted() {
        clearInterval(this.metricsInterval);
    },
    methods: {

        loadMetrics() {
            axios.get(`/api/metrics/${this.pipeline}/${this.phase}/${this.app}`)
            .then(response => {
                for (var i = 0; i < response.data.length; i++) {
                    if (response.data[i].cpu.percentage != null && response.data[i].memory.percentage != null) {
                        this.metricsDisplay = "table";
                    }
                    if (
                      (response.data[i].cpu.percentage == null && response.data[i].memory.percentage == null) &&
                      (response.data[i].cpu.usage != null && response.data[i].memory.usage != null)
                     ){
                        this.metricsDisplay = "table";
                    }
                }
                this.metrics = response.data;
            })
            .catch(error => {
                console.log(error);
            });
        },
    },
});
</script>

<style scoped>
#metrics:nth-child(even) {
  background-color: rgba(133, 96, 169, .1);
}
#metrics:nth-child(odd) {
  background-color: rgba(133, 96, 169, .2);
}

.theme--light#metrics:nth-child(odd) {
  background-color: rgba(133, 96, 169, .2);
}
.theme--dark#metrics:nth-child(odd) {
  background-color: rgba(133, 96, 169, .2);
}
</style>