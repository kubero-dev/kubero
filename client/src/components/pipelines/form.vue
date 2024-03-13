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
            label="Name *"
            :disabled="!newPipeline"
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
            label="FQDN domain"
          ></v-text-field>
        </v-col>
      </v-row>

      <v-row>
        <v-col
          cols="12"
          md="8"
        >
          <v-switch
            v-model="gitops"
            label="Connect pipeline to a Git repository (GitOps)"
            color="primary"
          ></v-switch>
        </v-col>
      </v-row>

      <v-row v-if="gitops">
        <v-col
          cols="12"
          md="8"
        >
        <v-tabs v-model="repotab" stacked centered @change="loadRepository">
            <v-tab value="github" :disabled="repositoriesList.github == false || !newPipeline"><v-icon class="mb-2 kubero">mdi-github</v-icon>Github</v-tab>
            <v-tab value="gitea" :disabled="repositoriesList.gitea == false || !newPipeline"><v-icon class="mb-2 gitea"></v-icon>Gitea</v-tab>
            <v-tab value="gitlab" :disabled="repositoriesList.gitlab == false || !newPipeline"><v-icon class="mb-2">mdi-gitlab</v-icon>Gitlab</v-tab>
            <!--<v-tab value="onedev" disabled>oneDev <v-icon class="mb-2 onedev"></v-icon></v-tab>-->
            <v-tab value="gogs" :disabled="repositoriesList.gogs == false || !newPipeline"><v-icon class="mb-2 gogs"></v-icon>Gogs</v-tab>
            <v-tab value="bitbucket" :disabled="repositoriesList.bitbucket == false || !newPipeline"><v-icon class="mb-2">mdi-bitbucket</v-icon>Bitbucket</v-tab>
        </v-tabs>
        </v-col>
      </v-row>

      <v-row v-if="gitops">
        <v-col
          cols="12"
          md="6"
        >
          <v-combobox
            v-model="gitrepo"
            :rules="repositoryRules"
            :counter="60"
            :items="gitrepoItems"
            label="Repository *"
            :disabled="repository_status.connected || !newPipeline"
            required
          ></v-combobox>
        </v-col>
      </v-row>
      <v-row
        v-if="gitops && showConnectButton"
      >
        <v-col
          cols="12"
          md="6"
        >
            <v-alert
                v-show="repository_status.error"
                outlined
                type="warning"
                prominent
                border="start"
                >{{repository_status.statusTxt}}
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
        v-if="gitops && repository_status.connected && repository_status.statusTxt == 'Repository Connected' && repotab && repotab!='docker'"
      >
        <v-col
          cols="12"
          md="4"
        >
              <v-alert class="alert mb-5"
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

      <v-row v-if="gitops">
        <v-col
          cols="12"
          md="6"
        >
          <v-select
            v-model="buildpack"
            :items="buildpackList"
            label="Buildpack *"
            item-title="text"
            item-text="value"
            @change="updateBuildpack"
          ></v-select>
        </v-col>
      </v-row>
      <v-card elevation="2" color="cardBackground">
        <v-card-title>Phases</v-card-title>
        <v-card-text>
          <v-row v-for="phase in phases" :key="phase.name" class="my-0">
            <v-col
              cols="12"
              md="3"
              class="py-0"
            >
              <v-switch
                v-model="phase.enabled"
                :label="phase.name"
                :disabled="phase.name == 'review' && (repository_status.connected === false || gitops === false)"
                dense
                color="primary"
              ></v-switch>
            </v-col>
            <v-col
              cols="12"
              md="4"
              class="py-0"
            >
              <v-select
                v-model="phase.context"
                :items="contextList"
                label="Cluster"
                v-if="phase.enabled"
                dense
              ></v-select>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-row>
        <v-col
          cols="12"
          md="4"
          class="mt-8"
        >
            <v-btn
                color="primary"
                v-if="newPipeline"
                elevation="2"
                @click="createPipeline()"
                :disabled="!valid || 
                        (gitops &&
                          !(
                            gitrepo && 
                            buildpack
                          )
                        )"
                >Create</v-btn>
            <v-btn
                color="primary"
                v-if="!newPipeline"
                elevation="2"
                @click="updatePipeline()"
                :disabled="!valid || 
                        (gitops &&
                          !(
                            gitrepo && 
                            buildpack
                          )
                        )"
                >Update</v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script lang="ts">
import axios from "axios";
import { defineComponent } from 'vue'

type Buildpack = {
  name?: string,
  run: BuildpackStepConfig,
  build: {
    command: string,
  },
  fetch: BuildpackStepConfig,
}

type BuildpackStepConfig = {
  readOnlyAppStorage: boolean,
  command: string,
  securityContext: {
    readOnlyRootFilesystem: boolean,
    allowPrivilegeEscalation: boolean,
    runAsNonRoot: boolean,
    runAsUser: number,
    runAsGroup: number,
    capabilities: {
      add: string[],
      drop: string[],
    },
  },
}

export default defineComponent({
    props: {
      pipeline: {
        type: String,
        default: "new"
      }
    },
    data: () => ({
      gitops: false,
      dockerimage: '',
      deploymentstrategy: "git",
      newPipeline: true,
      resourceVersion: undefined,
      repotab: 'github', //selected tab
      buildpack: {} as Buildpack,
      buildpackList: [] as { text: string, value: Buildpack }[],
      valid: false, // final form validation
      pipelineName: '',
      domain: '',
      reviewapps: true,
      gitrepo: '',
      gitrepoItems: [] as string[],
      contextList: [] as string[], // a list of kubernets contexts in the kubeconfig to select from
      repositoriesList: { // a list of available repositories to connect with
        github: false,
        gitea: false,
        gitlab: false,
        bitbucket: false,
        gogs: false,
        docker: true
      },
      git: {
        keys: {},
        repository: {},
        webhook: {},
        provider: ""
      },
      repository_status: {
        error: false,
        connected: false,
        statusTxt: "Repository Not Connected",
        keys: {
          data: {},
          status: 0,
          statusText: 'Not connected'
        },
        repository: {
          data: {} as any,
          status: 0,
          statusText: 'Not connected'
        },
        webhook: {
          data: {},
          status: 0,
          statusText: 'Not connected'
        },
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
        (v: any) => !!v || 'Image is required'
      ],
      nameRules: [
        (v: any) => !!v || 'Name is required',
        (v: any) => v.length <= 60 || 'Name must be less than 60 characters',
        (v: any) => /^[a-z0-9][a-z0-9-]*$/.test(v) || 'Allowed characters : [a-z0-9-]',
      ],
      domainRules: [
        (v: any) => v.length <= 253 || 'Name must be less than 253 characters',
        (v: any) => /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/.test(v) || 'Not a domain',
      ],
      repositoryRules: [
        (v: any) => !!v || 'Repository is required',
        (v: any) => v.length <= 120 || 'Repository must be less than 120 characters',
        //    ((git|ssh|http(s)?)|(git@[\w\.]+))(:(//)?)([\w\.@\:/\-~]+)(\.git)(/)?
        (v: any) => /((git|ssh|http(s)?)|(git@[\w.]+))(:(\/\/)?)([\w.@:/\-~]+)(\.git)(\/)?/.test(v) || 'Format "owner/repository"',
      ],
    }),
    computed: {
      showConnectButton() {
        return this.gitrepoItems.includes(this.gitrepo) && this.repository_status.connected === false;
      }
    },
    mounted() {
      this.getContextList();
      this.listRepositories();
      this.listBuildpacks();
      this.loadRepository();
      this.loadPipeline();
    },
    methods: {
      updateBuildpack(buildpack: Buildpack) {
        this.buildpack = buildpack;
      },
      getContextList() {
        axios.get('/api/config/k8s/context').then(response => {
          for (let i = 0; i < response.data.length; i++) {
            this.contextList.push(response.data[i].name);
          }
          if (response.data.length > 0) {
            this.phases[0].context = response.data[0].name;
            this.phases[1].context = response.data[0].name;
            this.phases[2].context = response.data[0].name;
            this.phases[3].context = response.data[0].name;
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
          this.buildpack = response.data[0];
        });
      },
      connectRepo() {
        //console.log(this.gitrepo);
        //console.log(this.repotab);
        switch (this.repotab) {
          case 'github':
            this.connectRepository('github')
            this.repositoriesList.gitea = false;
            this.repositoriesList.gogs = false;
            this.repositoriesList.gitlab = false;
            this.repositoriesList.bitbucket = false;
            this.repositoriesList.docker = false;
            break;
          case 'gitea':
            this.connectRepository('gitea')
            this.repositoriesList.github = false;
            this.repositoriesList.gogs = false;
            this.repositoriesList.gitlab = false;
            this.repositoriesList.bitbucket = false;
            this.repositoriesList.docker = false;
            break;
          case 'gogs':
            this.connectRepository('gogs')
            this.repositoriesList.github = false;
            this.repositoriesList.gitea = false;
            this.repositoriesList.gitlab = false;
            this.repositoriesList.bitbucket = false;
            this.repositoriesList.docker = false;
            break;
          case 'gitlab':
            this.connectRepository('gitlab')
            this.repositoriesList.github = false;
            this.repositoriesList.gitea = false;
            this.repositoriesList.gogs = false;
            this.repositoriesList.bitbucket = false;
            this.repositoriesList.docker = false;
            return;
          case 'bitbucket':
            this.connectRepository('bitbucket')
            this.repositoriesList.github = false;
            this.repositoriesList.gitea = false;
            this.repositoriesList.gitlab = false;
            this.repositoriesList.gogs = false;
            this.repositoriesList.docker = false;
            return;
          default:
            break;
        }
      },

      loadRepository() {
        axios.get(`/api/repo/${this.repotab}/list`)
        .then(response => {
          this.gitrepoItems = response.data;
        }).catch(error => {
          console.log(error);
        });
      },

      connectRepository(repo: string) {
        axios.post(`/api/repo/${repo}/connect`, {
          gitrepo: this.gitrepo
        }).then(response => {
          this.repository_status = response.data;

          const con_status = {
            repository: this.repository_status.repository.status,
            webhook: this.repository_status.webhook.status,
            keys: this.repository_status.keys.status,
          }

          if (
            con_status.repository === 200 &&
            (con_status.webhook == 200 || con_status.webhook == 201 || con_status.webhook == 422) &&
            (con_status.keys == 200 || con_status.keys == 201)
          ) {
            this.repository_status.error = false;
            this.repository_status.connected = true;
            this.repository_status.statusTxt = "Repository Connected";
            this.git.keys = this.repository_status.keys.data;
            this.git.webhook = this.repository_status.webhook.data;
            this.git.repository = this.repository_status.repository.data;
          } else if (
            con_status.repository === 200 &&
            this.repository_status.repository.data.private === false &&
            con_status.webhook > 399 &&
            con_status.keys > 399
          ) {
            this.repository_status.error = true;
            this.repository_status.connected = false;
            this.repository_status.statusTxt = "No permission to connect to Repository";
            this.git.keys = this.repository_status.keys.data;
            this.git.webhook = this.repository_status.webhook.data;
            this.git.repository = this.repository_status.repository.data;
          } else {
            this.repository_status.error = true;
            this.repository_status.connected = false;
            this.repository_status.statusTxt = "Repository Not Connected";
          }
          this.git.provider = this.repotab;

        }).catch(error => {
          console.log(error);
          this.repository_status.error = true;
          this.repository_status.statusTxt = "Failed to connect to repository API";
        });
      },
      loadPipeline() {
        if (this.pipeline !== 'new') {
          axios.get(`/api/pipelines/${this.pipeline}`)
          .then(response => {
            this.newPipeline = false;
            const p = response.data;

            if (p.git.provider === '') {
              this.gitops = false;
              this.repository_status.connected = false
            } else {
              this.gitops = true;
              this.repository_status.connected = true
            }

            this.resourceVersion = p.resourceVersion;
            this.pipelineName = p.name;
            this.domain = p.domain;
            this.gitrepo = p.git.repository.ssh_url;
            this.phases = p.phases;
            this.reviewapps = p.reviewapps;
            this.git = p.git;
            this.dockerimage = p.dockerimage;
            this.deploymentstrategy = p.deploymentstrategy;
            this.buildpack = p.buildpack;
          }).catch(error => {
            console.log(error);
          });
        }
      },
      createPipeline() {

        // fake the minimal requirements to create a pipeline if the repo is not connectedd
        if (!this.repository_status.connected) {
          this.git.keys = {
            priv: btoa("foo"),
            pub: btoa("bar")
          }

          // TODO transform git ssh url to http url
          this.git.repository = {
            admin: false,
            ssh_url: this.gitrepo,
            clone_url: this.gitrepo
          }
        }

        // Bugfix: select a buildpack if none is selected, since it contains basic seciruty settings
        if (this.buildpack === undefined) {
          this.buildpack = this.buildpackList[0].value;
        }

        axios.post(`/api/pipelines`, {
          pipelineName: this.pipelineName,
          domain: this.domain,
          gitrepo: this.gitrepo,
          phases: this.phases,
          reviewapps: this.reviewapps,
          git: this.git,
          dockerimage: '',
          deploymentstrategy: "git", // DEPRECATED
          buildpack: this.buildpack,
        })
        .then(response => {
          this.pipelineName = '';
          //console.log(response);
          this.$router.push({path: '/'});
        })
        .catch(error => {
          console.log(error);
        });
      },
      updatePipeline() {
        axios.put(`/api/pipelines/${this.pipeline}`, {
          resourceVersion: this.resourceVersion,
          pipelineName: this.pipelineName,
          domain: this.domain,
          gitrepo: this.gitrepo,
          phases: this.phases,
          reviewapps: this.reviewapps,
          git: this.git,
          dockerimage: '',
          deploymentstrategy: "git", // DEPRECATED 
          buildpack: this.buildpack,
        })
        .then(response => {
          this.pipelineName = '';
          //console.log(response);
          this.$router.push({path: '/'});
        })
        .catch(error => {
          console.log(error);
        });
      },
    },
})
</script>

<style lang="scss">
.alert i.v-icon.v-icon {
  color: white !important;
}

.gogs{
    background-image: url('./../../../public/img/icons/gogs.svg');
    background-size: contain;
    background-repeat: no-repeat;
    filter: brightness(0) saturate(100%) invert(28%) sepia(0%) saturate(78%) hue-rotate(197deg) brightness(95%) contrast(83%);
    /*filter: invert(39%) sepia(47%) saturate(584%) hue-rotate(228deg) brightness(95%) contrast(80%);
    /*filter: invert(93%) sepia(49%) saturate(7411%) hue-rotate(184deg) brightness(87%) contrast(90%);*/
}

.gogs::before {
    height: 23px;
    width: 23px;
    visibility: hidden;
    content: "";
}


.onedev{
    background-image: url('./../../../public/img/icons/onedev.svg');
    background-size: contain;
    background-repeat: no-repeat;
    filter: brightness(0) saturate(100%) invert(28%) sepia(0%) saturate(78%) hue-rotate(197deg) brightness(95%) contrast(83%);
    /*filter: invert(39%) sepia(47%) saturate(584%) hue-rotate(228deg) brightness(95%) contrast(80%);
    /*filter: invert(93%) sepia(49%) saturate(7411%) hue-rotate(184deg) brightness(87%) contrast(90%);*/
}

.onedev::before {
    height: 23px;
    width: 23px;
    visibility: hidden;
    content: "";
}

.gitea{
    background-image: url('./../../../public/img/icons/gitea.svg');
    background-size: contain;
    background-repeat: no-repeat;
    filter: brightness(0) saturate(100%) invert(28%) sepia(0%) saturate(78%) hue-rotate(197deg) brightness(95%) contrast(83%);
    /*filter: invert(39%) sepia(47%) saturate(584%) hue-rotate(228deg) brightness(95%) contrast(80%);
    /*filter: invert(93%) sepia(49%) saturate(7411%) hue-rotate(184deg) brightness(87%) contrast(90%);*/
}

.gitea::before {
    height: 23px;
    width: 23px;
    visibility: hidden;
    content: "";
}

</style>