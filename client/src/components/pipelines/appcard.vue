<template>
<v-card
    :loading="loadingState"
    class="mt-5"
    outlined
    elevation="2"
    color="#fafafa"
    >

    <template slot="progress">
      <v-progress-linear
        color="primary"
        height="2"
        indeterminate
      ></v-progress-linear>
    </template>

    <v-card-title><a :href="'/#/pipeline/'+pipeline+'/'+phase+'/'+app.name">{{ this.app.name }}</a></v-card-title>

    <v-card-text>
        <v-row
            v-if="this.app.deploymentstrategy != 'docker'"
            class="mx-0"
        >
            <v-icon left small>mdi-git</v-icon>
            <div class="grey--text text-subtitle-1">
                {{ this.app.gitrepo.ssh_url }}
            </div>
        </v-row>
        <v-row
            v-if="this.app.deploymentstrategy == 'docker'"
            class="mx-0"
        >
            <v-icon left small>mdi-docker</v-icon>
            <div class="grey--text text-subtitle-1">
                {{ this.app.image.repository }}:{{ this.app.image.tag }}
            </div>
        </v-row>
        <p></p>
        <v-chip label class="mr-1" v-if="this.app.deploymentstrategy != 'docker'"><span v-if="this.autodeploy">Autodeploy | </span>{{ this.app.branch }}</v-chip>
        <v-chip label class="mr-1" v-if="this.app.deploymentstrategy != 'docker' && this.app.commithash">{{ this.app.commithash }}</v-chip>

    </v-card-text>

    <v-divider></v-divider>
    <v-card-text v-if="metricsDisplay == 'bars'">
      <v-row>
        <v-col cols="6" class="pb-0 text-left">CPU</v-col>
        <v-col cols="6" class="pb-0 text-right">Memory</v-col>
      </v-row>
      <v-row v-for="metric in metrics" :key="metric.name" style="height:20px">
        <v-col cols="6" class="text-left"><v-progress-linear :value="metric.cpu.percentage" color="#8560A9" class="mr-6 float-left"></v-progress-linear></v-col>
        <v-col cols="6" class="text-right"><v-progress-linear :value="metric.memory.percentage" color="#8560A9" class="float-left" ></v-progress-linear></v-col>
      </v-row>
    </v-card-text>
    <v-card-text v-if="metricsDisplay == 'table'">
      <v-row>
        <v-col cols="8" class="pb-0 text-left">Pod</v-col>
        <v-col cols="2" class="pb-0 text-left">CPU</v-col>
        <v-col cols="2" class="pb-0 text-right">Memory</v-col>
      </v-row>
      <v-row v-for="metric in metrics" :key="metric.name" id="metrics">
        <v-col cols="8" class="py-0 text-left">{{metric.name}}</v-col>
        <v-col cols="2" class="py-0 text-left">{{metric.cpu.usage}}{{metric.cpu.unit}}</v-col>
        <v-col cols="2" class="py-0 text-right">{{metric.memory.usage}}{{metric.memory.unit}}</v-col>
      </v-row>
    </v-card-text>
    <v-divider></v-divider>

    <v-card-actions class="ml-2">
        <v-btn
            title="Restart App"
            color="deep-purple lighten-2"
            text
            @click="restartApp()"
        >
            <v-icon
                >mdi-reload-alert
            </v-icon>
        </v-btn>
        <v-btn
            title="Show Logs"
            color="deep-purple lighten-2"
            text
            :href="'/#/pipeline/'+pipeline+'/'+phase+'/'+app.name+'/detail'"
        >
            <v-icon
                >mdi-console
            </v-icon>
        </v-btn>
        <v-btn
            title="Open App"
            v-if="this.app.domain"
            color="deep-purple lighten-2"
            text
            :href="'//'+app.domain" target="_blank"
        >
            <v-icon
                >mdi-open-in-new
            </v-icon>
        </v-btn>
    </v-card-actions>
</v-card>
</template>

<script>
import axios from "axios";
export default {
    props: {
      pipeline: {
        type: String,
        default: "pipelineName"
      },
      phase: {
        type: String,
        default: "phaseName"
      },
      app: {
        type: Object,
        default: () => ({}),
      },
      gitrepo: {
        type: Object,
        default: () => ({}),
        /*
        default: {
          repository: {
            ssh_url: ""
          },
          webhook: {
            url: ""
          }
        }
        */
      },
      branch: {
        type: String,
        default: "master"
      },
      commithash: {
        type: String,
        default: "c142824f"
      },
      domain: {
        type: String,
      },
      autodeploy: {
        type: Boolean,
        default: false
      }
    },
    data: () => ({
      loadingState: false,
      metrics: [],
      metricsDisplay: "dots",
    }),
    mounted() {
        this.loadMetrics();
        setInterval(this.loadMetrics, 10000);
    },
    methods: {
        restartApp() {
            axios.get(`/api/pipelines/${this.pipeline}/${this.phase}/${this.app.name}/restart`)
            .then(response => {
                console.log(response);
                this.loadingState = true;
            })
            .catch(error => {
                console.log(error);
            });
        },
        loadMetrics() {
            axios.get(`/api/metrics/${this.pipeline}/${this.phase}/${this.app.name}`)
            .then(response => {
                for (var i = 0; i < response.data.length; i++) {
                    if (response.data[i].cpu.percentage != null && response.data[i].memory.percentage != null) {
                        this.metricsDisplay = "bars";
                    }
                    if (
                      (response.data[i].cpu.percentage == null && response.data[i].memory.percentage == null) &&
                      (response.data[i].cpu.usage != null && response.data[i].memory.usage != null)
                     ){
                        this.metricsDisplay = "table";
                    }
                }
                this.metrics = response.data;
            })
            .catch(error => {
                console.log(error);
            });
        }
    }
}
</script>

<style>
.v-btn.v-size--default {
    font-size: 0.675rem;
}

.mr-1.v-chip.v-size--default {
    font-size: 12px;
    height: 28px;
}

.v-application .text-subtitle-1 {
    font-size: 0.825rem !important;
}

.v-application .v-card__title {
    font-size: 1.1rem;
}

#metrics:nth-child(even) {
  background-color: rgba(133, 96, 169, .1);
}
#metrics:nth-child(odd) {
  background-color: rgba(133, 96, 169, .2);
}

.theme--light#metrics:nth-child(odd) {
  background-color: rgba(133, 96, 169, .2);
}
.theme--dark#metrics:nth-child(odd) {
  background-color: rgba(133, 96, 169, .2);
}
</style>