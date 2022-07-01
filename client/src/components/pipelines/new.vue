<template>
  <v-form v-model="valid">
    <v-container>
      <v-row>
        <v-col cols="12" sm="12" md="12" lg="12" xl="12">
            <div class="subtitle-1">
                Create a new Pipeline
            </div>
            <p class="text-justify">
                A Pipeline may have several stages with apps
            </p>
        </v-col>
      </v-row>
      <v-row>
        <v-col
          cols="12"
          md="6"
        >
          <v-text-field
            v-model="pipelineName"
            :rules="nameRules"
            :counter="60"
            label="Pipeline name"
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
            v-model="gitrepo"
            :rules="repositoryRules"
            :counter="60"
            label="Repository"
            :disabled="gitrepo_connected"
            required
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row
        v-if="!gitrepo_connected"
      >
        <v-col
          cols="12"
          md="6"
        >
            <v-btn
                color="primary"
                elevation="2"
                @click="connectGithub()"
                >Connect</v-btn>
        </v-col>
      </v-row>


      <v-row
        v-if="gitrepo_connected"
      >
        <v-col
          cols="12"
          md="4"
        >
              <v-alert class="alert"
                type="success"
                elevation="6"
                transition="scale-transition"
              >Webhook created
              </v-alert>
              <v-alert class="alert"
                type="success"
                elevation="6"
                transition="scale-transition"
              >Deploy keys added
              </v-alert>
        </v-col>
      </v-row>
      <v-row>
        <v-col
          cols="12"
          md="2"
        >
          <v-switch
            v-model="phases.reviewapps.enabled"
            label="Review Apps"
          ></v-switch>
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <v-select
            v-model="phases.reviewapps.context"
            :items="contextList"
            label="Cluster"
            v-if="phases.reviewapps.enabled"
          ></v-select>
        </v-col>
      </v-row>
      <v-row>
        <v-col
          cols="12"
          md="2"
        >
          <v-switch
            v-model="phases.test.enabled"
            label="Test"
          ></v-switch>
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <v-select
            v-model="phases.test.context"
            :items="contextList"
            label="Cluster"
            v-if="phases.test.enabled"
          ></v-select>
        </v-col>
      </v-row>
      <v-row>
        <v-col
          cols="12"
          md="2"
        >
          <v-switch
            v-model="phases.stage.enabled"
            label="Stage"
          ></v-switch>
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <v-select
            v-model="phases.stage.context"
            :items="contextList"
            label="Cluster"
            v-if="phases.stage.enabled"
          ></v-select>
        </v-col>
      </v-row>
      <v-row>
        <v-col
          cols="12"
          md="2"
        >
          <v-switch
            v-model="phases.production.enabled"
            label="Production"
            readonly
          ></v-switch>
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <v-select
            v-model="phases.production.context"
            :items="contextList"
            label="Cluster"
            v-if="phases.production.enabled"
          ></v-select>
        </v-col>
      </v-row>
      <v-row>

        <v-col
          cols="12"
          md="4"
        >
            <v-btn
                color="primary"
                elevation="2"
                @click="saveForm()"
                :disabled="!valid || !gitrepo_connected"
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
      pipelineName: '',
      reviewapps: true,
      gitrepo: 'git@github.com:kubero-dev/template-nodeapp.git', 
      gitrepo_connected: false,
      contextList: [],
      github: {
        repository: {},
        webhook: {},
      },
      phases: {
        reviewapps: {
          enabled: false,
          context: '',
        },
        test: {
          enabled: false,
          context: '',
        },
        stage: {
          enabled: false,
          context: '',
        },
        production: {
          enabled: true,
          context: '',
        },
      },
      nameRules: [
        v => !!v || 'Name is required',
        v => v.length <= 60 || 'Name must be less than 10 characters',
        v => /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(v) || 'Allowed characters : [a-zA-Z0-9_-]',
      ],
      repositoryRules: [ 
        v => !!v || 'Repository is required',
        v => v.length <= 60 || 'Repository must be less than 10 characters',
        //    ((git|ssh|http(s)?)|(git@[\w\.]+))(:(//)?)([\w\.@\:/\-~]+)(\.git)(/)?
        v => /((git|ssh|http(s)?)|(git@[\w.]+))(:(\/\/)?)([\w.@:/\-~]+)(\.git)(\/)?/.test(v) || 'Format "owner/repository"',
      ],
    }),
    mounted() {
      this.getContextList();
    },
    methods: {
      getContextList() {
        axios.get('/api/config/k8s/context').then(response => {
          for (let i = 0; i < response.data.length; i++) {
            this.contextList.push({
              text: response.data[i].name,
              value: response.data[i],
            });
          }
        });
      },
      connectGithub() {
        axios.post('/api/github/connect', {
          gitrepo: this.gitrepo
        }).then(response => {
          console.log(response.data);
          
          //TODO check if connectiondata is valid
          this.github.repository = response.data.repository.data;
          this.github.webhook = response.data.webhook.data;

          this.gitrepo_connected = true;
        }).catch(error => {
          console.log(error);
          //TODO show error message
        });
      },
      saveForm() {
        let phasesList = [];
        for (let key in this.phases) {
          phasesList.push({name: key, enabled: this.phases[key]});
        }
        console.log(phasesList);
        axios.post(`/api/pipelines`, {
          pipelineName: this.pipelineName,
          gitrepo: this.gitrepo,
          phases: phasesList,
          reviewapps: this.reviewapps,
          github: this.github
        })
        .then(response => {
          this.pipelineName = '';
          console.log(response);
          this.$router.push({path: '/'});
        })
        .catch(error => {
          console.log(error);
        });
      }
    },
}
</script>

<style lang="scss">
.alert i.v-icon.v-icon {
  color: white !important;
} 
</style>