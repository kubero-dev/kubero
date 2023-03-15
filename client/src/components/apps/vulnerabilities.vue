<template>
    <v-container>
        <v-row class="justify-space-between">
            <v-col cols="6" sm="6" md="6" lg="6" xl="6">
                <h1>Vulnerabilities in {{ this.app }}</h1>
            </v-col>
        </v-row>
        <v-layout class="flex-column">
                <v-row>
                    <v-col cols="12" sm="12" md="12" lg="12" xl="12" v-if="this.renderVulnerabilities" >
                        <span v-for="target in this.vulnScanResult.logs.Results" :key="target.Target">
                            <v-card class="mb-6" v-if="target.Class != 'secret'">
                                <v-card-title>
                                    <h3 class="headline mb-0">{{ target.Target }}</h3>
                                </v-card-title>
                                <v-card-text>
                                    <v-data-table
                                        :headers="vulnHeaders"
        :expanded.sync="vulnExpanded"
        show-expand
        single-expand
        item-key="VulnerabilityID"
                                        :items="target.Vulnerabilities"
                                        :items-per-page=5
                                        :footer-props="{
                                            'items-per-page-options': [5, 10, 25, { text: 'ALL', value: -1 }]
                                        }">
                                        <!-- eslint-disable-next-line vue/valid-v-slot -->
                                        <template v-slot:item.VulnerabilityID="{ item }">
                                            <a :href="item.PrimaryURL" target="_blank"><nobr>{{ item.VulnerabilityID }}</nobr></a>
                                        </template>

                                        <!-- eslint-disable-next-line vue/valid-v-slot -->
                                        <template v-slot:item.CVSS="{ item }">
                                            <v-chip
                                            label
                                            :class="'severity-' + item.Severity.toLowerCase()"
                                            >
                                            {{ getMaxCVSS(item.CVSS) }}
                                            </v-chip>
                                        </template>

                                        <template v-slot:expanded-item="{ headers, item }">
                                            <td :colspan="headers.length">
                                                <div class="row sp-details">
                                                    {{ item }}
                                                </div>
                                            </td>
                                        </template>

                                    </v-data-table>
                                </v-card-text>
                            </v-card>
                        </span>
                    </v-col>
                </v-row>
        </v-layout>

    </v-container>
</template>

<script>
import axios from "axios";
export default {
    sockets: {
    },
    mounted() {
        this.loadVulnerabilities();
    },
    data: () => ({
        vulnScanResult: {},
        renderVulnerabilities: false,
        vulnExpanded: [],
        vulnHeaders: [
            { text: 'CVE', value: 'VulnerabilityID', filterable: false,},
            { text: 'PGK', value: 'PkgName' },
            { text: 'Title', value: 'Title' },
            { text: 'Score', value: 'Severity' },
            { text: 'CVSS', value: 'CVSS' },
        ],
    }),
    components: {
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
        default: "MISSING"
      }
    },
    methods: {
      async loadVulnerabilities() {
        axios.get(`/api/security/${this.pipeline}/${this.phase}/${this.app}/scan/result`, {
            params : {
                logdetails : true,
            }
        } )
        .then(response => {
            this.vulnScanResult = response.data;
            this.renderVulnerabilities = true;
        })
        .catch(error => {
            console.log(error);
        });

      },
      /*
      getCVSS(cvss) {
        let ret = "N/A";
        if (cvss == null) {
            return ret;
        }

        // first try to fill the value with  the first occurence of V2 score
        forEach(cvss, value => {
            if (value["V2Score"]) {
                ret = value["V2Score"];
                return false;
            }
            return true;
        });

        // override with V3 score of the first occurence
        forEach(cvss, value => {
            if (value["V3Score"]) {
                ret = value["V3Score"];
                return false;
            }
            return true;
        });

        return ret;
      },
      */
      getMaxCVSS(cvss) {
        let ret = "N/A";

        if (cvss != null) {
            const scores = Object.values(cvss).map(value => value.V3Score || value.V2Score).filter(Boolean);
            if (scores.length > 0) {
                ret = Math.max(...scores);
            }
        }

        return ret;
      },
    },
}
</script>

<style lang="scss">
.severity-critical {
    background-color: red !important;
    color: #fff !important;
}
.severity-high {
    background-color: rgb(255, 99, 41) !important;
    color: #fff;
}
.severity-medium {
    background-color: orange !important;
    color: #fff;
}
.severity-low {
    background-color: yellow !important;
    color: #fff;
}
.severity-unknown {
    background-color: lightgrey !important;
    color: #fff;
}

</style>