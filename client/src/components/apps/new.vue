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
          <v-switch
            v-model="deploymentstrategyGit"
            :label="`Deployment strategy: ${appDeploymentStrategy}`"
            color="primary"
            inset
        ></v-switch>
        </v-col>
      </v-row>

      <v-row
        v-if="appDeploymentStrategy == 'git'">
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
        v-if="appDeploymentStrategy == 'git'">
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
        v-if="appDeploymentStrategy == 'git'">
        <v-col
          cols="12"
          md="6"
        >
          <v-switch
            v-model="autodeploy"
            :label="`Autodeploy: ${autodeploy.toString()}`"
            inset
          ></v-switch>
        </v-col>
      </v-row>

      <v-row
        v-if="appDeploymentStrategy == 'docker'">
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
        v-if="appDeploymentStrategy == 'docker'">
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

<!--
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
            :disabled="buildpackDisabled"
            :rules="buildpackRules"
          ></v-select>
        </v-col>
      </v-row>
-->
      <v-divider class="ma-5"></v-divider>
      <!-- ENV VARS-->
      <h4 class="text-uppercase">Environment vars</h4>
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

      <v-divider class="ma-5"></v-divider>
      <!-- PROVISIONING -->
      <h4 class="text-uppercase">Resources</h4>
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
            :label="`Autoscale: ${autoscale.toString()}`"
            inset
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

      <v-divider class="ma-5"></v-divider>
      <!-- CRONJOBS -->
      <h4 class="text-uppercase">Cronjobs</h4>
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


      <v-divider class="ma-5"></v-divider>
      <!-- ADDONS -->
      <h4 class="text-uppercase">Addons</h4>
      <v-row>
        <v-col v-for="addon in addons" v-bind:key="addon.id"
          cols="12"
          md="2"
        >

          <v-card color="#F7F8FB">
            <v-list-item-content class="justify-center">
              <div class="mx-auto text-center">
                <v-avatar
                  size="57"
                  rounded
                ><img
                :src="'/img/addons/'+addon.kind+'.png'"
                :alt="addon.name"
                >
                </v-avatar>
                <h3>{{ addon.name }}</h3>
                <p class="text-caption mt-1">
                  {{ addon.version.installed }}
                </p>
                <v-divider class="my-3"></v-divider>
                <v-btn
                  depressed
                  rounded
                  text
                  color="red"
                  @click="deleteAddon(addon)"
                >
                  delete
                </v-btn>
              </div>
            </v-list-item-content>
          </v-card>


        </v-col>
      </v-row>

      <Addons :addons="addons"/>

      <!-- SUBMIT -->
      <v-row>
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
      valid: false,
      buildpack: undefined,
      deploymentstrategyGit: true,
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
        tag: 'main',
      },
      autodeploy: true,
      domain: '',
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
      addons: [
        /*
        {
          id: "redis",
          name: 'Redis',
          version: 'v0.0.1'
        },
        */

      ],
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
    computed: {
      // a computed getter
      appDeploymentStrategy() {
        // `this` points to the component instance
        return this.deploymentstrategyGit ? 'git' : 'docker'
      }
    },
    mounted() {
      this.loadApp();
      this.loadPodsizeList();
      this.loadPipeline();
    },
    components: {
        Addons,
    },
    methods: {
      loadPipeline() {
        axios.get('/api/pipelines/'+this.pipeline).then(response => {
          this.pipelineData = response.data;

          if (this.pipelineData.dockerimage) {
            this.docker.image = this.pipelineData.dockerimage;
          }


          this.buildpack = this.pipelineData.buildpack;

          this.gitrepo.ssh_url = this.pipelineData.git.repository.ssh_url;

          this.loadBranches();
/*
          if (this.app == 'new') {
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
          }
*/
        });
      },
      loadBranches() {

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
      deleteAddon(addon) {
          // remove addon from local view and kuberoapp yaml
          for (let i = 0; i < this.addons.length; i++) {
            if (this.addons[i].id == addon.id) {
              this.addons.splice(i, 1);
              break;
            }
          }
      },
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
            this.resourceVersion = response.data.metadata.resourceVersion;


            this.deploymentstrategyGit = response.data.spec.deploymentstrategy == 'git';
            this.appname = response.data.spec.name;
            this.buildpack = response.data.spec.buildpack;
            this.gitrepo = response.data.spec.gitrepo;
            this.branch = response.data.spec.branch;
            this.imageTag= response.data.spec.imageTag;
            this.docker.image = response.data.spec.image.repository || '';
            this.docker.tag = response.data.spec.image.tag || 'latest';
            this.autodeploy = response.data.spec.autodeploy;
            this.domain = response.data.spec.domain;
            this.envvars = response.data.spec.envVars;
            this.containerPort = response.data.spec.image.containerPort;
            this.podsize = response.data.spec.podsize;
            this.autoscale = response.data.spec.autoscale;
            this.webreplicas = response.data.spec.web.replicaCount;
            this.workerreplicas = response.data.spec.worker.replicaCount;
            this.webreplicasrange = [response.data.spec.web.autoscaling.minReplicas, response.data.spec.web.autoscaling.maxReplicas];
            this.workerreplicasrange = [response.data.spec.worker.autoscaling.minReplicas, response.data.spec.worker.autoscaling.maxReplicas];
            this.cronjobs = this.cronjobUnformat(response.data.spec.cronjobs) || [];
            this.addons= response.data.spec.addons || [];
          });
        }
      },
      updateApp() {
        axios.put(`/api/pipelines/${this.pipeline}/${this.phase}/${this.app}`, {
          resourceVersion: this.resourceVersion,
          buildpack: this.buildpack,
          appname: this.appname,
          gitrepo: this.pipelineData.git.repository,
          branch: this.branch,
          deploymentstrategy: this.appDeploymentStrategy,
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
          envvars: this.envvars,
          podsize: this.podsize,
          autoscale: this.autoscale,
          web: {
            replicaCount: this.webreplicas || 1,
            autoscaling: {
              minReplicas: this.webreplicasrange[0] || 1,
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
          cronjobs: this.cronjobFormat(this.cronjobs),
          addons: this.addons,

        }).then(response => {
          this.$router.push(`/pipeline/${this.pipeline}/apps`);
          console.log(response);
        }).catch(error => {
          console.log(error);
        });
      },
      createApp() {
        axios.post(`/api/apps`, {
          pipeline: this.pipeline,
          buildpack: this.buildpack.name,
          phase: this.phase,
          appname: this.appname.toLowerCase(),
          gitrepo: this.pipelineData.git.repository,
          branch: this.branch,
          deploymentstrategy: this.appDeploymentStrategy,
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
          envvars: this.envvars,
          podsize: this.podsize,
          autoscale: this.autoscale,
          web: {
            replicaCount: this.webreplicas || 1,
            autoscaling: {
              minReplicas: this.webreplicasrange[0] || 1,
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
          cronjobs: this.cronjobFormat(this.cronjobs),
          addons: this.addons,
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
      removeEnvLine(index) {
        for (let i = 0; i < this.envvars.length; i++) {
          if (this.envvars[i].name === index) {
            this.envvars.splice(i, 1);
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
</style>