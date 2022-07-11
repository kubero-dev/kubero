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
            <v-tab href="#tab-gitea">Gitea <v-icon class="gitea"></v-icon></v-tab>
            <v-tab href="#tab-gitlab" disabled>Gitlab <v-icon>mdi-gitlab</v-icon></v-tab>
            <v-tab href="#tab-bitbucket" disabled>Bitbucket <v-icon>mdi-bitbucket</v-icon></v-tab>
        </v-tabs>
<!--
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
            key="1"
            value="tab-gitea"
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
                      @click="connectGitea()"
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
    
      
-->
      
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
                @click="connectRepo()"
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
      connectRepo() {
        this.gitrepo_connected = true;
        console.log(this.gitrepo);
        console.log(this.repotab);
        switch (this.repotab) {
          case 'tab-github':
            this.connectGithub();
            break;
          case 'tab-gitea':
            this.connectGitea();
            break;
          case 'tab-gitlab':
            this.connectGitlab();
            break;
          case 'tab-bitbucket':
            this.connectBitbucket();
            break;
          default:
            break;
        }
      },
      connectGithub() {
        axios.post('/api/repo/github/connect', {
          gitrepo: this.gitrepo
        }).then(response => {
          //TODO check if connectiondata is valid
          this.github.repository = response.data.repository.data;
          this.github.webhook = response.data.webhook.data;

          this.gitrepo_connected = true;
        }).catch(error => {
          console.log(error);
          //TODO show error message
        });
      },
      connectGitea() {
        axios.post('/api/repo/gitea/connect', {
          gitrepo: this.gitrepo
        }).then(response => {
          //TODO check if connectiondata is valid
          this.github.repository = response.data.repository.data;
          this.github.webhook = response.data.webhook.data;

          this.gitrepo_connected = true;
        }).catch(error => {
          console.log(error);
          //TODO show error message
        });
      },
      connectGitlab() {
        alert('Gitlab not supported yet');
      },
      connectBitbucket() {
        alert('Bitbucket not supported yet');
      },
      saveForm() {
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

.gitea{
    background-image: url('/img/icons/gitea.svg');
    background-size: contain;
    background-repeat: no-repeat;
    filter: invert(39%) sepia(47%) saturate(584%) hue-rotate(228deg) brightness(95%) contrast(80%);
    /*filter: invert(93%) sepia(49%) saturate(7411%) hue-rotate(184deg) brightness(87%) contrast(90%);*/
}

.gitea::before {
    height: 23px;
    width: 23px;
    visibility: hidden;
    content: "";
}

</style>