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
        <v-tab value="secrets">Secrets</v-tab>
        <v-tab value="templates">Templates</v-tab>
        <v-tab value="notifications" disabled>Notifications</v-tab>
      </v-tabs>


      <v-window v-model="tab">
        <v-window-item value="general">
          <FormGeneral :settings="settings"></FormGeneral>
        </v-window-item>

        <v-window-item value="podsizes">
          <FormPodsizes :settings="settings"></FormPodsizes>
        </v-window-item>

        <v-window-item value="buildpacks">
          <FormBuildpacks :settings="settings"></FormBuildpacks>
        </v-window-item>

        <v-window-item value="secrets">
          <FormSecrets :settings="settings"></FormSecrets>
        </v-window-item>

        <v-window-item value="templates">
          <FormTemplates :settings="settings"></FormTemplates>
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
import FormSecrets from './form-secrets.vue'
import FormTemplates from './form-templates.vue'

// Types 
import  { Kubero } from './form-general.vue'
import  { PodSize } from './form-podsizes.vue'
import  { Buildpack } from './form-buildpacks.vue'

export type Settings = {
  env: {
    KUBERO_NAMESPACE : string,
    KUBERO_WEBHOOK_SECRET : string,
    KUBERO_WEBHOOK_URL: string,
    GITEA_BASEURL: string,
    GITEA_PERSONAL_ACCESS_TOKEN: string,
    GOGS_BASEURL: string,
    GOGS_PERSONAL_ACCESS_TOKEN: string,
    GITLAB_BASEURL: string,
    GITLAB_PERSONAL_ACCESS_TOKEN: string,
    BITBUCKET_USERNAME: string,
    BITBUCKET_APP_PASSWORD: string,
    GITHUB_PERSONAL_ACCESS_TOKEN: string,
  },
  kubero: Kubero,
  podSizeList: PodSize[],
  buildpacks: Buildpack[],
  templates: {
    enabled: boolean,
    catalogs: Catalog[]
  }
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
        env: {
          KUBERO_NAMESPACE : "",
          KUBERO_WEBHOOK_SECRET : "",
          KUBERO_WEBHOOK_URL: "",
          GITEA_BASEURL: "",
          GITEA_PERSONAL_ACCESS_TOKEN: "",
          GOGS_BASEURL: "",
          GOGS_PERSONAL_ACCESS_TOKEN: "",
          GITLAB_BASEURL: "",
          GITLAB_PERSONAL_ACCESS_TOKEN: "",
          BITBUCKET_USERNAME: "",
          BITBUCKET_APP_PASSWORD: "",
          GITHUB_PERSONAL_ACCESS_TOKEN: "",
        },
        kubero: {
          readonly: false,
          console: {
            enabled: false,
          },
          banner: {
            show: false,
            bgcolor: "",
            fontcolor: "",
            message: "",
          }
        } as Kubero,
        podSizeList: [] as PodSize[],
        buildpacks: [] as Buildpack[],
        templates: {
          enabled: false,
          catalogs: [] as Catalog[],
        }
      } as Settings
    }),
    components: {
      FormGeneral,
      FormPodsizes,
      FormBuildpacks,
      FormSecrets,
      FormTemplates,
    },
    methods: {
      saveSettings() {
        const self = this;

        self.settings.podSizeList.forEach((podSize: PodSize) => {
          delete podSize.editable;
        });

        self.settings.buildpacks.forEach((buildpack: Buildpack) => {
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
/*
      sanitizeBuildpacks() {
        const self = this;
        self.settings.buildpacks.forEach((buildpack: Buildpack) => {
          buildpack.fetch.readOnlyAppStorage = buildpack.fetch.readOnlyAppStorage || false;
          buildpack.fetch.securityContext.readOnlyRootFilesystem = buildpack.fetch.securityContext.readOnlyRootFilesystem || false;
          buildpack.fetch.securityContext.allowPrivilegeEscalation = buildpack.fetch.securityContext.allowPrivilegeEscalation || false;
          buildpack.fetch.securityContext.runAsNonRoot = buildpack.fetch.securityContext.runAsNonRoot || false;
        });
      },
*/
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