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
            label="Pipeline name *"
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
            label="Pipeline domain"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col
          cols="12"
          md="8"
        >
        <v-tabs icons-and-text v-model="repotab" color="#8560A9" @change="loadRepository">
            <v-tab href="#github" :disabled="this.repositoriesList.github == false || !newPipeline">Github <v-icon>mdi-github</v-icon> </v-tab>
            <v-tab href="#gitea" :disabled="this.repositoriesList.gitea == false || !newPipeline">Gitea <v-icon class="gitea"></v-icon></v-tab>
            <v-tab href="#gitlab" :disabled="this.repositoriesList.gitlab == false || !newPipeline">Gitlab <v-icon>mdi-gitlab</v-icon></v-tab>
            <!--<v-tab href="#onedev" disabled>oneDev <v-icon class="onedev"></v-icon></v-tab>-->
            <v-tab href="#gogs" :disabled="this.repositoriesList.gogs == false || !newPipeline">Gogs <v-icon class="gogs"></v-icon></v-tab>
            <v-tab href="#bitbucket" :disabled="this.repositoriesList.bitbucket == false || !newPipeline">Bitbucket <v-icon>mdi-bitbucket</v-icon></v-tab>
        </v-tabs>
        </v-col>
      </v-row>

      <v-row>
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
        v-if="showConnectButton"
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
                border="left"
                >{{this.repository_status.statusTxt}}
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
        v-if="repository_status.connected && repository_status.statusTxt == 'Repository Connected' && repotab && repotab!='docker'"
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
            label="Buildpack *"
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
            :disabled="phase.name == 'review' && repository_status.connected === false"
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
                v-if="newPipeline"
                elevation="2"
                @click="createPipeline()"
                :disabled="!valid
                        || !gitrepo
                        || !buildpack"
                >Create</v-btn>
            <v-btn
                color="primary"
                v-if="!newPipeline"
                elevation="2"
                @click="updatePipeline()"
                :disabled="!valid
                        || !gitrepo
                        || !buildpack"
                >Update</v-btn>
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
        default: "new"
      }
    },
    data: () => ({
      newPipeline: true,
      resourceVersion: undefined,
      repotab: 'github', //selected tab
      buildpack: undefined,
      buildpackList: [],
      valid: false, // final form validation
      pipelineName: '',
      domain: '',
      reviewapps: true,
      gitrepo: '',
      gitrepoItems: [],
      contextList: [], // a list of kubernets contexts in the kubeconfig to select from
      repositoriesList: { // a list of available repositories to connect with
        github: false,
        gitea: false,
        gitlab: false,
        bitbucket: false,
        docker: true
      },
      git: {
        keys: {},
        repository: {},
        webhooks: {},
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
          data: {},
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
        v => !!v || 'Image is required'
      ],
      nameRules: [
        v => !!v || 'Name is required',
        v => v.length <= 60 || 'Name must be less than 60 characters',
        v => /^[a-z0-9][a-z0-9-]*$/.test(v) || 'Allowed characters : [a-z0-9-]',
      ],
      domainRules: [
        v => v.length <= 90 || 'Name must be less than 90 characters',
        v => /^([a-z0-9|-]+[a-z0-9]{1,}\.)*[a-z0-9|-]+[a-z0-9]{1,}\.[a-z]{2,}$/.test(v) || 'Not a domain',
      ],
      repositoryRules: [
        v => !!v || 'Repository is required',
        v => v.length <= 120 || 'Repository must be less than 120 characters',
        //    ((git|ssh|http(s)?)|(git@[\w\.]+))(:(//)?)([\w\.@\:/\-~]+)(\.git)(/)?
        v => /((git|ssh|http(s)?)|(git@[\w.]+))(:(\/\/)?)([\w.@:/\-~]+)(\.git)(\/)?/.test(v) || 'Format "owner/repository"',
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
        });
      },
      connectRepo() {
        console.log(this.gitrepo);
        console.log(this.repotab);
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

      connectRepository(repo) {
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

        axios.post(`/api/pipelines`, {
          pipelineName: this.pipelineName,
          domain: this.domain,
          gitrepo: this.gitrepo,
          phases: this.phases,
          reviewapps: this.reviewapps,
          git: this.git,
          dockerimage: '',
          deploymentstrategy: "git",
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
          deploymentstrategy: "git",
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
      },
    },
}
</script>

<style lang="scss">
.alert i.v-icon.v-icon {
  color: white !important;
}

.gogs{
    background-image: url('./../../../public/img/icons/gogs.svg');
    background-size: contain;
    background-repeat: no-repeat;
    filter: invert(39%) sepia(47%) saturate(584%) hue-rotate(228deg) brightness(95%) contrast(80%);
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
    background-image: url('./../../../public/img/icons/gitea.svg');
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