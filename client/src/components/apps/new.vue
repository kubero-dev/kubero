<template>
  <v-form v-model="valid">
    <v-container>
      <v-row>
        <v-col cols="12" sm="12" md="12" lg="12" xl="12">
            <h2 v-if="app=='new'">
                Create a new App in {{ this.pipeline }}
            </h2>
            <h2 v-if="app!='new'">
                Edit {{ this.app }} in {{ this.pipeline }}
            </h2>
            <p class="text-justify">
                in phase {{ this.phase }}
            </p>
        </v-col>
      </v-row>

      <v-row
       v-if="app==='new' && $route.query.service != undefined">
        <v-col
          cols="12"
          md="6"
        >
          <v-alert
            outlined
            type="warning"
            prominent
            border="left"
          >
            Please change all passwords, tokens and select the correct storageClass for your cluster.
          </v-alert>
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
            :readonly="app!='new'"
            label="App name"
            v-on:input="changeName(appname)"
            required
          ></v-text-field>
        </v-col>
      </v-row>

      <v-row>
        <v-col
          cols="9"
          md="5"
        >
          <v-text-field
            v-model="domain"
            :rules="domainRules"
            :counter="60"
            label="Domain"
            required
          ></v-text-field>
        </v-col>
        <v-col
          cols="3"
          md="1"
          pullright
        >
          <v-switch
            v-model="ssl"
            label="SSL"
          ></v-switch>
        </v-col>
      </v-row>

      <v-row>
        <v-col
          cols="12"
          md="6"
        >
            <v-text-field
              v-model="containerPort"
              label="Container Port"
            ></v-text-field>
        </v-col>
      </v-row>

      <v-row>
        <v-col
          cols="12"
          md="6"
        >
        <v-switch
            v-model="advanced"
            label="Advanced App Configuration"
            color="primary"
            inset
          ></v-switch>
        </v-col>
      </v-row>

      <v-expansion-panels
        v-model="panel"
        multiple
      >
      <!-- DEPLOYMENT -->
      <v-expansion-panel>
        <v-expansion-panel-header class="text-uppercase text-caption-2 font-weight-medium cardBackground">Deployment</v-expansion-panel-header>
        <v-expansion-panel-content class="cardBackground">

          <v-row>
            <v-col
              cols="12"
              md="6"
            >
            <v-radio-group
              v-model="deploymentstrategy"
              row
              label="Strategy"
            >
              <v-radio
                label="GitOps"
                value="git"
              ></v-radio>
              <v-radio
                label="Docker Image"
                value="docker"
              ></v-radio>
              <!--
              <v-radio
                label="Build"
                value="build"
              ></v-radio>
              -->
            </v-radio-group>
            </v-col>
          </v-row>

          <!-- DEPLOYMENT STRATEGY GIT -->
          <v-row
            v-if="deploymentstrategy == 'git'">
            <v-col
              cols="12"
              md="6"
            >
              <v-text-field
                v-model="pipelineData.git.repository.ssh_url"
                :rules="repositoryRules"
                label="Repository"
                required
                disabled
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row
            v-if="deploymentstrategy == 'git'">
            <v-col
              cols="12"
              md="6"
            >
              <v-combobox
                v-model="branch"
                :items="branchesList"
                label="Branch"
                required
              ></v-combobox>
            </v-col>
          </v-row>
          <v-row
            v-if="deploymentstrategy == 'git'">
            <v-col
              cols="12"
              md="6"
            >
              <v-switch
                v-model="autodeploy"
                label="Autodeploy"
              ></v-switch>
            </v-col>
          </v-row>

          <v-divider class="ma-5" v-if="deploymentstrategy == 'git' && advanced === true"></v-divider>

          <v-row
            v-if="deploymentstrategy == 'git' && advanced === true">
            <v-col
              cols="12"
              md="6"
            >
              <v-text-field
                v-model="buildpack.build.command"
                label="Build Command"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row
            v-if="deploymentstrategy == 'git' && advanced === true">
            <v-col
              cols="12"
              md="6"
            >
              <v-text-field
                v-model="buildpack.run.command"
                label="Run Command"
              ></v-text-field>
            </v-col>
          </v-row>

          <!-- DEPLOYMENT STRATEGY CONTAINER -->
          <v-row
            v-if="deploymentstrategy == 'docker'">
            <v-col
              cols="12"
              md="6"
            >
              <v-text-field
                v-model="docker.image"
                :counter="60"
                label="Docker image"
                required
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row
            v-if="deploymentstrategy == 'docker'">
            <v-col
              cols="12"
              md="6"
            >
              <v-text-field
                v-model="docker.tag"
                :counter="60"
                label="Tag"
                required
              ></v-text-field>
            </v-col>
          </v-row>
        </v-expansion-panel-content>
      </v-expansion-panel>

      <!-- SECURITY -->
      <v-expansion-panel v-if="advanced">
        <v-expansion-panel-header class="text-uppercase text-caption-2 font-weight-medium cardBackground">Security</v-expansion-panel-header>
        <v-expansion-panel-content class="cardBackground">

          <v-row>
            <v-col
              cols="12"
              md="6"
            >
              <v-switch
                v-model="security.vulnerabilityScans"
                label="Enable Trivy vulnerabfility scans"
                color="primary"
                inset
            ></v-switch>
            </v-col>
            <!--
            <v-col
              cols="12"
              md="6"
            >
              <v-switch
                v-model="security.allowPrivilegeEscalation"
                :label="`Allow privilege escalation: ${security.allowPrivilegeEscalation}`"
                color="primary"
                inset
            ></v-switch>
            </v-col>
            -->
            <v-col
              cols="12"
              md="6"
            >
              <v-switch
                v-model="security.readOnlyRootFilesystem"
                label="Read only root filesystem"
                color="primary"
                inset
            ></v-switch>
            </v-col>
            <!--
            <v-col
              cols="12"
              md="6"
            >
              <v-switch
                v-model="security.runAsNonRoot"
                :label="`Run as non root: ${security.runAsNonRoot}`"
                color="primary"
                inset
            ></v-switch>
            </v-col>
            -->
          </v-row>

        </v-expansion-panel-content>
      </v-expansion-panel>

      <!-- ENVIRONMENT VARS -->
      <v-expansion-panel>
        <v-expansion-panel-header class="text-uppercase text-caption-2 font-weight-medium cardBackground">Environment Variables</v-expansion-panel-header>
        <v-expansion-panel-content class="cardBackground">
          <v-row v-for="variable in envvars" v-bind:key="variable.id">
            <v-col
              cols="12"
              md="2"
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
              ></v-text-field>
            </v-col>
            <v-col
              cols="12"
              md="1"
            >
              <v-btn
              elevation="2"
              icon
              small
              @click="removeEnvLine(variable.name)"
              >
                  <v-icon dark >
                      mdi-minus
                  </v-icon>
              </v-btn>
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
        </v-expansion-panel-content>
      </v-expansion-panel>

      <!-- RESOURCES -->
      <v-expansion-panel>
        <v-expansion-panel-header class="text-uppercase text-caption-2 font-weight-medium cardBackground">Resources</v-expansion-panel-header>
        <v-expansion-panel-content class="cardBackground">
          <v-row>
            <v-col
              cols="12"
              md="6"
            >
              <v-select
                v-model="podsize"
                :items="podsizes"
                label="Podsize"
                @change="updatePodsize"
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
                label="Autoscale"
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
        </v-expansion-panel-content>
      </v-expansion-panel>

      <!-- VOLUMES -->
      <v-expansion-panel>
        <v-expansion-panel-header class="text-uppercase text-caption-2 font-weight-medium cardBackground">Volumes</v-expansion-panel-header>
        <v-expansion-panel-content class="cardBackground">
          <div v-for="volume in extraVolumes" v-bind:key="volume.id">
            <v-row>
              <v-col
                cols="12"
                md="3"
              >
                <v-text-field
                  v-model="volume.name"
                  label="name"
                ></v-text-field>
              </v-col>
              <v-col
                cols="12"
                md="2"
              >
                <v-text-field
                  v-model="volume.size"
                  label="size"
                ></v-text-field>
              </v-col>
              <v-col
                cols="12"
                md="1"
              >
                <v-btn
                elevation="2"
                icon
                small
                @click="removeVolumeLine(volume.name)"
                >
                    <v-icon dark >
                        mdi-minus
                    </v-icon>
                </v-btn>
              </v-col>
            </v-row>

            <v-row>
              <v-col
                cols="12"
                md="2"
              >
                <v-select
                  v-model="volume.storageClass"
                  :items="storageclasses"
                  label="Storage Class"
                ></v-select>
              </v-col>
              <v-col
                cols="12"
                md="3"
              >
                <v-text-field
                  v-model="volume.mountPath"
                  label="Mount Path"
                ></v-text-field>
              </v-col>
              <v-col
                cols="12"
                md="1"
              >
                <v-switch
                  v-model="volume.accessModes[0]"
                  label="Read/Write Many"
                  true-value="ReadWriteMany"
                  false-value="ReadWriteOnce"
                ></v-switch>
              </v-col>
            </v-row>
          </div>

          <v-row>
            <v-col
              cols="12"
            >
              <v-btn
              elevation="2"
              icon
              small
              @click="addVolumeLine()"
              >
                  <v-icon dark >
                      mdi-plus
                  </v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-expansion-panel-content>
      </v-expansion-panel>

      <!-- CRONJOBS -->
      <v-expansion-panel>
        <v-expansion-panel-header class="text-uppercase text-caption-2 font-weight-medium cardBackground">Cronjobs</v-expansion-panel-header>
        <v-expansion-panel-content class="cardBackground">
          <div v-for="variable in cronjobs" v-bind:key="variable.id">
            <v-row>
              <v-col
                cols="12"
                md="3"
              >
                <v-text-field
                  v-model="variable.name"
                  label="name"
                  :readonly="app!='new'"
                ></v-text-field>
              </v-col>
              <v-col
                cols="12"
                md="2"
              >
                <v-text-field
                  v-model="variable.schedule"
                  label="schedule"
                  :rules="cronjobScheduleRules"
                ></v-text-field>
              </v-col>
              <v-col
                cols="12"
                md="1"
              >
                <v-btn
                elevation="2"
                icon
                small
                @click="removeCronjobLine(variable.name)"
                >
                    <v-icon dark >
                        mdi-minus
                    </v-icon>
                </v-btn>
              </v-col>
            </v-row>

            <v-row>
              <v-col
                cols="12"
                md="3"
              >
                <v-text-field
                  v-model="variable.image"
                  label="image"
                ></v-text-field>
              </v-col>
              <v-col
                cols="12"
                md="3"
              >
                <v-text-field
                  v-model="variable.command"
                  label="command"
                ></v-text-field>
              </v-col>
            </v-row>
          </div>

          <v-row>
            <v-col
              cols="12"
            >
              <v-btn
              elevation="2"
              icon
              small
              @click="addCronjobLine()"
              >
                  <v-icon dark >
                      mdi-plus
                  </v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>

      <!-- ADDONS -->
      <div class="text-uppercase text-caption-2 font-weight-medium pt-5">Addons</div>
      <Addons :addons="addons" :appname="appname"/>

      <!-- SUBMIT -->
      <v-row class="pt-5">
        <v-col
          cols="12"
          md="4"
        >
            <v-btn
                color="primary"
                v-if="app=='new'"
                elevation="2"
                @click="createApp()"
                :disabled="!valid"
                >Create</v-btn>
            <v-btn
                color="primary"
                v-if="app!='new'"
                elevation="2"
                @click="updateApp()"
                :disabled="!valid"
                >Update</v-btn>
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
import Addons from "./addons.vue";
export default {
    props: {
      pipeline: {
        type: String,
        default: "MISSING"
      },
      phase: {
        type: String,
        default: "MISSING"
      },
      app: {
        type: String,
        default: "new"
      }
    },
    data: () => ({
      advanced: false,
      panel: [0],
      valid: false,
      buildpack: {
        run: {
          command: '',
        },
        build: {
          command: '',
        },
      },
      image: {
        run: {
          command: '',
          securityContext: {
            readOnlyRootFilesystem: true
          },
        },
        build: {
          command: '',
        },
      },
      deploymentstrategy: "git",
      pipelineData: {
        git: {
          repository: {
            ssh_url: "",
          }
        },
      },
      appname: '',
      resourceVersion: undefined,
      /*
      phases: [
        { text: 'Production', value: 'production' },
        { text: 'Staging', value: 'stage' },
        { text: 'Testing', value: 'test' },
      ],
      */
      gitrepo: {
        ssh_url: 'git@github.com:kubero-dev/template-nodeapp.git',
      },
      branch: 'main',
      branchesList: [],
      docker: {
        image: 'ghcr.io/kubero-dev/template-nodeapp',
        tag: 'latest',
      },
      autodeploy: true,
      domain: '',
      ssl: false,
      envvars: [
        //{ name: '', value: '' },
      ],
      containerPort: 8080,
      podsize: '',
      podsizes: [
        /*
        { text: 'Small (0.2m cpu, 0.5g ram)', value: 'small' },
        { text: 'Medium (0.5m cpu, 1g ram)', value: 'medium' },
        { text: 'Large (1m cpu, 1.5g ram)', value: 'large' },
        { text: 'XLarge (2m cpu, 2.5g ram)', value: 'xlarge' },
        */
      ],
      autoscale: false,
      webreplicas: 1,
      workerreplicas: 0,
      webreplicasrange: [1,3],
      workerreplicasrange: [0,0],
      cronjobs: [
        /*
        {
          name: '',
          schedule: '',
          image: '',
          command: '',
          restartPolicy: 'OnFailure',
        },
        */
      ],
      storageclasses : [
/*
        'standard',
        'standard-fast',
*/
      ],
      extraVolumes: [
        /*
        {
          name: 'example-volume',
          emptyDir: false,
          storageClass: 'standard',
          size: '1Gi',
          accessMode: ['ReadWriteOnce']
          mountPath: '/example/path',
        },
        */
      ],
      addons: [
        /*
        {
          id: "redis",
          name: 'Redis',
          version: 'v0.0.1'
        },
        */

      ],
      security: {
        vulnerabilityScans: false,
        allowPrivilegeEscalation: false,
        runAsNonRoot: false,
        readOnlyRootFilesystem: true,
        /*
        runAsUser: 0,
        runAsGroup: 0,
        capabilities: {
          add: [],
          drop: [],
        },
        seLinuxOptions: {
          level: 's0:c0,c1',
        },
        */
      },
      nameRules: [
        v => !!v || 'Name is required',
        v => v.length <= 60 || 'Name must be less than 60 characters',
        v => /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(v) || 'Allowed characters : [a-zA-Z0-9_-]',
      ],
      repositoryRules: [
        //v => !!v || 'Repository is required',
        v => v.length <= 60 || 'Repository must be less than 60 characters',
        //    ((git|ssh|http(s)?)|(git@[\w\.]+))(:(//)?)([\w\.@\:/\-~]+)(\.git)(/)?
        v => /((git|ssh|http(s)?)|(git@[\w.]+))(:(\/\/)?)([\w.@:/\-~]+)(\.git)(\/)?/.test(v) || 'Format "owner/repository"',
      ],
      domainRules: [
        v => !!v || 'Domain is required',
        v => v.length <= 60 || 'Name must be less than 60 characters',
        v => /^([a-z0-9|-]+[a-z0-9]{1,}\.)*[a-z0-9|-]+[a-z0-9]{1,}\.[a-z]{2,}$/.test(v) || 'Not a domain',
      ],
      cronjobScheduleRules: [
        v => !!v || 'Schedule is required',
        v => /(((\d+,)+\d+|(\d+(\/|-)\d+)|\d+|\*) ?){5,7}/.test(v) || 'Not a valid crontab format',
      ],
/*
      buildpackRules: [
        v => !!v || 'Buildpack is required',
        v => /(NodeJS|Docker)$/.test(v) || 'select a valid buildpack',
      ],
*/
    }),
    mounted() {
      if (this.$route.query.service) {
        this.loadTemplate(this.$route.query.service);
      }
      this.loadStorageClasses();
      this.loadPipeline();
      this.loadPodsizeList();
      this.loadApp(); // this may lead into a race condition with the buildpacks loaded in loadPipeline
    },
    components: {
        Addons,
    },
    methods: {
      loadTemplate(service) {
        axios.get('/api/services/'+service).then(response => {

          this.appname = response.data.name;
          this.containerPort = response.data.image.containerPort;
          this.deploymentstrategy = response.data.deploymentstrategy;

          if (response.data.deploymentstrategy == 'git') {
            this.gitrepo.ssh_url = response.data.git.repository.ssh_url;
            this.branch = response.data.git.branch;
          } else {
            this.docker.image = response.data.image.repository;
            this.docker.tag = response.data.image.tag;
          }

          this.envvars = response.data.envVars;
          this.extraVolumes = response.data.extraVolumes;
          this.cronjobs = response.data.cronjobs;
          this.addons = response.data.addons;


          // Open Panel if there is some data to show
          if (this.envvars.length > 0) {
            this.panel.push(2)
          }
          if (this.extraVolumes.length > 0) {
            this.panel.push(4)
          }
          if (this.cronjobs.length > 0) {
            this.panel.push(5)
          }
        });
      },
      changeName(name) {
        this.domain = name+"."+this.pipelineData.domain;
      },
      loadPipeline() {
        axios.get('/api/pipelines/'+this.pipeline).then(response => {
          this.pipelineData = response.data;

          if (this.pipelineData.dockerimage) {
            this.docker.image = this.pipelineData.dockerimage;
          }

          this.loadBranches();
          this.buildpack = this.pipelineData.buildpack;

          if (this.app == 'new') {
            this.domain = this.pipelineData.domain;
            this.gitrepo.ssh_url = this.pipelineData.git.repository.ssh_url;

            /* TODO: auto select/sugest buildpack based on language
            switch (this.pipelineData.github.repository.language) {
              case "JavaScript":
                this.buildpack = 'NodeJS';
                break;
              case "Python":
                this.buildpack = 'Python';
                break;
              default:
                this.buildpackDisabled = false;
                //this.buildpack = "";
                break;
            }
            */
          }

        });
      },
      loadStorageClasses() {
        axios.get('/api/config/storageclasses').then(response => {
          for (let i = 0; i < response.data.length; i++) {
            this.storageclasses.push(response.data[i].name);
          }
        });
      },
      loadBranches() {

        // empty if not connected
        if (!this.pipelineData.git.provider ) {
          return;
        }

        // encode string to base64 (for ssh url)
        const gitrepoB64 = btoa(this.pipelineData.git.repository.ssh_url);
        const gitprovider = this.pipelineData.git.provider;

        axios.get('/api/repo/'+gitprovider+"/"+gitrepoB64+"/branches/list").then(response => {
          for (let i = 0; i < response.data.length; i++) {
            this.branchesList.push(response.data[i]);
          }
        });
      },


      loadPodsizeList() {
        axios.get('/api/config/podsize').then(response => {
          if (response.data.length > 0 && this.app == 'new') {
            this.podsize = response.data[0];
          }
          for (let i = 0; i < response.data.length; i++) {
            this.podsizes.push({
              text: response.data[i].description,
              value: response.data[i],
            });
          }
        });
      },
      updatePodsize(podsize) {
        console.log(podsize);
        //this.podsize = podsize;
      },
      /*
      updateBuildpack(buildpack) {
        console.log(buildpack);
        this.buildpack = buildpack;
      },
      */

      deleteApp() {
        axios.delete(`/api/pipelines/${this.pipeline}/${this.phase}/${this.app}`)
          .then(() => {
            // wait for 1 second and redirect to apps page
            // this avoids a race condition with the backend
            setTimeout(() => {
              this.$router.push(`/pipeline/${this.pipeline}/apps`);
            }, 1000);
          })
          .catch(error => {
            console.log(error);
          });
      },
      loadApp() {
        if (this.app !== 'new') {
          axios.get(`/api/pipelines/${this.pipeline}/${this.phase}/${this.app}`).then(response => {
            this.resourceVersion = response.data.metadata.resourceVersion;

            if (response.data.spec.ingress.tls.length > 0) {
              this.ssl = true;
            } else {
              this.ssl = false;
            }

            // Open Panel if there is some data to show
            if (response.data.spec.envVars.length > 0) {
              this.panel.push(2)
            }
            if (response.data.spec.extraVolumes.length > 0) {
              this.panel.push(4)
            }
            if (response.data.spec.cronjobs.length > 0) {
              this.panel.push(5)
            }

            this.security.readOnlyRootFilesystem = response.data.spec.image.run.securityContext?.readOnlyRootFilesystem != false; // reversed since it is a boolean

            this.deploymentstrategy = response.data.spec.deploymentstrategy;
            this.appname = response.data.spec.name;
            this.buildpack = {
              run: response.data.spec.image.run,
              build: response.data.spec.image.build,
              fetch: response.data.spec.image.fetch,
            }
            this.gitrepo = response.data.spec.gitrepo;
            this.domain = response.data.spec.domain;
            this.branch = response.data.spec.branch;
            this.imageTag= response.data.spec.imageTag;
            this.docker.image = response.data.spec.image.repository || '';
            this.docker.tag = response.data.spec.image.tag || 'latest';
            this.autodeploy = response.data.spec.autodeploy;
            this.domain = response.data.spec.domain;
            this.envvars = response.data.spec.envVars;
            this.extraVolumes = response.data.spec.extraVolumes;
            this.containerPort = response.data.spec.image.containerPort;
            this.podsize = response.data.spec.podsize;
            this.autoscale = response.data.spec.autoscale;
            this.webreplicas = response.data.spec.web.replicaCount;
            this.workerreplicas = response.data.spec.worker.replicaCount;
            this.webreplicasrange = [response.data.spec.web.autoscaling.minReplicas, response.data.spec.web.autoscaling.maxReplicas];
            this.workerreplicasrange = [response.data.spec.worker.autoscaling.minReplicas, response.data.spec.worker.autoscaling.maxReplicas];
            this.cronjobs = this.cronjobUnformat(response.data.spec.cronjobs) || [];
            this.addons= response.data.spec.addons || [];
            this.security.vulnerabilityScans = response.data.spec.vulnerabilityscan.enabled;
          });
        }
      },
      updateApp() {
        let postdata = {
          resourceVersion: this.resourceVersion,
          buildpack: this.buildpack,
          appname: this.appname,
          gitrepo: this.pipelineData.git.repository,
          branch: this.branch,
          deploymentstrategy: this.deploymentstrategy,
          image : {
            containerport: this.containerPort,
            repository: this.docker.image,
            tag: this.docker.tag,
            fetch: this.buildpack.fetch,
            build: this.buildpack.build,
            run: this.buildpack.run,
          },
          autodeploy: this.autodeploy,
          domain: this.domain,
          ssl: this.ssl,
          envvars: this.envvars,
          podsize: this.podsize,
          autoscale: this.autoscale,
          web: {
            replicaCount: this.webreplicas || 0,
            autoscaling: {
              minReplicas: this.webreplicasrange[0] || 0,
              maxReplicas: this.webreplicasrange[1] || 0,
              targetCPUUtilizationPercentage : 80,
              targetMemoryUtilizationPercentage : 80,
            },
          },
          worker: {
            replicaCount: this.workerreplicas || 0,
            autoscaling: {
              minReplicas: this.workerreplicasrange[0] || 0,
              maxReplicas: this.workerreplicasrange[1] || 0,
              targetCPUUtilizationPercentage : 80,
              targetMemoryUtilizationPercentage : 80,
            },
          },
          extraVolumes: this.extraVolumes,
          cronjobs: this.cronjobFormat(this.cronjobs),
          addons: this.addons,
          security: this.security,

        }
/*
        if (this.security.vulnerabilityScans) {
          postdata.vulnerabilityscan = {
            enabled: true,
            image: {
              repository: "aquasec/trivy",
              tag: "latest",
            },
          }
        } else {
          postdata.vulnerabilityscan = {
            enabled: false,
          }
        }
*/


        postdata.image.run.securityContext = {
            readOnlyRootFilesystem: this.security.readOnlyRootFilesystem,
            //runAsNonRoot: true,
        }

        axios.put(`/api/pipelines/${this.pipeline}/${this.phase}/${this.app}`, postdata
        ).then(response => {
          this.$router.push(`/pipeline/${this.pipeline}/apps`);
          console.log(response);
        }).catch(error => {
          console.log(error);
        });
      },
      createApp() {
        if (
          (this.buildpack.build.command !== this.pipelineData.buildpack.build.command) ||
          (this.buildpack.run.command !== this.pipelineData.buildpack.run.command)
        ){
          this.buildpack.name = "custom";
        }

        let postdata = {
          pipeline: this.pipeline,
          buildpack: this.buildpack,
          phase: this.phase,
          appname: this.appname.toLowerCase(),
          gitrepo: this.pipelineData.git.repository,
          branch: this.branch,
          deploymentstrategy: this.deploymentstrategy,
          image : {
            containerport: this.containerPort,
            repository: this.docker.image,
            tag: this.docker.tag,
            fetch: this.buildpack.fetch,
            build: this.buildpack.build,
            run: this.buildpack.run,
          },
          autodeploy: this.autodeploy,
          domain: this.domain.toLowerCase(),
          ssl: this.ssl,
          envvars: this.envvars,
          podsize: this.podsize,
          autoscale: this.autoscale,
          web: {
            replicaCount: this.webreplicas || 0,
            autoscaling: {
              minReplicas: this.webreplicasrange[0] || 0,
              maxReplicas: this.webreplicasrange[1] || 0,
              targetCPUUtilizationPercentage : 80,
              targetMemoryUtilizationPercentage : 80,
            },
          },
          worker: {
            replicaCount: this.workerreplicas || 0,
            autoscaling: {
              minReplicas: this.workerreplicasrange[0] || 0,
              maxReplicas: this.workerreplicasrange[1] || 0,
              targetCPUUtilizationPercentage : 80,
              targetMemoryUtilizationPercentage : 80,
            },
          },
          extraVolumes: this.extraVolumes,
          cronjobs: this.cronjobFormat(this.cronjobs),
          addons: this.addons,
          security: this.security,
        }

        postdata.image.run.securityContext = {
            readOnlyRootFilesystem: this.security.readOnlyRootFilesystem,
            //runAsNonRoot: true,
        }

        axios.post(`/api/apps`, postdata)
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
      removeEnvLine(index) {
        for (let i = 0; i < this.envvars.length; i++) {
          if (this.envvars[i].name === index) {
            this.envvars.splice(i, 1);
          }
        }
      },
      addVolumeLine() {
        this.extraVolumes.push({
          name: 'example-volume',
          emptyDir: false,
          storageClass: 'standard',
          size: '1Gi',
          accessModes: [
            'ReadWriteMany',
          ],
          mountPath: '/example/path',
        });
      },
      removeVolumeLine(index) {
        for (let i = 0; i < this.extraVolumes.length; i++) {
          if (this.extraVolumes[i].name === index) {
            this.extraVolumes.splice(i, 1);
          }
        }
      },
      addCronjobLine() {
        this.cronjobs.push({
          name: 'hello world',
          schedule: '* * * * *',
          image: 'busybox:1.28',
          command: '/bin/sh -c echo hello world',
          restartPolicy: 'OnFailure',
        });
      },
      removeCronjobLine(index) {
        for (let i = 0; i < this.cronjobs.length; i++) {
          if (this.cronjobs[i].name === index) {
            this.cronjobs.splice(i, 1);
          }
        }
      },
      cronjobFormat(cronjobs) {
        cronjobs.map(cronjob => {
          // TODO make sure cronjob has a valid structure
          cronjob.name = cronjob.name.replace(/\s/g, '-');
          cronjob.restartPolicy = 'OnFailure';

          //cronjob.command = cronjob.command.replace(/\s/g, '');
          //cronjob.command = cronjob.command.replace(/\//g, '-');
          //cronjob.command = cronjob.command.replace(/\*/g, '*');
          //cronjob.command = cronjob.command.split(" ");
          cronjob.command = cronjob.command.match(/(?:[^\s"]+|"[^"]*")+/g)
        });
        return cronjobs;
      },
      cronjobUnformat(cronjobs) {
        cronjobs.map(cronjob => {
          cronjob.command = cronjob.command.join(" ");
        });
        return cronjobs;
      },
    },
}
</script>

<style lang="scss">
.v-expansion-panel-content {
    background: cardBackground;
}
.v-expansion-panel-header {
    background: cardBackground;
}
</style>
