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

        <v-row v-for="b in deployments"
                :key="b.metadata.name" :id="b.metadata.name">
            <v-col cols="12">
            <v-card 
                elevation="2" 
                outlined 
                color="cardBackground"
                >
                <div>
                    <v-card-title>
                        <v-row>
                            <v-col cols="1">
                                <v-icon class="mb-2 buildpacks" v-if="b.spec.buildstrategy == 'buildpacks'"></v-icon>
                                <v-icon class="mb-2 nixpacks" v-if="b.spec.buildstrategy == 'nixpacks'"></v-icon>
                                <v-icon class="mb-2 dockerfile" v-if="b.spec.buildstrategy == 'dockerfile'"></v-icon>
                            </v-col>
                            <v-col cols="11">
                                <h4>{{ b.metadata.name }}</h4>
                            </v-col>
                        </v-row>
                    </v-card-title>
                    <v-card-subtitle>
                      created: {{ b.metadata.creationTimestamp }} | duration : {{ b.metadata.creationTimestamp }}
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
                                    {{ b.spec.repository.image }}:{{ b.spec.repository.tag }}
                                  </v-chip>
                                <v-chip
                                    small
                                    label
                                    class="ma-1"
                                    >
                                    <v-icon start icon="mdi-git"></v-icon>
                                    {{ b.spec.git.url }}:{{ b.spec.git.ref }}
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
                                  @click="deleteBuild(b.metadata.name)"
                                  >
                                      <v-icon color="primary">
                                          mdi-delete
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
                    </v-card-text>
                </div>
            </v-card>
            </v-col>
        </v-row>
<!--
        <v-row>
            <v-col cols="12">
              <v-expansion-panels variant="accordion">
                  <v-expansion-panel
                    v-for="b in deployments"
                    :key="b.metadata.name" :id="b.metadata.name"
                  >
                      <v-expansion-panel-title>
                          <v-row>
                              <v-col cols="1">
                                  <v-icon class="mb-2 buildpacks" v-if="b.spec.buildstrategy == 'buildpacks'"></v-icon>
                                  <v-icon class="mb-2 nixpacks" v-if="b.spec.buildstrategy == 'nixpacks'"></v-icon>
                                  <v-icon class="mb-2 dockerfile" v-if="b.spec.buildstrategy == 'dockerfile'"></v-icon>
                              </v-col>
                              <v-col cols="11">
                                  <h4>{{ b.metadata.name }}</h4>
                              </v-col>
                          </v-row>
                      </v-expansion-panel-title>
                      <v-expansion-panel-text>
                        <v-row>
                            <v-col cols="10">
                                <v-chip
                                    small
                                    label
                                    class="ma-1"
                                    >
                                    <v-icon start icon="mdi-docker"></v-icon>
                                    {{ b.spec.repository.image }}:{{ b.spec.repository.tag }}
                                  </v-chip>
                                <v-chip
                                    small
                                    label
                                    class="ma-1"
                                    >
                                    <v-icon start icon="mdi-git"></v-icon>
                                    {{ b.spec.git.url }}:{{ b.spec.git.ref }}
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
                                  @click="deleteBuild(b.metadata.name)"
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
                                  @click="triggerRebuild(b.metadata.name)"
                                  >
                                      <v-icon color="primary">
                                          mdi-reload
                                      </v-icon>
                                  </v-btn>
                                </v-row>
                            </v-col>
                        </v-row>
                      </v-expansion-panel-text>
                  </v-expansion-panel>
              </v-expansion-panels>
            </v-col>
        </v-row>
        <v-row v-if="deployments.length == 0">
            <v-col cols="12">
                <v-card elevation="2" outlined color="cardBackground">
                    <v-card-title>
                        <h4>No Builds</h4>
                    </v-card-title>
                    <v-card-text>
                        <p>No builds have been created for this pipeline.</p>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
-->
    </v-container>
</template>


<script lang="ts">
import axios from "axios";
import { defineComponent } from 'vue'
import Buildsform from './buildsform.vue'
import { useKuberoStore } from '../../stores/kubero'

const socket = useKuberoStore().kubero.socket as any;

type Deployment = {
  apiVersion: string
  kind: string
  metadata: {
    creationTimestamp: string
    finalizers: Array<string>
    generation: number
    name: string
    namespace: string
    resourceVersion: string
    uid: string
  }
  spec: {
    app: string
    buildpack: {
      builder: string
      serviceAccount: string
    }
    buildstrategy: string
    dockerfile: {
      fetcher: string
      path: string
      pusher: string
    }
    git: {
      ref: string
      url: string
    }
    nixpack: {
      builder: string
      fetcher: string
      path: string
      pusher: string
    }
    pipeline: string
    podSecurityContext: {
      fsGroup: number
    }
    repository: {
      image: string
      tag: string
    }
  }
  status: {
    conditions: Array<{
      lastTransitionTime: string
      status: string
      type: string
      reason?: string
    }>
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
            deployments: [] as Deployment[],
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
    },
    methods: {
        deleteBuild(deploymentName: string) {
            try {
                axios.delete(`/api/deployments/${this.pipeline}/${this.phase}/${this.app}/${deploymentName}`);
                this.deployments = this.deployments.filter((d) => d.metadata.name !== deploymentName);
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
                this.deployments = response.data.items;
            })
            .catch(error => {
                console.log(error);
            });
    }
    },
    components: {
        Buildsform
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