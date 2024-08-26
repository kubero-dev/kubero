<template>
    <v-container>
        <v-row class="justify-space-between mb-2">
            <v-col cols="10" sm="10" md="10" lg="10" xl="10">
                <!--<h1>Vulnerabilities in {{ app }}</h1>-->
            </v-col>
            <v-col>
                <Buildsform :pipeline="pipeline" :phase="phase" :app="app" :appData="appData"></Buildsform>
            </v-col>
        </v-row>

        <v-row v-for="b in builds"
                :key="b.name" :id="b.name">
            <v-col cols="12">
            <v-card 
                elevation="2" 
                outlined 
                color="cardBackground"
                :loading="b.state == 'Active'"
                >

                <template v-slot:loader="{ isActive }">
                    <v-progress-linear
                        :active="isActive"
                        color="primary"
                        height="2"
                        indeterminate
                    ></v-progress-linear>
                </template>
                <div>
                    <v-card-title>
                        <v-row>
                            <v-col cols="1">
                                <v-badge v-if="b.state != 'Active'" :color="getStatusColor(b.state)" :icon="getStatusIcon(b.state)" location="top end">
                                    <v-icon class="mb-2 buildpacks" v-if="b.buildstrategy == 'buildpacks'"></v-icon>
                                    <v-icon class="mb-2 nixpacks" v-if="b.buildstrategy == 'nixpacks'"></v-icon>
                                    <v-icon class="mb-2 dockerfile" v-if="b.buildstrategy == 'dockerfile'"></v-icon>
                                </v-badge>
                                <span v-else>
                                    <v-icon class="mb-2 buildpacks" v-if="b.buildstrategy == 'buildpacks'"></v-icon>
                                    <v-icon class="mb-2 nixpacks" v-if="b.buildstrategy == 'nixpacks'"></v-icon>
                                    <v-icon class="mb-2 dockerfile" v-if="b.buildstrategy == 'dockerfile'"></v-icon>
                                </span>

                            </v-col>
                            <v-col cols="11">
                                <h4>{{ b.name }}</h4>
                            </v-col>
                        </v-row>
                    </v-card-title>
                    <v-card-subtitle>
                      created: {{ b.creationTimestamp }} | duration : {{ msToTime(parseInt(b.duration)) }}
                    </v-card-subtitle>
                    <v-card-text>
                        <v-row>
                            <v-col cols="10">
                                <v-chip
                                    small
                                    label
                                    class="ma-1"
                                    >
                                    <v-icon start icon="mdi-docker"></v-icon>
                                    {{ b.image }}:{{ b.tag }}
                                  </v-chip>
                                <v-chip
                                    small
                                    label
                                    class="ma-1"
                                    >
                                    <v-icon start icon="mdi-git"></v-icon>
                                    {{ b.gitrepo }}:{{ b.gitref }}
                                  </v-chip>
                            </v-col>
                            <v-col cols="2">
                                <v-row class="justify-end">
                                  <v-btn
                                  elevation="2"
                                  fab
                                  small
                                  class="ma-2"
                                  color="secondary"
                                  @click="deleteBuild(b.name)"
                                  >
                                      <v-icon color="primary">
                                          mdi-delete
                                      </v-icon>
                                  </v-btn>
                                  <v-btn
                                  elevation="2"
                                  fab
                                  small
                                  class="ma-2"
                                  color="secondary"
                                  v-if="b.state != 'Active'"
                                  @click="showLogs(b.name)"
                                  >
                                      <v-icon color="primary">
                                          mdi-format-align-justify
                                      </v-icon>
                                  </v-btn>
                                  <!--
                                  <v-btn
                                  elevation="2"
                                  fab
                                  small
                                  class="ma-2"
                                  color="secondary"
                                  @click="triggerRebuild(b.metadata.name)"
                                  >
                                      <v-icon color="primary">
                                          mdi-reload
                                      </v-icon>
                                  </v-btn>
                                  -->
                                </v-row>
                            </v-col>
                        </v-row>
                        <v-expand-transition>
                            <v-row v-if="b.name == activeLogs">
                                <Logs :pipeline=pipeline :phase=phase :app=app :deploymentstrategy=appData?.spec.deploymentstrategy :buildstrategy=b?.buildstrategy logType="buildlogs" :buildID="b.name" height="400px"/>
                            </v-row>
                        </v-expand-transition>
                    </v-card-text>
                </div>
            </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>


<script lang="ts">
import axios from "axios";
import { defineComponent } from 'vue'
import Buildsform from './buildsform.vue'
import Logs from './logs.vue'
import { useKuberoStore } from '../../stores/kubero'

const socket = useKuberoStore().kubero.socket as any;

type Build = {
  creationTimestamp: string
  name: string
  app: string
  pipeline: string
  phase: string
  buildstrategy: string
  backoffLimit: number
  state: string
  duration: string
  gitrepo: string
  gitref: string
  image: string
  tag: string
  status: {
    conditions: Array<{
      lastProbeTime: string
      lastTransitionTime: string
      message: string
      reason: string
      status: string
      type: string
    }>
    failed: number
    ready: number
    startTime: string
    terminating: number
    uncountedTerminatedPods: {}
  }
}

export default defineComponent({
    setup() {
        return {
            socket,
        }
    },
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
      },
      appData: {
        type: Object,
      }
    },
    data() {
        return {
            builds: [] as Build[],
            activeLogs: "",
            reloadTimer: null as any,
            clockTimer: null as any,
        }
    },
    mounted() {
        this.loadDeployments();

        socket.on('newBuild', (instances: any) => {
            // sleep for 2 second to allow the backend to update the deployment
            setTimeout(() => {
                this.loadDeployments();
            }, 2000);
        });
        
        
        this.reloadTimer = setInterval(() => {
            this.updateStatus();
        }, 10000);
        

        this.clockTimer = setInterval(() => {
            this.builds.forEach((b) => {
                if (b.state == "Active") {
                    b.duration = (new Date().getTime() - new Date(b.creationTimestamp).getTime()).toString();
                }
            });
        }, 1000);

    },
    unmounted() {
        clearInterval(this.reloadTimer);
        clearInterval(this.clockTimer);
    },
    methods: {
        deleteBuild(deploymentName: string) {
            try {
                axios.delete(`/api/deployments/${this.pipeline}/${this.phase}/${this.app}/${deploymentName}`);
                this.builds = this.builds.filter((d) => d.name !== deploymentName);
            } catch (error) {
                console.error(error);
            }
        },
        triggerRebuild(deploymentName: string) {
            console.log("TODO : Trigger rebuild for deployment", deploymentName);
        },
        loadDeployments() {
            const response = axios.get(`/api/deployments/${this.pipeline}/${this.phase}/${this.app}`)
            .then(response => {
                this.builds = response.data as Build[];
            })
            .catch(error => {
                console.log(error);
            });
        },
        updateStatus() {
            axios.get(`/api/deployments/${this.pipeline}/${this.phase}/${this.app}`)
            .then(response => {
                const builds = response.data as Build[];
                builds.forEach((d: Build) => {
                    const job = this.builds.find((dep) => dep.name == d.name);
                    if (job && job.state) {
                        job.state = d.state;
                    }
                });
            })
            .catch(error => {
                console.log(error);
            });
        },

        msToTime(duration: number) {
            const seconds = Math.floor((duration / 1000) % 60);
            const minutes = Math.floor((duration / (1000 * 60)) % 60);
            return `${minutes}m ${seconds}s`;
        },
        getStatusColor(status: string | undefined) {
            if (status == "Active") {
                return "warning";
            } else if (status == "Succeeded") {
                return "success";
            } else if (status == "Failed") {
                return "error";
            } else {
                return "grey";
            }
        },
        getStatusIcon(status: string | undefined) {
            if (status == "Active") {
                return "mdi-clock-outline";
            } else if (status == "Succeeded") {
                return "mdi-check-bold";
            } else if (status == "Failed") {
                return "mdi-exclamation-thick";
            } else {
                return "mdi-help";
            }
        },
        showLogs(deploymentName: string) {
            //window.open(`/popup/logs/${this.pipeline}/${this.phase}/${this.app}/${deploymentName}`, '_blank', 'popup=yes,location=no,height=1000,width=1000,scrollbars=yes,status=no');
            this.activeLogs = deploymentName;
        }
    },
    components: {
        Buildsform,
        Logs,
    }

})

</script>


<style scoped>


.buildpacks{
    background-image: url('./../../../public/img/icons/buildpacks.svg');
    background-size: contain;
    background-repeat: no-repeat;
    filter: brightness(0) saturate(100%) invert(28%) sepia(0%) saturate(78%) hue-rotate(197deg) brightness(95%) contrast(83%);
    /*filter: invert(39%) sepia(47%) saturate(584%) hue-rotate(228deg) brightness(95%) contrast(80%);
    /*filter: invert(93%) sepia(49%) saturate(7411%) hue-rotate(184deg) brightness(87%) contrast(90%);*/
}

.buildpacks::before {
    height: 23px;
    width: 23px;
    visibility: hidden;
    content: "";
}

.dockerfile{
    background-image: url('./../../../public/img/icons/docker.svg');
    background-size: contain;
    background-repeat: no-repeat;
    filter: brightness(0) saturate(100%) invert(28%) sepia(0%) saturate(78%) hue-rotate(197deg) brightness(95%) contrast(83%);
    /*filter: invert(39%) sepia(47%) saturate(584%) hue-rotate(228deg) brightness(95%) contrast(80%);
    /*filter: invert(93%) sepia(49%) saturate(7411%) hue-rotate(184deg) brightness(87%) contrast(90%);*/
}

.dockerfile::before {
    height: 23px;
    width: 23px;
    visibility: hidden;
    content: "";
}

.nixpacks{
    background-image: url('./../../../public/img/icons/nixos.svg');
    background-size: contain;
    background-repeat: no-repeat;
    filter: brightness(0) saturate(100%) invert(28%) sepia(0%) saturate(78%) hue-rotate(197deg) brightness(95%) contrast(83%);
    /*filter: invert(39%) sepia(47%) saturate(584%) hue-rotate(228deg) brightness(95%) contrast(80%);
    /*filter: invert(93%) sepia(49%) saturate(7411%) hue-rotate(184deg) brightness(87%) contrast(90%);*/
}

.nixpacks::before {
    height: 23px;
    width: 23px;
    visibility: hidden;
    content: "";
}
</style>