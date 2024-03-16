<template>
  <v-form>
    <v-container>


      <v-tabs
        v-model="tab"
        style="margin-bottom: 30px;"
      >
        <v-tab value="general">General</v-tab>
        <v-tab value="podsizes">Podsizes</v-tab>
        <v-tab value="buildpacks">Buildpacks</v-tab>
        <v-tab value="deployment">Deployment</v-tab>
        <v-tab value="templates">Templates</v-tab>
        <v-tab value="notifications" disabled>Notifications</v-tab>
      </v-tabs>


      <v-window v-model="tab">
        <v-window-item value="general">
          <FormGeneral :settings="settings.settings" :secrets="settings.secrets"></FormGeneral>
        </v-window-item>

        <v-window-item value="podsizes">
          <FormPodsizes :settings="settings.settings"></FormPodsizes>
        </v-window-item>

        <v-window-item value="buildpacks">
          <FormBuildpacks :settings="settings.settings"></FormBuildpacks>
        </v-window-item>

        <v-window-item value="deployment">
          <FormDeployment :settings="settings"></FormDeployment>
        </v-window-item>

        <v-window-item value="templates">
          <FormTemplates :settings="settings.settings"></FormTemplates>
        </v-window-item>
      </v-window>

      <v-btn
        color="primary"
        @click="saveSettings"
        style="margin-left: 10px; margin-top: 20px;"
      >update configuration</v-btn>

    </v-container>

  </v-form>
</template>

<script lang="ts">
import axios from "axios";
import { defineComponent } from 'vue'
import FormGeneral from './form-general.vue'
import FormPodsizes from './form-podsizes.vue'
import FormBuildpacks from './form-buildpacks.vue'
import FormDeployment from './form-deployment.vue'
import FormTemplates from './form-templates.vue'

// types & interfaces
export interface Secrets {
  GITHUB_PERSONAL_ACCESS_TOKEN: string;
  GITEA_PERSONAL_ACCESS_TOKEN: string;
  GITEA_BASEURL: string;
  GITLAB_PERSONAL_ACCESS_TOKEN: string;
  GITLAB_BASEURL: string;
  BITBUCKET_APP_PASSWORD: string;
  BITBUCKET_USERNAME: string;
  GOGS_PERSONAL_ACCESS_TOKEN: string;
  GOGS_BASEURL: string;
  KUBERO_WEBHOOK_SECRET: string;
  GITHUB_CLIENT_SECRET: string;
  OAUTH2_CLIENT_SECRET: string;
}


export interface Settings {
  settings: Kuberoes;
  secrets: Secrets;
  /*
  repositoryProviders: RepositoryProviders;
  webhook: Webhook;
  /*
  podSizeList?: (PodSize)[] | null;
  kubero: Kubero;
  buildpacks?: (Buildpack)[] | null;
  templates: Templates;
  auth: Auth;
  auditLogs: AuditLogs;
  env: Env;
*/
}
export interface Kuberoes {
  affinity: any;
  fullnameOverride: string;
  image: Image;
  imagePullSecrets?: (null)[] | null;
  ingress: Ingress;
  kubero: Kubero1;
  nameOverride: string;
  nodeSelector: any;
  podAnnotations: any;
  podSecurityContext: any;
  registry: Registry;
  replicaCount: number;
  resources: any;
  securityContext: any;
  service: Service;
  serviceAccount: ServiceAccount;
  tolerations?: (null)[] | null;
}

export interface Image {
  pullPolicy: string;
  repository: string;
  tag: string;
}
export interface Ingress {
  annotations: any;
  className: string;
  enabled: boolean;
  hosts?: (HostsEntity)[] | null;
  tls?: (null)[] | null;
}
export interface HostsEntity {
  host: string;
  paths?: (PathsEntity)[] | null;
}
export interface PathsEntity {
  path: string;
  pathType: string;
}
export interface Kubero1 {
  auditLogs: AuditLogs;
  auth: Auth1;
  config: Config;
  context: string;
  debug: string;
  namespace: string;
  sessionKey: string;
  webhook_url: string;
}
export interface AuditLogs {
  accessModes?: (string)[] | null;
  enabled: boolean;
  limit: string;
  size: string;
  storageClassName: string;
}
export interface Auth1 {
  github: Github;
  oauth2: Oauth2;
}
export interface Github {
  enabled: boolean;
  id: string;
  org: string;
  secret: string;
  callbackUrl: string;
}
export interface Console {
  enabled: boolean;
}
export interface Oauth2 {
  enabled: boolean;
  name: string;
  id: string;
  authUrl: string;
  tokenUrl: string;
  secret: string;
  callbackUrl: string;
  scopes: string;
}
export interface Config {
  buildpacks?: (Buildpack)[] | null;
  clusterissuer: string;
  kubero: Kubero;
  podSizeList?: (PodSize)[] | null;
  templates: Templates;
}
export type Buildpack = {
    advanced?: boolean,
    name: string,
    language: string,
    fetch: BuildpackStage,
    build: BuildpackStage,
    run: BuildpackStage
}
export type SecurityContext = {
    runAsUser: number
    runAsGroup: number
    runAsNonRoot: boolean
    readOnlyRootFilesystem: boolean
    allowPrivilegeEscalation: boolean
    capabilities: {
        add: string[]
        drop: string[]
    }
}
export type BuildpackStage = {
    repository: string,
    tag: string,
    command: string
    readOnlyAppStorage: boolean
    securityContext: SecurityContext
}

export interface Fetch {
  repository: string;
  securityContext: SecurityContext;
  tag: string;
}

export interface Build {
  command: string;
  repository: string;
  securityContext: SecurityContext;
  tag: string;
}
export interface Run {
  command: string;
  readOnlyAppStorage: boolean;
  repository: string;
  securityContext: SecurityContext;
  tag: string;
}
export interface Kubero {
  banner: Banner;
  console: Console;
  readonly: boolean;
}
export interface Banner {
  bgcolor: string;
  fontcolor: string;
  message: string;
  show: boolean;
}
export type PodSize = {
    name: string,
    description: string,
    editable?: boolean,
    default?: boolean,
    resources: {
        requests: {
            cpu: string,
            memory: string,
        },
        limits: {
            cpu: string,
            memory: string,
        }
    }
}

export interface Resources {
  requests: RequestsOrLimits;
  limits: RequestsOrLimits;
}
export interface RequestsOrLimits {
  memory: string;
  cpu: string;
}
export interface Templates {
  catalogs?: (CatalogsEntity)[] | null;
  enabled: boolean;
}
export interface CatalogsEntity {
  description: string;
  index: Index;
  name: string;
  templateBasePath: string;
}
export interface Index {
  format: string;
  url: string;
}
export interface Registry {
  account: Account;
  create: boolean;
  enabled: boolean;
  host: string;
  port: number;
  storage: string;
  storageClassName?: null;
}
export interface Account {
  hash: string;
  password: string;
  username: string;
}
export interface Service {
  port: number;
  type: string;
}
export interface ServiceAccount {
  annotations: any;
  create: boolean;
  name: string;
}
export interface Webhook {
  url: string;
  secret: string;
}
export interface Auth {
  github: Github1;
  oauth2: Oauth2;
}
export interface Github1 {
  enabled: boolean;
  id: string;
  secret: string;
  callbackUrl: string;
  org: string;
}
export interface Oauth2 {
  enabled: boolean;
  name: string;
  id: string;
  authUrl: string;
  tokenUrl: string;
  secret: string;
  callbackUrl: string;
  scopes: string;
}
export interface AuditLogs {
  enabled: boolean;
  storageClassName: string;
  accessModes?: (string)[] | null;
  size: string;
  limit: string;
}
export interface RepositoryProviders {
  github: Github2;
  gitea: GiteaOrGitlabOrGogs;
  gitlab: GiteaOrGitlabOrGogs;
  bitbucket: Bitbucket;
  gogs: GiteaOrGitlabOrGogs;
}
export interface Github2 {
  personalAccessToken: string;
}
export interface GiteaOrGitlabOrGogs {
  personalAccessToken: string;
  baseUrl: string;
}
export interface Bitbucket {
  personalAccessToken: string;
  username: string;
}

export type Catalog = {
  name: string,
  description: string,
  templateBasePath: string,
  index: {
    url: string,
    format: string
  }
}

export default defineComponent({
    sockets: {
    },
    mounted() {
      this.loadSettings();
    },
    data: () => ({
      tab: "general",
      show: false,
      settings: {
        secrets: {
          GITHUB_PERSONAL_ACCESS_TOKEN: '',
          GITEA_PERSONAL_ACCESS_TOKEN: '',
          GITEA_BASEURL: '',
          GITLAB_PERSONAL_ACCESS_TOKEN: '',
          GITLAB_BASEURL: '',
          GOGS_PERSONAL_ACCESS_TOKEN: '',
          GOGS_BASEURL: '',
          BITBUCKET_APP_PASSWORD: '',
          BITBUCKET_USERNAME: '',
          KUBERO_WEBHOOK_SECRET: '',
          GITHUB_CLIENT_SECRET: '',
          OAUTH2_CLIENT_SECRET: '',
        } as Secrets,
        settings: {
          affinity: {} as any,
          fullnameOverride: '' as string,
          image: {
            pullPolicy: '',
            repository: '',
            tag: '',
          } as Image,
          imagePullSecrets: [],
          ingress: {
            annotations: {},
            className: '',
            enabled: false,
            hosts: [],
            tls: [],
          } as Ingress,
          kubero: {
            namespace: '',
            auditLogs: {
              accessModes: ["ReadWriteOnce"],
              enabled: false,
              limit: '1000',
              size: '0.1Gi',
              storageClassName: '',
            } as AuditLogs,
            auth: {
              github: {
                enabled: false,
                id: '',
                secret: '',
                callbackUrl: '',
                org: '',
              } as Github,
              oauth2: {
                enabled: false,
                name: '',
                id: '',
                authUrl: '',
                tokenUrl: '',
                secret: '',
                callbackUrl: '',
                scopes: '',
              } as Oauth2,
            } as Auth1,
            config: {
              buildpacks: [] as Buildpack[],
              clusterissuer: '' as string,
              kubero: {
                banner: {
                  bgcolor: '',
                  fontcolor: '',
                  message: '',
                  show: false,
                } as Banner,
                console: {
                  enabled: false,
                } as Console,
                readonly: false,
              } as Kubero,
              podSizeList: [] as PodSize[],
              templates: {
                catalogs: [] as Catalog[],
                enabled: false,
              } as Templates,
            },
          },
          nameOverride: '',
          nodeSelector: {} as any,
          podAnnotations: {} as any,
          podSecurityContext: {} as any,
          registry: {
            account: {
              hash: '',
              password: '',
              username: '',
            },
            create: false,
            enabled: false,
            host: '',
            port: 0,
            storage: '',
            storageClassName: null,
          } as Registry,
          replicaCount: 0,
          resources: {} as any,
          securityContext: {} as any,
          service: {
            port: 0,
            type: '',
          } as Service,
          serviceAccount: {
            annotations: {} as any,
            create: false,
            name: '',
          } as ServiceAccount,
          tolerations: [] as any,
        },
      },
    }),
    components: {
      FormGeneral,
      FormPodsizes,
      FormBuildpacks,
      FormDeployment,
      FormTemplates,
    },
    methods: {
      saveSettings() {
        const self = this;

        self.settings.settings.kubero.config.podSizeList.forEach((podSize: PodSize) => {
          delete podSize.editable;
        });

        self.settings.settings.kubero.config.buildpacks.forEach((buildpack: Buildpack) => {
          delete buildpack.advanced;
        });

        axios.post(`/api/settings`, self.settings)
        .then(response => {
          console.log('saveSettings', response);
        })
        .catch(error => {
          console.log('saveSettings', error);
        });
      },
      async loadSettings() {
        const self = this;
        axios.get(`/api/settings`)
        .then(response => {
            self.settings = response.data;
        })
        .catch(error => {
            console.log('loadSettings', error);
        });
      }
    },
})
</script>

<style lang="scss">
</style>