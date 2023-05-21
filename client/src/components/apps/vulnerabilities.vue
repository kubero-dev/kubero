<template>
    <v-container>
        <v-row class="justify-space-between mb-2">
            <v-col cols="10" sm="10" md="10" lg="10" xl="10">
                <h1>Vulnerabilities in {{ this.app }}</h1>
            </v-col>
            <v-col>
                <v-btn
                    block
                    @click="startVulnScan()"
                    :disabled="this.scanning"
                    >
                    <v-icon v-if="this.scanning == false">mdi-refresh</v-icon>

                    <v-progress-circular
                        v-if="this.scanning == true"
                        indeterminate
                        size="18"
                        width="2"
                        color="#8560A9"
                        class="mr-1"
                    ></v-progress-circular>
                    <span>Rescan</span>
                </v-btn>
            </v-col>
        </v-row>
        <v-layout class="flex-column">

                <v-row v-if="this.vulnScanResult.logPod.startTime">
                    <v-col cols="6" sm="6" md="6" lg="6" xl="6" v-if="this.renderVulnerabilities" >
                        <v-card elevation="2" outlined color="cardBackground">
                            <v-card-title>
                                <h3 class="headline mb-0">Metadata</h3>
                            </v-card-title>
                            <v-card-text>
                                <v-simple-table dense>
                                    <tbody>
                                        <tr>
                                            <th>Last Scan</th>
                                            <td>{{ this.vulnScanResult.logPod.startTime }}</td>
                                        </tr>
                                        <tr>
                                            <th>Artefact</th>
                                            <td>
                                                <v-span
                                                    v-if="this.vulnScanResult.logs.ArtifactType == 'repository'"
                                                    class="mx-0"
                                                >
                                                    <v-icon left small>mdi-git</v-icon>
                                                </v-span>
                                                <v-span
                                                    v-if="this.vulnScanResult.logs.ArtifactType == 'container_image'"
                                                    class="mx-0"
                                                >
                                                    <v-icon left small>mdi-docker</v-icon>
                                                </v-span>
                                                {{ this.vulnScanResult.logs.ArtifactName }}</td>
                                        </tr>
                                        <tr v-if="this.vulnScanResult.logs.ArtifactType == 'container_image'">
                                            <th>Arch</th>
                                            <td>{{ this.vulnScanResult.logs.Metadata.ImageConfig.architecture }}</td>
                                        </tr>
                                        <tr v-if="this.vulnScanResult.logs.ArtifactType == 'container_image'">
                                            <th>Created</th>
                                            <td>{{ this.vulnScanResult.logs.Metadata.ImageConfig.created }}</td>
                                        </tr>
                                        <tr v-if="this.vulnScanResult.logs.ArtifactType == 'container_image'">
                                            <th>OS</th>
                                            <td>{{ this.vulnScanResult.logs.Metadata.OS.Family }} {{ this.vulnScanResult.logs.Metadata.OS.Name }}</td>
                                        </tr>
                                        <tr v-if="this.vulnScanResult.logs.ArtifactType == 'container_image'">
                                            <th>Layers</th>
                                            <td>{{ this.vulnScanResult.logs.Metadata.ImageConfig.rootfs.diff_ids.length }}</td>
                                        </tr>
                                        <tr v-if="this.vulnScanResult.logs.ArtifactType == 'container_image'">
                                            <th>Working Dir</th>
                                            <td>{{ this.vulnScanResult.logs.Metadata.ImageConfig.config.WorkingDir }}</td>
                                        </tr>
                                        <tr v-if="this.vulnScanResult.logs.ArtifactType == 'container_image'">
                                            <th>Esposed Ports</th>
                                            <td>
                                                <v-chip
                                                    v-for="(item, key, index) in this.vulnScanResult.logs.Metadata.ImageConfig.config.ExposedPorts" :key="index"
                                                    small
                                                    label
                                                    class="ma-1"
                                                    color="green"
                                                    text-color="white"
                                                    >
                                                    {{ key }}
                                                </v-chip>
                                            </td>
                                        </tr>
                                    </tbody>
                                </v-simple-table>
                            </v-card-text>
                        </v-card>
                    </v-col>
                    <v-col cols="6" sm="6" md="6" lg="6" xl="6" v-if="this.renderVulnerabilities" >
                        <v-card elevation="2" outlined color="cardBackground">
                            <v-card-title>
                                <h3 class="headline mb-0">Summary</h3>
                            </v-card-title>
                            <v-card-text>
                                <vc-donut
                                    :size="50" unit="%" :thickness="60"
                                    has-legend legend-placement="right"
                                    :auto-adjust-text-size="true"
                                    :total="this.vulnScanResult.logsummary.total"
                                    :sections="vulnSummary">
                                </vc-donut>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12" sm="12" md="12" lg="12" xl="12" v-if="this.renderVulnerabilities" >
                        <span v-for="target in this.vulnScanResult.logs.Results" :key="target.Target">
                            <v-card class="mb-6" v-if="target.Class != 'secret'" elevation="2" outlined color="cardBackground">
                                <v-card-title>
                                    <h3 class="headline mb-0">{{ target.Target }}</h3>
                                </v-card-title>
                                <v-card-text>
                                    <!--
                                        TODO : I was not able to get the expandable table to work
                                        :expanded.sync="vulnExpanded"
                                        show-expand
                                        single-expand
                                        item-key="VulnerabilityID"
                                    -->
                                    <v-data-table
                                        :headers="vulnHeaders"
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
        scanning: false,
        vulnScanResult: {},
        renderVulnerabilities: false,
        vulnExpanded: [],
        vulnHeaders: [
            { text: 'CVE', value: 'VulnerabilityID', filterable: false,},
            { text: 'PGK', value: 'PkgName' },
            { text: 'Title', value: 'Title' },
            //{ text: 'Score', value: 'Severity' },
            { text: 'CVSS', value: 'CVSS', sortable: false, filterable: false,},
        ],
    }),
    computed: {
        // a computed getter
        vulnSummary() {
            let ret = [];
            const color = {
                "critical": "#ff8080",
                "high": "#ff946d",
                "medium": "#ffd07a",
                "low": "#fdfda0",
                "unknown": "lightgrey",
            }
            for (const [severity, count]  of Object.entries(this.vulnScanResult.logsummary)) {
                if (severity == "total") {
                    continue;
                }
                ret.push({ label: count+" "+severity.toUpperCase(), value: count, color: color[severity] });
            }
            return ret;
        }
    },
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
      startVulnScan() {
        axios.get(`/api/security/${this.pipeline}/${this.phase}/${this.app}/scan`)
        .then(() => {
            this.scanning = true;
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
.theme--light.v-data-table {
    background-color: unset;
}


</style>