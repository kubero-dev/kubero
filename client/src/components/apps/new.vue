<template>
  <v-form v-model="valid">
    <v-container>
      <v-row>
        <v-col cols="12" sm="12" md="12" lg="12" xl="12">
            <h2>
                Create a new App in {{ this.pipeline }}
            </h2>
            <p class="text-justify">
                in phase {{ this.phase }}
            </p>
        </v-col>
      </v-row>
      <v-row>
        <v-col
          cols="12"
          md="6"
        >
          <v-text-field
            v-model="appname"
            :rules="nameRules"
            :counter="60"
            label="App name"
            required
          ></v-text-field>
        </v-col>
      </v-row>

      <v-row>
        <v-col
          cols="12"
          md="6"
        >
          <v-text-field
            v-model="domain"
            :rules="domainRules"
            :counter="60"
            label="Domain"
            required
          ></v-text-field>
        </v-col>
      </v-row>

      <v-divider class="ma-5"></v-divider>
      <!-- DEPLOYMENT-->
      <h4 class="text-uppercase">Deployment</h4>

      <v-row>
        <v-col
          cols="12"
          md="6"
        >
          <v-text-field
            v-model="gitrepo"
            :rules="repositoryRules"
            :counter="60"
            label="Repository"
            readonly
            required
          >asdf</v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col
          cols="12"
          md="6"
        >
          <v-text-field
            v-model="branch"
            :rules="branchRules"
            :counter="60"
            label="Branch"
            required
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col
          cols="12"
          md="6"
        >
          <v-switch
            v-model="autodeploy"
            :label="`Autodeploy: ${autodeploy.toString()}`"
          ></v-switch>
        </v-col>
      </v-row>

      <v-divider class="ma-5"></v-divider>
      <!-- ENV VARS-->
      <h4 class="text-uppercase">Environment vars</h4>
      <v-row v-for="variable in envvars" v-bind:key="variable.id">
        <v-col
          cols="12"
          md="3"
        >
          <v-text-field
            v-model="variable.name"
            label="name"
            :counter="60"
          ></v-text-field>
        </v-col>
        <v-col
          cols="12"
          md="3"
        >
          <v-text-field
            v-model="variable.value"
            label="value"
            :counter="60"
          ></v-text-field>
        </v-col>
      </v-row>

      <v-row>
        <v-col
          cols="12"
        >
          <v-btn
          elevation="2"
          icon
          small
           @click="addEnvLine()"
          >
              <v-icon dark >
                  mdi-plus
              </v-icon>
          </v-btn>
        </v-col>
      </v-row>

      <v-divider class="ma-5"></v-divider>
      <!-- PROVISIONING -->
      <h4 class="text-uppercase">Resources</h4>
      <v-row>
        <v-col
          cols="12"
          md="6"
        >
          <v-select
            v-model="podsize"
            :items="podsizes"
            label="Podsize"
          ></v-select>
        </v-col>
      </v-row>

      <v-row>
        <v-col
          cols="12"
          md="6"
        >
          <v-switch
            v-model="autoscale"
            :label="`Autoscale: ${autoscale.toString()}`"
          ></v-switch>
        </v-col>
      </v-row>

      <v-row v-if="!autoscale">
        <v-col
          cols="12"
          md="6"
        >
          <v-slider
            v-model="webreplicas"
            label="Web Pods"
            hint="Im a hint"
            max="10"
            min="0"
            thumb-label="always"
          ></v-slider>
        </v-col>
      </v-row>
      <v-row v-if="!autoscale">
        <v-col
          cols="12"
          md="6"
        >
          <v-slider
            v-model="workerreplicas"
            label="Worker Pods"
            hint="Im a hint"
            max="10"
            min="0"
            thumb-label="always"
          ></v-slider>
        </v-col>
      </v-row>

      <v-row v-if="autoscale">
        <v-col
          cols="12"
          md="6"
        >
          <v-range-slider
            v-model="webreplicasrange"
            label="Web Pods"
            max="10"
            min="0"
            thumb-label="always"
          ></v-range-slider>
        </v-col>
      </v-row>

      <v-row v-if="autoscale">
        <v-col
          cols="12"
          md="6"
        >
          <v-range-slider
            v-model="workerreplicasrange"
            label="Worker Pods"
            max="10"
            min="0"
            thumb-label="always"
          ></v-range-slider>
        </v-col>
      </v-row>


      <!-- SUBMIT -->
      <v-row>
        <v-col
          cols="12"
          md="4"
        >
            <v-btn
                color="primary"
                elevation="2"
                @click="saveForm()"
                :disabled="!valid"
                >Create</v-btn>
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
            <v-btn
                color="error"
                v-if="app!='new'"
                elevation="2"
                @click="deleteApp()"
                >Delete</v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script>
import axios from "axios";
export default {
    props: {
      pipeline: {
        type: String,
        default: "MISSSING"
      },
      phase: {
        type: String,
        default: "MISSSING"
      },
      app: {
        type: String,
        default: "new"
      }
    },
    data: () => ({
      valid: false,
      appname: '',
      phases: [
        { text: 'Production', value: 'production' },
        { text: 'Staging', value: 'stage' },
        { text: 'Testing', value: 'test' },
      ],
      gitrepo: 'asdf/asdf', //TODO: load it from somewhere
      branch: '',
      autodeploy: true,
      domain: '',
      envvars: [
        { name: '', value: '' },
      ],
      podsize: '',
      podsizes: [
        { text: 'Small (0.2m cpu, 0.5g ram)', value: 'small' },
        { text: 'Medium (0.5m cpu, 1g ram)', value: 'medium' },
        { text: 'Large (1m cpu, 1.5g ram)', value: 'large' },
        { text: 'XLarge (2m cpu, 2.5g ram)', value: 'xlarge' },
      ],
      autoscale: false,
      webreplicas: 1,
      workerreplicas: 0,
      webreplicasrange: [1,3],
      workerreplicasrange: [0,0],
      nameRules: [
        v => !!v || 'Name is required',
        v => v.length <= 60 || 'Name must be less than 60 characters',
        v => /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(v) || 'Allowed characters : [a-zA-Z0-9_-]',
      ],
      repositoryRules: [
        v => !!v || 'Repository is required',
        v => v.length <= 60 || 'Repository must be less than 10 characters',
        v => /^[a-zA-Z0-9][a-zA-Z0-9_-]*\/[a-zA-Z0-9_-]+$/.test(v) || 'Format "owner/repository"',
      ],
      branchRules: [
        v => !!v || 'Branch is required',
        v => v.length <= 60 || 'Name must be less than 60 characters',
        v => /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(v) || 'Allowed characters : [a-zA-Z0-9_-]',
      ],
      domainRules: [
        v => !!v || 'Branch is required',
        v => v.length <= 60 || 'Name must be less than 60 characters',
        v => /^([a-z0-9|-]+[a-z0-9]{1,}\.)*[a-z0-9|-]+[a-z0-9]{1,}\.[a-z]{2,}$/.test(v) || 'Not a domain',
      ],
    }),
    mounted() {
        this.loadApp();
    },
    methods: {
      deleteApp() {
        axios.delete(`/api/pipelines/${this.pipeline}/${this.phase}/${this.app}`)
          .then(response => {
            this.$router.push(`/pipeline/${this.pipeline}/apps`);
            console.log(response);
          })
          .catch(error => {
            console.log(error);
          });
      },
      loadApp() {
        if (this.app !== 'new') {
          axios.get(`/api/pipelines/${this.pipeline}/${this.phase}/${this.app}`).then(response => {
            this.appname = response.data.name;
            this.gitrepo = response.data.gitrepo;
            this.branch = response.data.branch;
            this.autodeploy = response.data.autodeploy;
            this.domain = response.data.domain;
            this.envvars = response.data.envvars;
            this.podsize = response.data.podsize;
            this.autoscale = response.data.autoscale;
            this.webreplicas = response.data.webreplicas;
            this.workerreplicas = response.data.workerreplicas;
            this.webreplicasrange = response.data.webreplicasrange;
            this.workerreplicasrange = response.data.workerreplicasrange;
          });
        }
      },
      saveForm() {
        axios.post(`/api/apps`, {
          pipeline: this.pipeline,
          phase: this.phase,
          appname: this.appname.toLowerCase(),
          gitrepo: this.gitrepo,
          branch: this.branch,
          autodeploy: this.autodeploy,
          domain: this.domain.toLowerCase(),
          envvars: this.envvars,
          podsize: this.podsize,
          autoscale: this.autoscale,
          webreplicas: this.webreplicas,
          workerreplicas: this.workerreplicas,
          webreplicasrange: this.webreplicasrange,
          workerreplicasrange: this.workerreplicasrange,

        })
        .then(response => {
          this.appname = '';
          console.log(response);
          this.$router.push({path: '/pipeline/' + this.pipeline + '/apps'});
        })
        .catch(error => {
          console.log(error);
        });
      },
      addEnvLine() {
        this.envvars.push({
          name: '',
          value: '',
        });
      },
    },
}
</script>

<style lang="scss">
</style>