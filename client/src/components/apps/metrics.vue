<template>
    <v-container>

      <div v-if="!kubero.metricsEnabled">
        <v-row>
            <v-col
            cols="12"
            md="6"
            style="margin-top: 20px;"
            >
                <v-alert
                    outlined
                    type="info"
                    variant="tonal"
                    border="start"
                >
                    <h3>No metrics available</h3>
                    <p>
                        Metrics are not available for this application. Metrics can be enabled in the Kubero CRD.
                    </p>
                </v-alert>
            </v-col>
        </v-row>
      </div>
      <div v-if="kubero.metricsEnabled">
        <v-row class="justify-space-between mb-2">
            <v-col cols="12" sm="12" md="8">
              <Alerts :app="app" :phase="phase" :pipeline="pipeline"/>
            </v-col>
            <v-col cols="12" sm="12" md="2">
              <v-select
                label="Select"
                v-model="scale"
                :items="[ '2h', '24h', '7d' ]"
                density="compact"
              ></v-select>
            </v-col>
            <v-col cols="12" sm="12" md="2">
                <v-btn
                    block
                    @click="refreshMetrics()"
                    color="secondary"
                    >
                    <v-icon>mdi-refresh</v-icon>
                    <span>Refresh</span>  
                </v-btn>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12" sm="12" md="12">
                Memory Usage
                <VueApexCharts type="area" height="180" :options="memoryOptions" :series="memoryData"></VueApexCharts>
            </v-col>
        </v-row>
        <v-row>
          <!--
            <v-col cols="6" sm="6" md="6">
                CPU usage
                <VueApexCharts type="line" height="180" :options="cpuOptions" :series="cpuData"></VueApexCharts>
            </v-col>
          -->
            <v-col cols="12" sm="12" md="12">
                CPU usage
                <VueApexCharts type="line" height="180" :options="cpuOptions" :series="cpuDataRate"></VueApexCharts>
            </v-col>
        </v-row>
        <!--
        <v-row>
            <v-col cols="12" sm="12" md="12">
                Pod Load
                <VueApexCharts type="line" height="180" :options="LoadOptions" :series="loadData"></VueApexCharts>
            </v-col>
        </v-row>
        -->
        <v-row>
            <v-col cols="12" sm="12" md="12">
                Responset Time
                <VueApexCharts type="area" height="180" :options="ResponsetimeOptions" :series="responsetimeData"></VueApexCharts>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12" sm="12" md="12">
                Throughput
                <VueApexCharts type="line" height="180" :options="httpStusCodeOptions" :series="httpStusCodeData"></VueApexCharts>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12" sm="12" md="12">
                <VueApexCharts type="area" height="180" :options="httpStusCodeIncreaseOptions" :series="httpStusCodeDataIncrease"></VueApexCharts>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12" sm="12" md="12">
                <VueApexCharts type="area" height="180" :options="httpResponseTrafficOptions" :series="httpResponseTrafficData"></VueApexCharts>
            </v-col>
        </v-row>
      </div>
    </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import VueApexCharts from "vue3-apexcharts";
import { useKuberoStore } from '../../stores/kubero'
import { mapState } from 'pinia'

import axios from "axios";
import Alerts from './alerts.vue';

const colors = ['#8560a9', '#a887c9', '#b99bd6', '#d2bde6']


export default defineComponent({
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
      host: {
        type: String,
        default: "a.a.localhost"
      },
    },
    data: () => ({
      memoryOptions: {
        fill: {
          opacity: 0.2,
          type: 'solid',
        },
        legend: {
            show: false,
            position: 'top',
        },
        colors: colors,
        chart: {
          id: 'memory',
          group: 'metrics',
          animations: {
            enabled: false,
          },
          toolbar: {
            show: false
          },
          zoom: {
            enabled: false,
          }
        },
        stroke: {
          curve: 'stepline',
          width: 1
        },
        dataLabels: {
          enabled: false
        },
        xaxis: {
          type: 'datetime',
          position: 'bottom',
          tickAmount: 10,
          labels: {
            rotate: -45,
            show: true,
            trim: true,
            //offsetY: 17,
            
            datetimeFormatter: {
              year: 'yyyy',
              month: "MMM 'yy",
              day: 'dd MMM HH:mm',
              hour: 'HH:mm',
            },
          },
          tooltip: {
            enabled: false,
          }
        },
        tooltip: {
          x: {
            format: 'dd MMM HH:mm:ss'
          }
        },
        yaxis: {
          decimalsInFloat: 1,
          title: {
            text: 'MiB',
          },
        }
      },
      LoadOptions: {
        fill: {
          opacity: 0.5,
          type: 'solid',
        },
        legend: {
            position: 'top',
        },
        colors: colors,
        chart: {
          id: 'load',
          group: 'metrics',
          animations: {
            enabled: false,
          },
          toolbar: {
            show: false
          },
          zoom: {
            enabled: false,
          }
        },
        stroke: {
          curve: 'stepline',
          width: 1
        },
        dataLabels: {
          enabled: false
        },
        xaxis: {
          type: 'datetime',
          position: 'bottom',
          tickAmount: 10,
          labels: {
            rotate: -45,
            show: true,
            trim: true,
            //offsetY: 17,
            
            datetimeFormatter: {
              year: 'yyyy',
              month: "MMM 'yy",
              day: 'dd MMM HH:mm',
              hour: 'HH:mm',
            },
          },
          tooltip: {
            enabled: false,
          }
        },
        tooltip: {
          x: {
            format: 'dd MMM HH:mm:ss'
          }
        },
        yaxis: {
          decimalsInFloat: 1,
          title: {
            text: 'load',
          },
        }
      },
      cpuOptions: {
        fill: {
          opacity: 0.5,
          type: 'solid',
        },
        legend: {
            show: false,
            position: 'top',
        },
        colors: colors,
        chart: {
          id: 'cpu',
          group: 'metrics',
          animations: {
            enabled: false,
          },
          toolbar: {
            show: false
          },
          zoom: {
            enabled: false,
          }
        },
        stroke: {
          curve: 'stepline',
          width: 1
        },
        dataLabels: {
          enabled: false
        },
        xaxis: {
          type: 'datetime',
          position: 'bottom',
          tickAmount: 10,
          labels: {
            rotate: -45,
            show: true,
            trim: true,
            //offsetY: 17,
            
            datetimeFormatter: {
              year: 'yyyy',
              month: "MMM 'yy",
              day: 'dd MMM HH:mm',
              hour: 'HH:mm',
            },
          },
          tooltip: {
            enabled: false,
          }
        },
        tooltip: {
          x: {
            format: 'dd MMM HH:mm:ss'
          }
        },
        yaxis: {
          decimalsInFloat: 1,
          title: {
            text: 'millicores',
          },
        }
      },
      ResponsetimeOptions: {
        fill: {
          opacity: 0.2,
          type: 'solid',
        },
        legend: {
            position: 'top',
        },
        colors: colors,
        chart: {
          id: 'responsetime',
          group: 'metrics',
          stacked: false,
          animations: {
            enabled: false,
          },
          toolbar: {
            show: false
          },
          zoom: {
            enabled: false,
          }
        },
        stroke: {
          curve: 'stepline',
          width: 1
        },
        dataLabels: {
          enabled: false
        },
        xaxis: {
          type: 'datetime',
          position: 'bottom',
          tickAmount: 10,
          labels: {
            rotate: -45,
            show: true,
            trim: true,
            //offsetY: 17,
            
            datetimeFormatter: {
              year: 'yyyy',
              month: "MMM 'yy",
              day: 'dd MMM HH:mm',
              hour: 'HH:mm',
            },
          },
          tooltip: {
            enabled: false,
          }
        },
        tooltip: {
          x: {
            format: 'dd MMM HH:mm:ss'
          }
        },
        yaxis: {
          decimalsInFloat: 1,
          title: {
            text: 'miliseconds',
          },
        }
      },
      httpStusCodeOptions: {
        fill: {
          opacity: 0.5,
          type: 'solid',
        },
        legend: {
            position: 'top',
        },
        colors: colors,
        chart: {
          id: 'httpStusCode',
          group: 'metrics',
          stacked: true,
          animations: {
            enabled: false,
          },
          toolbar: {
            show: false
          },
          zoom: {
            enabled: false,
          }
        },
        stroke: {
          curve: 'stepline',
          width: 1
        },
        dataLabels: {
          enabled: false
        },
        xaxis: {
          type: 'datetime',
          position: 'bottom',
          tickAmount: 10,
          labels: {
            rotate: -45,
            show: true,
            trim: true,
            //offsetY: 17,
            
            datetimeFormatter: {
              year: 'yyyy',
              month: "MMM 'yy",
              day: 'dd MMM HH:mm',
              hour: 'HH:mm',
            },
          },
          tooltip: {
            enabled: false,
          }
        },
        tooltip: {
          x: {
            format: 'dd MMM HH:mm:ss'
          }
        },
        yaxis: {
          decimalsInFloat: 1,
          title: {
            text: 'Req/sec',
          },
        }
      },
      httpStusCodeIncreaseOptions: {
        fill: {
          opacity: 0.5,
          type: 'solid',
        },
        legend: {
            position: 'top',
        },
        colors: colors,
        chart: {
          id: 'httpStusCode',
          group: 'metrics',
          stacked: true,
          animations: {
            enabled: false,
          },
          toolbar: {
            show: false
          },
          zoom: {
            enabled: false,
          }
        },
        stroke: {
          curve: 'stepline',
          width: 1
        },
        dataLabels: {
          enabled: false
        },
        xaxis: {
          type: 'datetime',
          position: 'bottom',
          tickAmount: 10,
          labels: {
            rotate: -45,
            show: true,
            trim: true,
            //offsetY: 17,
            
            datetimeFormatter: {
              year: 'yyyy',
              month: "MMM 'yy",
              day: 'dd MMM HH:mm',
              hour: 'HH:mm',
            },
          },
          tooltip: {
            enabled: false,
          }
        },
        tooltip: {
          x: {
            format: 'dd MMM HH:mm:ss'
          }
        },
        yaxis: {
          decimalsInFloat: 1,
          title: {
            text: 'Req',
          },
        }
      },
      httpResponseTrafficOptions: {
        fill: {
          opacity: 0.5,
          type: 'solid',
        },
        legend: {
            position: 'top',
        },
        colors: colors,
        chart: {
          id: 'httpTraffic',
          group: 'metrics',
          stacked: true,
          animations: {
            enabled: false,
          },
          toolbar: {
            show: false
          },
          zoom: {
            enabled: false,
          }
        },
        stroke: {
          curve: 'stepline',
          width: 1
        },
        dataLabels: {
          enabled: false
        },
        xaxis: {
          type: 'datetime',
          position: 'bottom',
          tickAmount: 10,
          labels: {
            rotate: -45,
            show: true,
            trim: true,
            //offsetY: 17,
            
            datetimeFormatter: {
              year: 'yyyy',
              month: "MMM 'yy",
              day: 'dd MMM HH:mm',
              hour: 'HH:mm',
            },
          },
          tooltip: {
            enabled: false,
          }
        },
        tooltip: {
          x: {
            format: 'dd MMM HH:mm:ss'
          }
        },
        yaxis: {
          decimalsInFloat: 1,
          title: {
            text: 'KB',
          },
        }
      },
      cpuData: [] as {
            name: string,
            data: number[][],
      }[],
      cpuDataRate: [] as {
            name: string,
            data: number[][],
      }[],
      loadData: [] as {
            name: string,
            data: number[][],
      }[],
      memoryData: [] as {
            name: string,
            data: number[][],
      }[],
      responsetimeData: [] as {
            name: string,
            data: number[][],
      }[],
      httpStusCodeData: [] as {
            name: string,
            data: number[][],
      }[],
      httpStusCodeDataIncrease: [] as {
            name: string,
            data: number[][],
      }[],
      httpResponseTrafficData: [] as {
            name: string,
            data: number[][],
      }[],
      scale: '2h' as '2h'| '24h' | '7d',
      timer: null as any,
    }),
    components: {
        VueApexCharts,
        Alerts,
    },
    mounted() {
        this.refreshMetrics();
        this.startTimer();
    },
    unmounted() {
        clearInterval(this.timer);
    },
    watch: {
        scale: function (val) {
          this.refreshMetrics();
        }
    },
    computed: {
      ...mapState(useKuberoStore, ['kubero']),
    },
    methods: {
        /*
        generateMetrics(limit: number) {
            // generate a set of random metrics
            let metrics = [];
            for (let i = 0; i < limit; i++) {
                metrics.push(Math.floor(Math.random() * 100));
            }
            return metrics;
        },
        */
        startTimer() {
            this.timer = setInterval(() => {
                console.log("refreshing metrics");
                this.refreshMetrics();
            }, 4000);
        },
        refreshMetrics() {
          if (this.kubero.metricsEnabled) {
            this.getMemoryMetrics();
            //this.getLoadMetrics();
            //this.getCpuMetrics();
            this.getCpuMetricsRate();
            this.getHttpStatusCodeMetrics();
            this.getResponseTimeMetrics();
            this.getHttpStatusCodeIncreaseMetrics();
            this.getResponseTrafficMetrics();
          }
        },
        getMemoryMetrics() {
            
            axios.get(`/api/longtermmetrics/memory/${this.pipeline}/${this.phase}/${this.app}`, {
                params: {
                    scale: this.scale
                }
            })
            .then((response) => {
                this.memoryData = response.data;
            })
            .catch((error) => {
                console.log(error);
            });
        },
        getLoadMetrics() {
            axios.get(`/api/longtermmetrics/load/${this.pipeline}/${this.phase}/${this.app}`, {
                params: {
                    scale: this.scale
                }
            })
            .then((response) => {
              this.loadData = response.data;
            })
            .catch((error) => {
                console.log(error);
            });
        },
        getHttpStatusCodeMetrics() {
            axios.get(`/api/longtermmetrics/httpstatuscodes/${this.pipeline}/${this.phase}/${this.host}/rate`, {
                params: {
                    scale: this.scale
                }
            })
            .then((response) => {
              this.httpStusCodeData = response.data;
            })
            .catch((error) => {
                console.log(error);
            });
        },
        getHttpStatusCodeIncreaseMetrics() {
            axios.get(`/api/longtermmetrics/httpstatuscodes/${this.pipeline}/${this.phase}/${this.host}/increase`, {
                params: {
                    scale: this.scale
                }
            })
            .then((response) => {
              this.httpStusCodeDataIncrease = response.data;
            })
            .catch((error) => {
                console.log(error);
            });
        },
        getResponseTimeMetrics() {
            axios.get(`/api/longtermmetrics/responsetime/${this.pipeline}/${this.phase}/${this.host}/increase`, {
                params: {
                    scale: this.scale
                }
            })
            .then((response) => {
              this.responsetimeData = response.data;
            })
            .catch((error) => {
                console.log(error);
            });
        },
        getResponseTrafficMetrics() {
            axios.get(`/api/longtermmetrics/traffic/${this.pipeline}/${this.phase}/${this.host}/increase`, {
                params: {
                    scale: this.scale
                }
            })
            .then((response) => {
              this.httpResponseTrafficData = response.data;
            })
            .catch((error) => {
                console.log(error);
            });
        },
        getCpuMetrics() {
            // use 'rate' instead of 'increase' when comparing to limit and request
            axios.get(`/api/longtermmetrics/cpu/${this.pipeline}/${this.phase}/${this.app}/increase`, {
                params: {
                    scale: this.scale
                }
            })
            .then((response) => {
              this.cpuData = response.data;
            })
            .catch((error) => {
                console.log(error);
            });
        },
        getCpuMetricsRate() {
            // use 'rate' instead of 'increase' when comparing to limit and request
            axios.get(`/api/longtermmetrics/cpu/${this.pipeline}/${this.phase}/${this.app}/rate`, {
                params: {
                    scale: this.scale
                }
            })
            .then((response) => {
              this.cpuDataRate = response.data;
            })
            .catch((error) => {
                console.log(error);
            });
        },
    },
});
</script>