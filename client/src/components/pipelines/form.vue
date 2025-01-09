<template>
  <v-form v-model="valid">
    <v-container>
      <Breadcrumbs :items="breadcrumbItems"></Breadcrumbs>
      <v-row>
        <v-col
          cols="12"
          md="1"
        >
          <v-img
            :src="(gitops == true) ? '/img/icons/hexagon3.svg' : '/img/icons/hexagon3-empty-bold-tp.svg'"
            max-width="50"
            max-height="50"
            class="mr-2"
          ></v-img>
        </v-col>
        <v-col cols="12" sm="11" md="11" lg="11" xl="11">

            <h2 v-if="pipeline=='new'">
                Create a new Pipeline
            </h2>
            <h2 v-if="pipeline!='new'">
                Edit <span style="color: rgb(var(--v-theme-kubero))">{{ pipelineName }}</span>
            </h2>
            <p class="text-justify">
                A Pipeline may have several stages with apps
            </p>
        </v-col>
      </v-row>
      <v-row>
        <v-col
          cols="12"
          md="5"
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
          md="8"
        >
          <v-switch
            v-model="gitops"
            label="Enable Pipeline to build from Source"
            color="primary"
          ></v-switch>
        </v-col>
      </v-row>

      <v-card elevation="2" color="cardBackground" v-if="gitops" style="margin-bottom: 20px">
        <v-card-title>Continuous Deployment</v-card-title>
        <v-card-text>
          <v-row>
            <v-col
              cols="12"
              md="8"
            >
            <v-tabs v-model="repotab" stacked centered @click="loadRepository">
                <v-tab value="github" :disabled="repositoriesList.github == false"><v-icon class="mb-2 kubero">mdi-github</v-icon>Github</v-tab>
                <v-tab value="gitea" :disabled="repositoriesList.gitea == false"><v-icon class="mb-2 gitea"></v-icon>Gitea</v-tab>
                <v-tab value="gitlab" :disabled="repositoriesList.gitlab == false"><v-icon class="mb-2">mdi-gitlab</v-icon>Gitlab</v-tab>
                <v-tab value="gogs" :disabled="repositoriesList.gogs == false"><v-icon class="mb-2 gogs"></v-icon>Gogs</v-tab>
                <v-tab value="bitbucket" :disabled="repositoriesList.bitbucket == false"><v-icon class="mb-2">mdi-bitbucket</v-icon>Bitbucket</v-tab>
            </v-tabs>
            </v-col>
          </v-row>

          <v-row>
            <v-col
              cols="12"
              md="5"
            >
              <v-combobox
                v-model="gitrepo"
                :rules="repositoryRules"
                :items="gitrepoItems"
                label="Repository *"
                :disabled="repository_status.connected"
                required
              ></v-combobox>
            </v-col>

            <v-col
              cols="12"
              md="7"
            >
            
              <v-alert variant="tonal" color="#8560a9" border="start">
                <h3>
                  Repository
                </h3>
                <div>When connected, webhooks and deployment keys are stored in the repository. This means that the apps configured in this project can be automatically redeployed with a 'git push' and opening a PR starts a new instance in the "review" phase.</div>
              </v-alert>
            </v-col>
          </v-row>

          <v-row
            v-if="repository_status.connected"
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
                  <v-alert
                      v-show="repository_status.error"
                      outlined
                      type="warning"
                      prominent
                      border="start"
                      >{{repository_status.statusTxt}}
                  </v-alert>
            </v-col>
          </v-row>

          <v-row
            v-if="repository_status.error"
          >
            <v-col
              cols="12"
              md="4"
            >
                  <v-alert
                      outlined
                      type="warning"
                      prominent
                      border="start"
                      >{{repository_status.statusTxt}}
                  </v-alert>
            </v-col>
          </v-row>


          <v-row>
            <v-col
              cols="12"
              md="2"
            >
                <v-btn
                    color="primary"
                    elevation="2"
                    v-if="!repository_status.connected"
                    @click="connectRepo()"
                    >Connect</v-btn>
                <v-btn
                    color="secondary"
                    elevation="2"
                    v-if="repository_status.connected"
                    @click="reconnectRepo()"
                    >Reconnect</v-btn>
            </v-col>
            <v-col
              cols="12"
              md="2"
            >
                <v-btn
                    color="warning"
                    elevation="2"
                    v-if="repository_status.connected"
                    @click="disconnectRepo()"
                    >Disconnect</v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-card elevation="2" color="cardBackground" v-if="gitops" style="margin-bottom: 20px">
        <v-card-title>Build</v-card-title>
        <v-card-text>
          <v-row>
            <v-col
              cols="12"
              md="5"
            >
              <v-radio-group v-model="buildstrategy">
                <v-radio
                  key="0"
                  label="Runpacks"
                  value="plain"
                ></v-radio>
                <v-radio
                  key="2"
                  label="External CI/CD"
                  value="external"
                ></v-radio>
                <v-radio
                  key="1"
                  label="Nixpacks"
                  value="nixpacks"
                ></v-radio>
                <v-radio
                  key="1"
                  label="Buildpacks"
                  value="buildpacks"
                ></v-radio>
                <v-radio
                  key="2"
                  label="Dockerfile"
                  value="dockerfile"
                ></v-radio>
              </v-radio-group>
            </v-col>
            <v-col
              cols="12"
              md="7"
            >
            
              <v-alert variant="tonal" color="#8560a9" border="start" v-if="buildstrategy == 'plain'">
                <h3>
                  Runpacks
                </h3>
                <div>Your code is build and running on official images. The code will be built for every pod in a init container. This is the fastes way, to run your code, but becomes more inefficient with every replica.</div>
              </v-alert>

              <v-alert variant="tonal" color="#8560a9" border="start" v-if="buildstrategy == 'nixpacks'">
                <h3>
                  Nixpacks
                </h3>
                <div>
                  <a href="https://nixpacks.com/" target="_blank" style="text-decoration: underline;">Nixpacks</a> is a open source project to build docker images with nix. It is a good way to build images without a Dockerfile, if you want to have a reproducable build process.
                </div>
              </v-alert>

              <v-alert variant="tonal" color="#8560a9" border="start" v-if="buildstrategy == 'buildpacks'">
                <h3>
                  Buildpacks
                </h3>
                <div>
                  <a href="https://buildpacks.io/" target="_blank" style="text-decoration: underline;">Buildpacks</a> are a set of scripts and binaries used to transform application source code into a deployable image, automating the process of compiling, building, and configuring the app for deployment.
                </div>
              </v-alert>

              <v-alert variant="tonal" color="#8560a9" border="start" v-if="buildstrategy == 'dockerfile'">
                <h3>
                  Dockerfile
                </h3>
                <div>Builds the image based on the Dockerfile in your git root directory. This allows for the highest level of customization.</div>
              </v-alert>

              <v-alert variant="tonal" color="#8560a9" border="start" v-if="buildstrategy == 'external'">
                <h3>
                  External CI/CD
                </h3>
                <div>You are building your image on a external CI/CD and deploy it by changing the image tag via the API</div>
              </v-alert>

            </v-col>
          </v-row>


          <v-row>
            <v-col
              cols="12"
              md="5"
              v-if="buildstrategy == 'plain'"
            >
              <v-select
                v-model="buildpack"
                :items="buildpackList"
                label="Runpack *"
                item-title="text"
                item-text="value"
                @update:modelValue="updateBuildpack"
              ></v-select>
            </v-col>
          </v-row>


          <v-row
            v-if="buildstrategy == 'dockerfile'">
            <v-col
              cols="12"
              md="5"
            >
              <v-text-field
                v-model="dockerfilepath"
                :rules="imageRules"
                label="Dockerfile path"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row
            v-if="buildstrategy == 'dockerfile' || buildstrategy == 'nixpacks' || buildstrategy == 'buildpacks'">
            <v-col
              cols="12"
              md="4"
            >
              <v-text-field
                v-model="registry.host"
                label="Registry Host"
              ></v-text-field>
            </v-col>
            <v-col
              cols="12"
              md="4"
            >
              <v-text-field
                v-model="registry.username"
                label="Username"
              ></v-text-field>
            </v-col>
            <v-col
              cols="12"
              md="4"
            >
              <v-text-field
                v-model="registry.password"
                label="Password"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>



      <v-card elevation="2" color="cardBackground">
        <v-card-title>Environments</v-card-title>
        <v-card-text>
          <div v-for="phase in phases" :key="phase.name" class="my-0">
          <v-row>
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
                class="text-overline"
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
                v-if="phase.enabled && phase.name != 'review'"
                dense
              ></v-select>
            </v-col>
          </v-row>
            <div v-if="phase.enabled && phase.name == 'review'">
              <v-row>
                <v-col
                  cols="12"
                  md="5"
                  class="py-0"
                >
                  <v-select
                    v-model="phase.context"
                    :items="contextList"
                    label="Cluster Context *"
                    v-if="phase.enabled"
                    dense
                  ></v-select>
                </v-col>
              </v-row>
              <v-row v-if="phase.name == 'review'">
                <v-col
                  cols="12"
                  md="2"
                  class="py-0"
                  density="compact"
                >
                  <v-combobox
                    clearable
                    label="TTL"
                    :items="['8h', '1d', '1w', '1m']"
                  ></v-combobox>
                </v-col>
              </v-row>
              <v-row>
                <v-col
                  cols="12"
                  md="5"
                >
                  <v-text-field
                    v-model="phase.domain"
                    :rules="domainRules"
                    label="Base domain"
                    density="compact"
                    hint="This Wildcard Domain should point to the IP of your cluster defined in 'Cluster Context'"
                  ></v-text-field>
                </v-col>
              </v-row>
              <div class="font-weight-bold v-label pa-2 mb-1">Default Environment Variables</div>
              <v-row v-for="(envvar, index) in phase.defaultEnvvars" :key="index">
                <v-col
                  cols="12"
                  md="5"
                  class="py-0"
                >
                  <v-text-field
                    v-model="envvar.name"
                    label="Name"
                    density="compact"
                    :counter="60"
                  ></v-text-field>
                </v-col>
                <v-col
                  cols="12"
                  md="6"
                  class="py-0"
                >
                  <v-text-field
                    v-model="envvar.value"
                    label="Value"
                    density="compact"
                  ></v-text-field>
                </v-col>
                <v-col
                  cols="12"
                  md="1"
                  class="py-0"
                >
                  <v-btn
                  elevation="2"
                  icon
                  size="small"
                  @click="removeEnvLine(phase, envvar.name)"
                  >
                      <v-icon dark >
                          mdi-minus
                      </v-icon>
                  </v-btn>
                </v-col>
              </v-row>

              <v-row class="mt-0">
                <v-col
                  cols="12"
                  class="pt-0 mb-8"
                >
                  <v-btn
                  elevation="2"
                  icon
                  size="small"
                  @click="addEnvLine(phase)"
                  >
                      <v-icon dark >
                          mdi-plus
                      </v-icon>
                  </v-btn>
                </v-col>
              </v-row>
              <hr class="mb-5">
            </div>
          </div>
        </v-card-text>
      </v-card>

      <v-row>
        <v-col
          cols="12"
          md="4"
          class="mt-8"
        >
            <!--
                :disabled="!valid || 
                        (gitops &&
                          !(
                            gitrepo && 
                            buildpack
                          )
                        )"
            -->
            <v-btn
                color="primary"
                v-if="newPipeline"
                elevation="2"
                @click="createPipeline()"
                :disabled="!valid"
                >Create</v-btn>
            <v-btn
                color="primary"
                v-if="!newPipeline"
                elevation="2"
                @click="updatePipeline()"
                :disabled="!valid"
                >Update</v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script lang="ts">
import axios from "axios";
import { defineComponent } from 'vue'
import Breadcrumbs from "../breadcrumbs.vue";
import { EnvVar } from '../apps/form.vue'

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
    data () {
    return {
      breadcrumbItems: [
          {
              title: 'Dashboard.Pipelines',
              disabled: false,
              to: { name: 'Pipelines', params: {}}
          },
      ],
      gitops: false,
      dockerimage: '',
      deploymentstrategy: "git",
      buildstrategy: "plain",
      dockerfilepath: '/',
      registry: {
        host: 'https://',
        username: '',
        password: '',
      },
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
          domain: '',
          defaultTTL: undefined as number | undefined,
          defaultEnvvars: [] as EnvVar[],
        },
        {
          name: 'test',
          enabled: false,
          context: '',
          domain: '',
          defaultTTL: undefined as number | undefined,
          defaultEnvvars: [] as EnvVar[],
        },
        {
          name: 'stage',
          enabled: false,
          context: '',
          domain: '',
          defaultTTL: undefined as number | undefined,
          defaultEnvvars: [] as EnvVar[],
        },
        {
          name: 'production',
          enabled: true,
          context: '',
          domain: '',
          defaultTTL: undefined as number | undefined,
          defaultEnvvars: [] as EnvVar[],
        },
      ],
      imageRules: [
        (v: any) => !!v || 'Image is required'
      ],
      nameRules: [
        (v: any) => !!v || 'Name is required',
        (v: any) => v.length <= 60 || 'Name must be less than 60 characters',
        (v: any) => /^[a-z0-9][a-z0-9-]*$/.test(v) || 'Allowed characters : [a-z0-9-]',
        (v: any) => v !== 'new' || 'Name cannot be "new"',
      ],
      domainRules: [
        //(v: any) => v.length <= 253 || 'Name must be less than 253 characters',
        (v: any) => /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$|^localhost$|^$/.test(v) || 'Not a domain',
      ],
      repositoryRules: [
        //(v: any) => !!v || 'Repository is required',
        //(v: any) => v.length <= 120 || 'Repository must be less than 120 characters',
        //           ((git|ssh|http(s)?)|(git@[\w\.]+))(:(//)?)([\w\.@\:/\-~]+)(\.git)(/)?
        //           ((git|ssh|http(s)?)|(git@[\w.]+))(:(\/\/)?)([\w.@:\/\-~]+)(\.git)
        //           (git@[\w.]+:\/\/)([\w.\/\-~]+)(\.git) // not working
        //           ((git|ssh|http(s)?)|(git@[\w\.-]+))(:(//)?)([\w\.@\:/\-~]+)(\.git)(/)?
        (v: any) => /^((git|ssh|http(s)?)|(git@[\w\.-]+))(:(\/\/)?)([\w\.@\:\/\-~]+)(\.git)(\/)?/.test(v) || 'Format "git@github.com:organisation/repository.git"',
      ],
    }}, 
    computed: {
      showConnectButton() {
        return this.gitrepoItems.includes(this.gitrepo) && this.repository_status.connected === false;
      }
    },
    mounted() {
      this.getContextList();
      this.listRepositories();
      this.loadDefaultregistry();
      this.listBuildpacks();
      this.loadRepository();
      this.loadPipeline();
    },
    components: {
        Breadcrumbs,
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
      disconnectRepo(){
        const repo = this.repotab;
        axios.post(`/api/repo/${repo}/disconnect`, {
          gitrepo: this.gitrepo
        }).then(response => {
          this.repository_status.connected = false;
        }).catch(error => {
          console.log(error);
        });
      },
      reconnectRepo(){
        this.repository_status.connected = false;
        this.connectRepo();
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

      loadDefaultregistry() {
        if (this.pipeline === 'new') {
          axios.get(`/api/config/registry`)
          .then(response => {
            if (response.data.host && response.data.account.username && response.data.account.password) {
              this.registry ={
                host: 'https://'+response.data.host,
                username: response.data.account.username,
                password: response.data.account.password,
              }
            }
          }).catch(error => {
            console.log(error);
          });
        }
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
            this.registry = p.registry || this.registry;
            this.buildstrategy = p.buildstrategy || this.buildstrategy;
            this.dockerimage = p.dockerimage;
            this.deploymentstrategy = p.deploymentstrategy;
            this.buildpack = p.buildpack;

            // Backward compatibility for < v2.4.6
            for (let i = 0; i < this.phases.length; i++) {
              if (this.phases[i].defaultEnvvars === undefined) {
                this.phases[i].defaultEnvvars = [] as EnvVar[];
              }
            }
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
          registry: this.registry,
          dockerimage: '',
          deploymentstrategy: this.deploymentstrategy,
          buildstrategy: this.buildstrategy,
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
          registry: this.registry,
          dockerimage: '',
          deploymentstrategy: this.deploymentstrategy,
          buildstrategy: this.buildstrategy,
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
      addEnvLine(phase: any) {
        phase.defaultEnvvars.push({
          name: '',
          value: '',
        });
      },
      removeEnvLine(phase: any, index: string) {
        for (let i = 0; i < phase.defaultEnvvars.length; i++) {
          if (phase.defaultEnvvars[i].name === index) {
            phase.defaultEnvvars.splice(i, 1);
          }
        }
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