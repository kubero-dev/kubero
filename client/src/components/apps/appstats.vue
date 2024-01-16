<template>
    <v-container>
        <v-row>
            <v-sheet
                width="100%"
                tile
            >
                <div class="mb-5">
                    <h1>{{ appData.spec.name }}</h1>
                    <div><b>Deployment Strategy : </b>{{ appData.spec.deploymentstrategy }}</div>
                    <div><b>Domain : </b>{{ appData.spec.ingress.hosts[0].host }}</div>
                    <div><b>podsize : </b>{{ appData.spec.podsize.description }}</div>
                    <div><b>autoscale : </b>{{ appData.spec.autoscale }}</div>
                    <div><b>web : </b>{{ appData.spec.web.replicaCount }}</div>
                    <div><b>worker : </b>{{ appData.spec.worker.replicaCount }}</div>
                </div>
                <div class="mb-5">
                    <h3>ENV Vars</h3>
                    <v-table density="compact">
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
                    <v-table density="compact">
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

export default defineComponent({
    props: {
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
        }
    },
    components: {
        Addons,
    },
});
</script>