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
      </v-window>

    </v-container>

  </v-form>
</template>

<script lang="ts">
import axios from "axios";
import { defineComponent } from 'vue'
import FormGeneral from './form-general.vue'
import FormPodsizes from './form-podsizes.vue'
import FormBuildpacks from './form-buildpacks.vue'

type PodSize = {
  name: string,
  description: string,
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

type Buildpack = {
  name: string,
  description: string,
  url: string,
  enabled: boolean,
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
        podSizeList: [] as PodSize[],
        buildpacks: [] as Buildpack[],
        templateCatalogs: [],
      }
    }),
    components: {
      FormGeneral,
      FormPodsizes,
      FormBuildpacks,
    },
    methods: {
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