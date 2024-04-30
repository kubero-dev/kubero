<template>
    <v-container>
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
                Throuput (req/sec)
                <VueApexCharts type="line" height="220" :options="httpStusCodeOptions" :series="httpStusCodeData"></VueApexCharts>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12" sm="12" md="12">
                Throuput (req)
                <VueApexCharts type="line" height="220" :options="httpStusCodeOptions" :series="httpStusCodeDataIncrease"></VueApexCharts>
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
          group: 'social',
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
            text: 'Memory (MiB)',
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
          group: 'social',
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
            text: 'Load',
          },
        }
      },
      ResponsetimeOptions: {
        fill: {
          opacity: 0.2,
          type: 'solid',
        },
        legend: {
            position: 'right',
        },
        colors: colors,
        chart: {
          id: 'responsetime',
          group: 'social',
          stacked: false,
          animations: {
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
          position: 'top',
          tickAmount: 10,
          labels: {
            show: true,
            trim: true,
            offsetY: 17,
          }
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
          group: 'social',
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
            text: 'Load',
          },
        }
      },
      loadData: [
        {
            name: '1m',
            data: [] as number[],
        },
        {
            name: '5m',
            data: [] as number[],
        },
        {
            name: '10m',
            data: [] as number[],
        }
      ],
      memoryData: [] as {
            name: string,
            data: {
                x: string, 
                y: number}[],
      }[],
      responsetimeData: [
        {
            name: 'max',
            data: [] as number[],
        },
        {
            name: '99th',
            data: [] as number[],
        },
        {
            name: '95th',
            data: [] as number[],
        },
        {
            name: '50th',
            data: [] as number[],
        },
      ],
      httpStusCodeData: [] as {
            name: string,
            data: number[][],
      }[],
      httpStusCodeDataIncrease: [] as {
            name: string,
            data: number[][],
      }[],
    }),
    components: {
        VueApexCharts,
    },
    mounted() {
        this.getMemoryMetrics();
        this.getLoadMetrics();
        this.getHttpStatusCodeMetrics();
        this.getResponseTimeMetrics(150);
        this.getHttpStatusCodeIncreaseMetrics();
    },
    methods: {
        generateMetrics(limit: number) {
            // generate a set of random metrics
            let metrics = [];
            for (let i = 0; i < limit; i++) {
                metrics.push(Math.floor(Math.random() * 100));
            }
            return metrics;
        },
        getMemoryMetrics() {
            
            axios.get(`/api/longtermmetrics/memory/${this.pipeline}/${this.phase}/${this.app}`)
            .then((response) => {
                this.memoryData = response.data;
            })
            .catch((error) => {
                console.log(error);
            });
            
            //this.memoryData[0].data = this.generateMetrics(limit);
        },
        getLoadMetrics() {
            axios.get(`/api/longtermmetrics/load/${this.pipeline}/${this.phase}/${this.app}`)
            .then((response) => {
              this.loadData = response.data;
            })
            .catch((error) => {
                console.log(error);
            });
            /*
            this.loadData[0].data = this.generateMetrics(limit);
            this.loadData[1].data = this.generateMetrics(limit);
            this.loadData[2].data = this.generateMetrics(limit);
            */
        },
        getHttpStatusCodeMetrics() {
            axios.get(`/api/longtermmetrics/httpstatuscodes/${this.pipeline}/${this.phase}/${this.host}/rate`)
            .then((response) => {
              this.httpStusCodeData = response.data;
            })
            .catch((error) => {
                console.log(error);
            });
            /*
            this.httpStusCodeData[0].data = this.generateMetrics(limit);
            this.httpStusCodeData[1].data = this.generateMetrics(limit);
            this.httpStusCodeData[2].data = this.generateMetrics(limit);
            this.httpStusCodeData[3].data = this.generateMetrics(limit);
            */
        },
        getHttpStatusCodeIncreaseMetrics() {
            axios.get(`/api/longtermmetrics/httpstatuscodes/${this.pipeline}/${this.phase}/${this.host}/increase`)
            .then((response) => {
              this.httpStusCodeDataIncrease = response.data;
            })
            .catch((error) => {
                console.log(error);
            });
        },
        getResponseTimeMetrics(limit: number) {
            /*
            axios.get(`/api/metrics/responsetime/${this.pipeline}/${this.phase}/${this.app}`)
            .then((response) => {
                console.log(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
            */
           this.responsetimeData[0].data = this.generateMetrics(limit);
           this.responsetimeData[1].data = this.generateMetrics(limit);
           this.responsetimeData[2].data = this.generateMetrics(limit);
           this.responsetimeData[3].data = this.generateMetrics(limit);
        }
    },
});
</script>