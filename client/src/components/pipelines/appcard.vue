<template>
<v-card
    :loading="loadingState"
    class="mt-5 mx-1"
    outlined
    elevation="2"
    color="cardBackground"
    style="max-width: 600px;"
    v-if="deleted === false"
    >

    <template slot="progress">
      <v-progress-linear
        color="primary"
        height="2"
        indeterminate
      ></v-progress-linear>
    </template>

    <v-card-title class="d-flex align-center">
      <img
        :src="(app.deploymentstrategy != 'docker') ? '/img/icons/hexagon1.svg' : '/img/icons/hexagon1-empty-bold-tp.svg'"
        alt="app icon"
        style="width: 35px; height: 35px; margin-right: 10px;"
      >
      <router-link :to="{ name: 'App Dashboard', params: { pipeline: pipeline, phase: phase, app: app.name }}">{{ app.name }}</router-link>
    </v-card-title>

    <v-card-text>
        <v-row
            v-if="app.deploymentstrategy != 'docker'"
            class="mx-0 my-1"
        >
            <v-icon start style="vertical-align:baseline" color="kubero">mdi-git</v-icon>
            <div class="grey--text text-subtitle-1">
                {{ app.gitrepo.ssh_url }}
            </div>
        </v-row>
        <v-row
            v-if="app.deploymentstrategy == 'docker'"
            class="mx-0 my-1"
        >
            <v-icon start x-small color="kubero">mdi-docker</v-icon>
            <div class="grey--text text-subtitle-1">
                {{ app.image.repository }}:{{ app.image.tag }}
            </div>
        </v-row>
        <p></p>
        <v-chip label class="mr-1" v-if="app.deploymentstrategy != 'docker'"><span v-if="autodeploy">Autodeploy | </span>{{ app.branch }}</v-chip>
        <v-chip label class="mr-1" v-if="app.deploymentstrategy != 'docker' && app.commithash">{{ app.commithash }}</v-chip>

    </v-card-text>

    <table style="width: 100%;" v-if="vulnSummary.unknown != undefined">
      <tbody>
        <tr>
          <td title="UNKNOWN" class="vuln-summary severity-unknown">{{ vulnSummary.unknown }}<br>UNKNOWN</td>
          <td title="LOW" class="vuln-summary severity-low">{{ vulnSummary.low }}<br>LOW</td>
          <td title="MEDIUM" class="vuln-summary severity-medium">{{ vulnSummary.medium }}<br>MEDIUM</td>
          <td title="HIGH" class="vuln-summary severity-high">{{ vulnSummary.high }}<br>HIGH</td>
          <td title="CRITICAL" class="vuln-summary severity-critical">{{ vulnSummary.critical }}<br>CRITICAL</td>
          <td title="TOTAL" class="vuln-summary severity-total">{{ vulnSummary.total }}<br>TOTAL</td>
        </tr>
      </tbody>
    </table>

    <v-divider></v-divider>
    <v-card-text v-if="metricsDisplay == 'bars'">
      <v-row>
        <v-col cols="6" class="pb-0 text-left text-caption font-weight-light">CPU</v-col>
        <v-col cols="6" class="pb-0 text-right text-caption font-weight-light">Memory</v-col>
      </v-row>
      <v-row v-for="metric in metrics" :key="metric.name" style="height:20px">
        <v-col cols="6" class="text-left"><v-progress-linear :value="metric.cpu.percentage" color="#8560A9" class="mr-6 float-left"></v-progress-linear></v-col>
        <v-col cols="6" class="text-right"><v-progress-linear :value="metric.memory.percentage" color="#8560A9" class="float-left" ></v-progress-linear></v-col>
      </v-row>
    </v-card-text>
    <v-card-text v-if="metricsDisplay == 'table'">
      <v-row>
        <v-col cols="8" class="pb-0 text-left text-caption font-weight-light">Pod</v-col>
        <v-col cols="2" class="pb-0 text-left text-caption font-weight-light">CPU</v-col>
        <v-col cols="2" class="pb-0 text-right text-caption font-weight-light">Memory</v-col>
      </v-row>
      <v-row v-for="metric in metrics" :key="metric.name" id="metrics">
        <v-col cols="8" class="py-0 text-left">{{metric.name}}</v-col>
        <v-col cols="2" class="py-0 text-left"><span style="white-space: nowrap;">{{metric.cpu.usage}}{{metric.cpu.unit}}</span></v-col>
        <v-col cols="2" class="py-0 text-right"><span style="white-space: nowrap;">{{metric.memory.usage}}{{metric.memory.unit}}</span></v-col>
      </v-row>
    </v-card-text>
    <v-divider></v-divider>

    <span v-if="app.addons.length > 0">
    <v-card-text>
      <v-avatar
        rounded
        v-for="addon in app.addons" :key="addon.id"
        class="pa-2"
        color="gray lighten-5"
        :image="addon.icon"
        :alt="addon.displayName">
      </v-avatar>
    </v-card-text>
    <v-divider></v-divider>
    </span>


    <v-card-actions class="ml-2">
        <v-btn
            title="Restart App"
            color="deep-purple lighten-2"
            variant="text"
            @click="restartApp()"
        >
            <v-icon>mdi-reload-alert</v-icon>
        </v-btn>
        <v-btn
            title="Details"
            color="deep-purple lighten-2"
            variant="text"
            :to="{ name: 'App Dashboard', params: { pipeline: pipeline, phase: phase, app: app.name }}"
        >
            <v-icon>mdi-page-next-outline</v-icon>
        </v-btn>
        <v-btn
            title="Edit"
            color="deep-purple lighten-2"
            variant="text"
            :to="{ name: 'App Form', params: { pipeline: pipeline, phase: phase, app: app.name }}"
        >
            <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn
            title="Open App"
            v-if="app.ingress.hosts.length > 0"
            color="deep-purple lighten-2"
            variant="text"
            :href="'//'+app.ingress?.hosts[0].host" target="_blank"
        >
            <v-icon>mdi-open-in-new</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
            title="Delete App"
            depressed
            color="deep-purple lighten-2"
            @click="deleteApp()"
        >
            <v-icon>mdi-delete</v-icon>
        </v-btn>
    </v-card-actions>
</v-card>
</template>

<script lang="ts">
import axios from "axios";
import {  defineComponent } from 'vue'
import Swal from 'sweetalert2';

type Metric = {
    name: string,
    cpu: {
        percentage: number,
        usage: number,
        unit: string,
    },
    memory: {
        percentage: number,
        usage: number,
        unit: string,
    }
}

export default defineComponent({
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
      deleted: false,
      loadingState: false,
      metrics: [] as Metric[],
      metricsDisplay: "dots",
      vulnSummary: {
        "total": undefined,
        "critical": undefined,
        "high": undefined,
        "medium": undefined,
        "low": undefined,
        "unknown": undefined
      },
      metricsInterval: 0 as any, // can't find the right type for this "as unknown as NodeJS.Timeout,"
    }),
    mounted() {
        this.loadMetrics();
        this.metricsInterval = setInterval(this.loadMetrics, 40000);
        this.loadVulnSummary();
    },
    unmounted() {
        clearInterval(this.metricsInterval);
    },
    methods: {
        deleteApp() {

          Swal.fire({
                title: "Delete App ”" + this.app.name + "” ?",
                text: "Do you want to delete this App? This action cannot be undone. It will delete all the data associated with this app.",
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Delete",
                cancelButtonText: "Cancel",
                confirmButtonColor: "rgb(var(--v-theme-kubero))",
                background: "rgb(var(--v-theme-cardBackground))",
                /*background: "rgb(var(--v-theme-on-surface-variant))",*/
                color: "rgba(var(--v-theme-on-background),var(--v-high-emphasis-opacity));",
            })
            .then((result) => {
                if (result.isConfirmed) {
                  axios.delete(`/api/apps/${this.pipeline}/${this.phase}/${this.app.name}`)
                    .then(response => {
                      //this.$router.push(`/pipeline/${this.pipeline}/apps`);
                      //console.log("deleteApp");
                      this.deleted = true;
                      //console.log(response);
                    })
                    .catch(error => {
                      console.log(error);
                    });
                return;
                }
            });
        },
        async restartApp() {
            axios.get(`/api/apps/${this.pipeline}/${this.phase}/${this.app.name}/restart`)
            .then(response => {
                //console.log(response);
                this.loadingState = true;
            })
            .catch(error => {
                console.log(error);
            });

            // TODO - this is a hack to wait for the restart to complete. It is not so easy to get the status of the restart.
            await new Promise(r => setTimeout(r, 15000));
            this.loadingState = false;
        },
        loadMetrics() {
            axios.get(`/api/metrics/resources/${this.pipeline}/${this.phase}/${this.app.name}`)
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
        },
        loadVulnSummary() {
            axios.get(`/api/security/${this.pipeline}/${this.phase}/${this.app.name}/scan/result`)
            .then(response => {
                this.vulnSummary = response.data.logsummary;
            })
            .catch(error => {
                console.log(error);
            });
        },
    }
});
</script>

<style>
.vuln-summary {
    font-size: 0.75rem;
    font-weight: 500;
    line-height: 1.5;
    letter-spacing: 0.00938em;
    text-transform: uppercase;
    color: rgba(0, 0, 0, 0.54);

    width: 16%;
    text-align: center;
}

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

<style scoped>
.v-avatar {
  background-color: rgba(70, 70, 70, 0.2);
  margin-left: 10px
}
</style>