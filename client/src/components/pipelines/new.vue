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
          md="8"
        >
        <v-tabs icons-and-text v-model="repotab" color="#8560A9">
            <v-tab href="#github" :disabled="this.repositoriesList.github == false">Github <v-icon>mdi-github</v-icon> </v-tab>
            <v-tab href="#gitea" :disabled="this.repositoriesList.gitea == false">Gitea <v-icon class="gitea"></v-icon></v-tab>
            <v-tab href="#gitlab" :disabled="this.repositoriesList.gitlab == false">Gitlab <v-icon>mdi-gitlab</v-icon></v-tab>
            <v-tab href="#bitbucket" disabled>oneDev <v-icon class="onedev"></v-icon></v-tab>
            <v-tab href="#bitbucket" disabled>Bitbucket <v-icon>mdi-bitbucket</v-icon></v-tab>
            <v-tab href="#docker" :disabled="this.repositoriesList.gitlab == false">Docker <v-icon>mdi-docker</v-icon></v-tab>
        </v-tabs>      
        </v-col>
      </v-row>

      <v-row 
        v-if="repotab && repotab=='docker'">
        <v-col
          cols="12"
          md="6"
        >
          <v-text-field
            v-model="dockerimage"
            :rules="imageRules"
            :counter="60"
            label="Image"
            required
          ></v-text-field>
        </v-col>
      </v-row>

      <v-row 
        v-if="repotab && repotab!='docker'">
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
        v-if="!gitrepo_connected && repotab && repotab!='docker'"
      >
        <v-col
          cols="12"
          md="6"
        >
            <v-alert
                v-show="gitrepo_error"
                outlined
                type="warning"
                prominent
                border="left"
                >{{gitrepo_error}}
            </v-alert>
            <v-btn
                color="primary"
                elevation="2"
                :disabled="!repotab"
                @click="connectRepo()"
                >Connect</v-btn>
        </v-col>
      </v-row>

      <v-row
        v-if="gitrepo_connected && repotab && repotab!='docker'"
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
          md="6"
        >
          <v-select
            v-model="buildpack"
            :items="buildpackList"
            label="Buildpack"
            @change="updateBuildpack"
          ></v-select>
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
                :disabled="!valid || (!gitrepo_connected && repotab!='docker')"
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
      repotab: 'github', //selected tab
      gitrepo_error: false, //error connecting to repo
      buildpack: undefined,
      buildpackList: [
        "Docker",
      ],
      valid: false, // final form validation
      pipelineName: '', 
      reviewapps: true,
      gitrepo: 'git@github.com:kubero-dev/template-nodeapp.git', // Git repository to connect with
      dockerimage: 'ghcr.io/kubero-dev/template-nodeapp', // docker image to pull from
      gitrepo_connected: false, // if git repo is connected
      contextList: [], // a list of kubernets contexts in the kubeconfig to select from
      repositoriesList: { // a list of available repositories to connect with
        github: false,
        gitea: false,
        gitlab: false,
        bitbucket: false,
        docker: true
      },
      github: { // the connected repository
        repository: {},
        webhook: {},
      },
      phases: [ // List of phases to enable
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
      imageRules: [
        v => !!v || 'Image is required'
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
      this.listRepositories();
      this.listBuildpacks();
    },
    methods: {
      updateBuildpack(buildpack) {
        this.buildpack = buildpack;
      },
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
      listRepositories() {
        axios.get('/api/config/repositories').then(response => {
          this.repositoriesList = response.data
        });
      },
      listBuildpacks() {
        axios.get('/api/config/buildpacks').then(response => {
          for (let i = 0; i < response.data.length; i++) {
            this.buildpackList.push({
              text: response.data[i].name,
              value: response.data[i],
            });
          }
        });
      },
      connectRepo() {
        console.log(this.gitrepo);
        console.log(this.repotab);
        switch (this.repotab) {
          case 'github':
            this.connectGithub();
            this.repositoriesList.gitea = false;
            this.repositoriesList.gitlab = false;
            this.repositoriesList.bitbucket = false;
            this.repositoriesList.docker = false;
            break;
          case 'gitea':
            this.connectGitea();
            this.repositoriesList.github = false;
            this.repositoriesList.gitlab = false;
            this.repositoriesList.bitbucket = false;
            this.repositoriesList.docker = false;
            break;
          case 'gitlab':
            this.connectGitlab();
            return;
            /*
            this.repositoriesList.gitea = false;
            this.repositoriesList.github = false;
            this.repositoriesList.bitbucket = false;
            this.repositoriesList.docker = false;
            break;
            */
          case 'bitbucket':
            this.connectBitbucket();
            return;
            /*
            this.repositoriesList.gitea = false;
            this.repositoriesList.gitlab = false;
            this.repositoriesList.github = false;
            this.repositoriesList.docker = false;
            break;
            */
          case 'docker':
            this.repositoriesList.github = false;
            this.repositoriesList.gitea = false;
            this.repositoriesList.gitlab = false;
            this.repositoriesList.bitbucket = false;
            this.repositoriesList.docker = true;
            this.buildpack = {
              name: "Docker",
              language: "unknown",
              repositories: {
                fetch: {
                  image: "ghcr.io/kubero-dev/docker-images/base",
                  tag: "main"
                },
                build: {
                  image: "node",
                  tag: "latest"
                },
                run: {
                  image: "node",
                  tag: "latest"
                }
              }
            }
            this.gitrepo_connected = true;
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

          console.log(response.data.repository.status);

          if (response.data.repository.status == 404)
            this.gitrepo_error = "Repository not found";
          else if (response.data.repository.status == 401)
            this.gitrepo_error = "Unauthorized";
          else if (response.data.repository.status == 200) {
            this.gitrepo_error = false;
            if (response.data.webhook.status == 200 || response.data.webhook.status == 201) 
              this.gitrepo_webhook = true;
            else
              this.gitrepo_webhook = false;

            this.gitrepo_connected = true;
          } else
            this.gitrepo_error = "Unknown error";
          
        }).catch(error => {
          console.log(error);
          this.gitrepo_error = "Failed to connect to repository";
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
          this.gitrepo_error = "Failed to connect to repository";
        });
      },
      connectGitlab() {
        alert('Gitlab not supported yet');
      },
      connectBitbucket() {
        alert('Bitbucket not supported yet');
      },
      saveForm() {
        let deploymentstrategy = "git"

        if (this.repotab == 'docker') {
          deploymentstrategy = "docker"
        }
        
        axios.post(`/api/pipelines`, {
          pipelineName: this.pipelineName,
          gitrepo: this.gitrepo,
          phases: this.phases,
          reviewapps: this.reviewapps,
          github: this.github,
          dockerimage: this.dockerimage,
          deploymentstrategy: deploymentstrategy,
          buildpack: this.buildpack,
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

.onedev{
    background-image: url('/img/icons/onedev.svg');
    background-size: contain;
    background-repeat: no-repeat;
    filter: invert(39%) sepia(47%) saturate(584%) hue-rotate(228deg) brightness(95%) contrast(80%);
    /*filter: invert(93%) sepia(49%) saturate(7411%) hue-rotate(184deg) brightness(87%) contrast(90%);*/
}

.onedev::before {
    height: 23px;
    width: 23px;
    visibility: hidden;
    content: "";
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