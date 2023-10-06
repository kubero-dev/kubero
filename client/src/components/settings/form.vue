<template>
  <v-form>
    <v-container>
      <v-row>
        <v-col cols="12" sm="12" md="12" lg="12" xl="12">
            <h2>
                General Kubero Settings
            </h2>
            <p class="text-justify">
                Currently ready only
            </p>
        </v-col>
      </v-row>

      <v-row>
        <v-col
          cols="12"
          md="6"
        >
          <v-text-field
            v-model="settings.env.KUBERO_NAMESPACE"
            label="Kubero Namespace"
            required
            readonly
          ></v-text-field>
        </v-col>
      </v-row>

      <v-divider class="ma-5"></v-divider>
      <h4 class="text-uppercase">Webhooks</h4>
      <v-row>
        <v-col
            cols="12"
            md="6"
        >
            <v-text-field
            v-model="settings.env.KUBERO_WEBHOOK_SECRET"
            label="Webhook Secret"
            required
            readonly
            :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
            :type="show ? 'text' : 'password'"
            @click:append="show = !show"
            ></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col
            cols="12"
            md="6"
        >
            <v-text-field
            v-model="settings.env.KUBERO_WEBHOOK_URL"
            label="Webhook URL"
            required
            readonly
            ></v-text-field>
        </v-col>
      </v-row>

      <v-divider class="ma-5"></v-divider>
      <h4 class="text-uppercase">Github</h4>
      <v-row>
        <v-col
            cols="12"
            md="6"
        >
            <v-text-field
            v-model="settings.env.GITHUB_PERSONAL_ACCESS_TOKEN"
            label="github personal access token"
            required
            readonly
            :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
            :type="show ? 'text' : 'password'"
            @click:append="show = !show"
            ></v-text-field>
        </v-col>
        <v-col
            cols="12"
            md="6"
        >Instructions on how to get a Personal access token from <a href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token" target="_blank">Github</a>
        </v-col>
      </v-row>

      <h4 class="text-uppercase">Gitea</h4>
      <v-row>
        <v-col
            cols="12"
            md="3"
        >
            <v-text-field
            v-model="settings.env.GITEA_BASEURL"
            label="Gitea Base URL"
            required
            readonly
            ></v-text-field>
        </v-col>
        <v-col
            cols="12"
            md="3"
        >
            <v-text-field
            v-model="settings.env.GITEA_PERSONAL_ACCESS_TOKEN"
            label="Gitea Personal Access Token"
            required
            readonly
            :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
            :type="show ? 'text' : 'password'"
            @click:append="show = !show"
            ></v-text-field>
        </v-col>
        <v-col
            cols="12"
            md="6"
        >Instructions on how to get a Personal access token for <a href="https://www.jetbrains.com/help/youtrack/cloud/integration-with-gitea.html#enable-youtrack-integration-gitea" target="_blank">Gitea</a>
        </v-col>
      </v-row>

      <h4 class="text-uppercase">Gogs</h4>
      <v-row>
        <v-col
            cols="12"
            md="3"
        >
            <v-text-field
            v-model="settings.env.GOGS_BASEURL"
            label="Gogs Base URL"
            required
            readonly
            ></v-text-field>
        </v-col>
        <v-col
            cols="12"
            md="3"
        >
            <v-text-field
            v-model="settings.env.GOGS_PERSONAL_ACCESS_TOKEN"
            label="Gogs Personal Access Token"
            required
            readonly
            :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
            :type="show ? 'text' : 'password'"
            @click:append="show = !show"
            ></v-text-field>
        </v-col>
      </v-row>

      <h4 class="text-uppercase">Gitlab</h4>
      <v-row>
        <v-col
            cols="12"
            md="3"
        >
            <v-text-field
            v-model="settings.env.GITLAB_BASEURL"
            label="Gitlab Base URL"
            required
            readonly
            ></v-text-field>
        </v-col>
        <v-col
            cols="12"
            md="3"
        >
            <v-text-field
            v-model="settings.env.GITLAB_PERSONAL_ACCESS_TOKEN"
            label="Gitlab Personal Access Token"
            required
            readonly
            :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
            :type="show ? 'text' : 'password'"
            @click:append="show = !show"
            ></v-text-field>
        </v-col>
      </v-row>

      <h4 class="text-uppercase">Bitbucket</h4>
      <v-row>
        <v-col
            cols="12"
            md="3"
        >
            <v-text-field
            v-model="settings.env.BITBUCKET_USERNAME"
            label="Bitbucket Username"
            required
            readonly
            ></v-text-field>
        </v-col>
        <v-col
            cols="12"
            md="3"
        >
            <v-text-field
            v-model="settings.env.BITBUCKET_APP_PASSWORD"
            label="Bitbucket App Password"
            required
            readonly
            :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
            :type="show ? 'text' : 'password'"
            @click:append="show = !show"
            ></v-text-field>
        </v-col>
      </v-row>


      <v-divider class="ma-5"></v-divider>
      <h4 class="text-uppercase">Podsizes</h4>
      <div v-for="podSize in settings.podSizeList" :key="podSize.name">

      <v-row>
        <v-col
            cols="12"
            md="2"
        >
            <v-text-field
            v-model="podSize.name"
            label="Name"
            required
            readonly
            ></v-text-field>
        </v-col>
        <v-col
            cols="12"
            md="4"
        >
            <v-text-field
            v-model="podSize.description"
            label="Description"
            required
            readonly
            ></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col
            cols="12"
            md="2"
            class="d-flex align-center v-label theme--light"
        >Request
        </v-col>
        <v-col
            cols="12"
            md="2"
            v-if="podSize.resources.requests"
        >
            <v-text-field
            v-if="podSize.resources.requests.memory"
            v-model="podSize.resources.requests.memory"
            label="Memory"
            required
            readonly
            ></v-text-field>
        </v-col>
        <v-col
            cols="12"
            md="2"
        >
            <v-text-field
            v-if="podSize.resources.requests.cpu"
            v-model="podSize.resources.requests.cpu"
            label="CPU"
            required
            readonly
            ></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col
            cols="12"
            md="2"
            class="d-flex align-center v-label theme--light"
        >Limits
        </v-col>
        <v-col
            cols="12"
            md="2"
            v-if="podSize.resources.limits"
        >
            <v-text-field
            v-if="podSize.resources.limits.memory"
            v-model="podSize.resources.limits.memory"
            label="Memory"
            required
            readonly
            ></v-text-field>
        </v-col>
        <v-col
            cols="12"
            md="2"
            v-if="podSize.resources.limits"
        >
            <v-text-field
            v-if="podSize.resources.limits.cpu"
            v-model="podSize.resources.limits.cpu"
            label="CPU"
            required
            readonly
            ></v-text-field>
        </v-col>
      </v-row>
      <div style="height:50px"> </div>
    </div>
    </v-container>

  </v-form>
</template>

<script>
import axios from "axios";
export default {
    sockets: {
    },
    mounted() {
      this.loadSettings();
    },
    data: () => ({
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
        podSizeList: [],
        buildpacks: [],
        templateCatalogs: [],
      }
    }),
    components: {
    },
    methods: {
      async loadSettings() {
        const self = this;
        axios.get(`/api/settings`)
        .then(response => {
            self.settings = response.data;
        })
        .catch(error => {
            console.log(error);
        });
      }
    },
}
</script>

<style lang="scss">
</style>