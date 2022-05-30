<template>
  <v-form v-model="valid">
    <v-container>
      <v-row>
        <v-col cols="12" sm="12" md="12" lg="12" xl="12">
            <h2>
                Create a new App
            </h2>
            <p class="text-justify">
                A App
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
          <v-select
            :items="phases"
            label="Phase"
            value="production"
          ></v-select>
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
            :rules="repositoryRules"
            :counter="60"
            label="Repository"
            readonly
            required
            value="asdf/asdf"
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
      <v-row v-for="variable in envvars" v-bind:key="variable.value">
        <v-col
          cols="12"
          md="3"
        >
          <v-text-field
            v-model="variable.key"
            label="key"
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
            :items="podsize"
            label="Podsize"
            value="medium"
          ></v-select>
        </v-col>
      </v-row>
      <v-row>
        <v-col
          cols="12"
          md="6"
        >
          <v-slider
            v-model="webPodCount"
            label="Web Pods"
            hint="Im a hint"
            max="10"
            min="0"
            thumb-label="always"
          ></v-slider>
        </v-col>
      </v-row>
      <v-row>
        <v-col
          cols="12"
          md="6"
        >
          <v-slider
            v-model="workerPodCount"
            label="Worker Pods"
            hint="Im a hint"
            max="10"
            min="0"
            thumb-label="always"
          ></v-slider>
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
                >Sumbit</v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script>
import axios from "axios";
export default {
    data: () => ({
      valid: false,
      appname: '',
      phases: [
        { text: 'Production', value: 'production' },
        { text: 'Staging', value: 'staging' },
        { text: 'Testing', value: 'testing' },
      ],
      gitrepo: '',
      branch: '',
      autodeploy: true,
      domain: '',
      envvars: [
        { key: '', value: '' },
      ],
      podsize: [
        { text: 'Small (0.2m cpu, 0.5g ram)', value: 'small' },
        { text: 'Medium (0.5m cpu, 1g ram)', value: 'medium' },
        { text: 'Large (1m cpu, 1.5g ram)', value: 'large' },
        { text: 'XLarge (2m cpu, 2.5g ram)', value: 'xlarge' },
      ],
      webPodCount: 0,
      workerPodCount: 0,
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
    methods: {
      saveForm() {
        axios.post(`/api/apps`, {
          appname: this.appname,
          gitrepo: this.gitrepo,
          phases: this.phases,
          branch: this.branch,
          autodeploy: this.autodeploy,
          domain: this.domain,
          envvars: this.envvars,
          podsize: this.podsize,

        })
        .then(response => {
          this.appname = '';
          console.log(response);
          this.$router.push({path: '/'});
        })
        .catch(error => {
          console.log(error);
        });
      },
      addEnvLine() {
        this.envvars.push({
          key: '',
          value: '',
        });
      },
    },
}
</script>

<style lang="scss">
</style>