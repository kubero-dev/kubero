<template>
  <v-form v-model="valid">
    <v-container>
      <v-row>
        <v-col cols="12" sm="12" md="12" lg="12" xl="12">
            <h2>
                Create a new Pipeline
            </h2>
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
        <v-tabs icons-and-text v-model="repotab" color="#8560A9">
            <v-tab href="#tab-github">Github <v-icon>mdi-github</v-icon> </v-tab>
            <v-tab href="#tab-gitlab">Gitlab <v-icon>mdi-gitlab</v-icon></v-tab>
            <v-tab href="#tab-bitbucket" disabled>Bitbucket <v-icon>mdi-bitbucket</v-icon></v-tab>
        </v-tabs>

        <v-tabs-items v-model="repotab">
          <v-tab-item
            key="1"
            value="tab-github"
          >

            <v-card flat>
              <v-card-text>
                <v-text-field
                  v-model="gitrepo"
                  :rules="repositoryRules"
                  :counter="60"
                  label="Repository"
                  :disabled="gitrepo_connected"
                  required
                ></v-text-field>
                <v-container
                  v-if="!gitrepo_connected"
                >
                  <v-btn
                      color="primary"
                      elevation="2"
                      @click="connectGithub()"
                      >Connect</v-btn>
                </v-container>
                <v-container
                  v-if="gitrepo_connected"
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
                </v-container>
              </v-card-text>
            </v-card>

          </v-tab-item>
        </v-tabs-items>




        <v-tabs-items v-model="repotab">
          <v-tab-item
            key="2"
            value="tab-gitlab"
          >
            <v-card flat>
              <v-card-text>
                <v-text-field
                  v-model="gitrepo"
                  :rules="repositoryRules"
                  :counter="60"
                  label="Repository"
                  :disabled="gitrepo_connected"
                  required
                ></v-text-field>
                
                  <v-alert class="alert"
                    type="warning"
                    elevation="6"
                    transition="scale-transition"
                  >Not implemented yet
                  </v-alert>
              </v-card-text>
            </v-card>
          </v-tab-item>
        </v-tabs-items>
    
      
      
        </v-col>
      </v-row>

<!--
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
-->
      <v-row v-for="phase in phases" :key="phase.name">
        <v-col
          cols="12"
          md="2"
        >
          <v-switch
            v-model="phase.enabled"
            :label="phase.name"
          ></v-switch>
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <v-select
            v-model="phase.context"
            :items="contextList"
            label="Cluster"
            v-if="phase.enabled"
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
      repotab: null,
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
      phases: [
        {
          name: 'review',
          enabled: false,
          context: '',
        },
        {
          name: 'test',
          enabled: false,
          context: '',
        },
        {
          name: 'stage',
          enabled: false,
          context: '',
        },
        {
          name: 'production',
          enabled: true,
          context: '',
        },
      ],
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
              value: response.data[i].name,
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
        /*
        let phasesList = [];
        for (let key in this.phases) {
          phasesList.push({name: key, enabled: this.phases[key]});
        }
        console.log(phasesList);
        */
        axios.post(`/api/pipelines`, {
          pipelineName: this.pipelineName,
          gitrepo: this.gitrepo,
          phases: this.phases,
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
//.v-card {
//  height: 100px;
//}
</style>