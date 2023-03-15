<template>
    <v-container>
        <v-row class="justify-space-between">
            <v-col cols="6" sm="6" md="6" lg="6" xl="6">
                <h1>Vulnerabilities {{ this.app }}</h1>
            </v-col>
        </v-row>
        <v-layout class="flex-column">
                <v-row>
                    <v-col cols="12" sm="12" md="12" lg="12" xl="12" v-if="this.renderVulnerabilities" >
                        <v-card class="mb-6" v-for="target in this.vulnScanResult.logs.Results" :key="target.Target">
                            <v-card-title>
                                <h3 class="headline mb-0">{{ target.Target }}</h3>
                            </v-card-title>
                            <v-card-text>
                                <v-simple-table>
                                    <thead>
                                        <tr>
                                            <th>CVE</th>
                                            <th>Package</th>
                                            <th>Title</th>
                                            <th>Score</th>
                                            <th>CVSS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="vuln in target.Vulnerabilities" :key="vuln.VulnerabilityID+vuln.PkgID">
                                            <td><a :href=vuln.PrimaryURL target="_blank"><nobr>{{ vuln.VulnerabilityID }}</nobr></a></td>
                                            <td>{{ vuln.PkgName }}</td>
                                            <td>{{ vuln.Title }}</td>
                                            <td>{{ vuln.Severity }}</td>
                                            <td>
                                                <v-chip
                                                label
                                                :class="'severity-' + vuln.Severity.toLowerCase()"
                                                >
                                                {{ getCVSS(vuln.CVSS) }}
                                                </v-chip>
                                            </td>
                                        </tr>
                                    </tbody>
                                </v-simple-table>
                            </v-card-text>
                        </v-card>
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
      getCVSS(cvss) {
        if (cvss == null) {
            return "N/A";
        }
        return cvss;
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