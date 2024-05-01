<template>
    <v-container>
        <v-row class="justify-space-between mb-2">
            <v-col cols="8" sm="8" md="8" lg="8" xl="8">
                <!--<h1>Vulnerabilities in {{ app }}</h1>-->
            </v-col>
            <v-col>
              <v-select
                label="Select"
                v-model="scale"
                :items="[ '2h', '24h', '7d' ]"
                density="compact"
              ></v-select>
            </v-col>
            <v-col>
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
                Memory
                <VueApexCharts type="area" height="220" :options="memoryOptions" :series="memoryData"></VueApexCharts>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12" sm="12" md="12">
                Load
                <VueApexCharts type="line" height="220" :options="LoadOptions" :series="loadData"></VueApexCharts>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12" sm="12" md="12">
                Responsetime
                <VueApexCharts type="area" height="220" :options="ResponsetimeOptions" :series="responsetimeData"></VueApexCharts>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12" sm="12" md="12">
                Throuput
                <VueApexCharts type="line" height="220" :options="httpStusCodeOptions" :series="httpStusCodeData"></VueApexCharts>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12" sm="12" md="12">
                <VueApexCharts type="area" height="220" :options="httpStusCodeIncreaseOptions" :series="httpStusCodeDataIncrease"></VueApexCharts>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import VueApexCharts from "vue3-apexcharts";

import axios from "axios";

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
            position: 'right',
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
            text: 'req/sec',
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
            text: 'req',
          },
        }
      },
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
      scale: '24h' as '2h'| '24h' | '7d',
    }),
    components: {
        VueApexCharts,
    },
    mounted() {
        this.refreshMetrics();
    },
    watch: {
        scale: function (val) {
          this.refreshMetrics();
        }
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
        refreshMetrics() {
            this.getMemoryMetrics();
            this.getLoadMetrics();
            this.getHttpStatusCodeMetrics();
            this.getResponseTimeMetrics();
            this.getHttpStatusCodeIncreaseMetrics();
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
        }
    },
});
</script>