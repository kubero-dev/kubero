<template>
    <v-container>
        <Breadcrumbs :items="breadcrumbItems"></Breadcrumbs>

        <v-container class="d-flex justify-space-between align-center mb-2">
            <v-tabs v-model="tab"  class="background">
                <v-tab class="background">Overview</v-tab>
                <v-tab class="background">Logs</v-tab>
                <v-tab class="background">Events</v-tab>
                <v-tab class="background">Vulnerabilities</v-tab>
                <v-spacer  class="background"></v-spacer>
            </v-tabs>


            <v-menu offset-y>
            <template v-slot:activator="{ props }">
                <v-btn
                color="primary"
                dark
                v-bind="props"
                >
                    <v-icon color="white">mdi-menu-open</v-icon>
                    Actions
                </v-btn>
            </template>
            <v-list>
                <v-list-item
                    @click="ActionEditApp"
                    prepend-icon="mdi-pencil"
                    title="Edit">
                </v-list-item>
                <v-list-item
                    @click="ActionOpenApp"
                    prepend-icon="mdi-open-in-new"
                    title="Open App">
                </v-list-item>
                <v-list-item 
                    @click="restartApp"
                    prepend-icon="mdi-reload-alert"
                    title="Restart">
                </v-list-item>
                <v-list-item 
                    :disabled="appData.spec.deploymentstrategy != 'docker'"
                    @click="ActionStartDownload"
                    prepend-icon="mdi-download"
                    title="Download Template">
                </v-list-item>
                <v-list-item 
                    @click="openConsole"
                    prepend-icon="mdi-console"
                    title="Open Console">
                </v-list-item>
                <v-divider class="my-3"></v-divider>
                <v-list-item 
                    @click="deleteApp"
                    prepend-icon="mdi-delete"
                    title="Delete">
                </v-list-item>
            </v-list>
            </v-menu>
        </v-container>
        
        <v-window v-model="tab">
            <v-window-item transition="false" reverse-transition="false" class="background">
                <Overview :pipeline="pipeline" :phase="phase" :app="app" :appData="appData" :pipelineData="pipelineData"/>
            </v-window-item>
            <v-window-item transition="false" reverse-transition="false" class="background">
                <LogsTab :pipeline="pipeline" :phase="phase" :app="app" :deploymentstrategy="appData.spec.deploymentstrategy"/>
            </v-window-item>
            <v-window-item transition="false" reverse-transition="false" class="background">
                <Events :pipeline="pipeline" :phase="phase" :app="app"/>
            </v-window-item>
            <v-window-item transition="false" reverse-transition="false" class="background">
                <Vulnerabilities :pipeline="pipeline" :phase="phase" :app="app"/>
            </v-window-item>
        </v-window>
    </v-container>
</template>

<script lang="ts">
import axios from "axios";
import { defineComponent } from 'vue'
import Breadcrumbs from "../breadcrumbs.vue";
import Overview from "./overview.vue";
import Events from "./events.vue";
import LogsTab from "./logstab.vue";
import Vulnerabilities from "./vulnerabilities.vue";
import Swal from 'sweetalert2';


export default defineComponent({
    data () {
        return {
            loadingState: false,
            tab: null,
            breadcrumbItems: [
                {
                    text: 'DASHBOARD',
                    disabled: false,
                    to: { name: 'Pipelines', params: {}}
                },
                {
                    text: 'PIPELINE:'+this.pipeline,
                    disabled: false,
                    to: { name: 'Pipeline Apps', params: { pipeline: this.pipeline }}
                },
                {
                    text: 'PHASE:'+this.phase,
                    disabled: true,
                    href: `/pipeline/${this.pipeline}/${this.phase}/${this.app}/detail`,
                },
                {
                    text: 'APP:'+this.app,
                    disabled: true,
                    href: `/pipeline/${this.pipeline}/${this.phase}/${this.app}/detail`,
                }
            ],
            pipelineData: {},
            appData: {
                spec: {
                    domain: "",
                    deploymentstrategy: "git"
                }
            }
        }
    },
    mounted() {
        this.loadPipeline();
        this.loadApp();
    },
    methods: {
        loadPipeline() {
            axios.get('/api/pipelines/'+this.pipeline).then(response => {
                this.pipelineData = response.data;
            });
        },
        loadApp() {
            axios.get('/api/pipelines/'+this.pipeline+'/'+this.phase+'/'+this.app).then(response => {
                this.appData = response.data;
                //console.log(this.appData);
            });
        },
        ActionOpenApp() {
            window.open(`https://${this.appData.spec.domain}`, '_blank');
        },
        ActionEditApp() {
            this.$router.push(`/pipeline/${this.pipeline}/${this.phase}/apps/${this.app}`);
        },
        ActionStartDownload() {
            axios.get('/api/pipelines/'+this.pipeline+'/'+this.phase+'/'+this.app+'/download').then(response => {
                //console.log(response.data);
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', this.app+'.yaml');
                document.body.appendChild(link);
                link.click();
            });
        },
        deleteApp() {
            Swal.fire({
                title: "Delete App ”" + this.app + "” ?",
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
                    axios.delete(`/api/pipelines/${this.pipeline}/${this.phase}/${this.app}`)
                    .then(response => {
                        // sleep 1 second
                        setTimeout(() => {
                            this.$router.push(`/pipeline/${this.pipeline}/apps`);
                        }, 1000);
                        //console.log("deleteApp", response);
                    })
                    .catch(error => {
                        console.log(error);
                    });
                return;
                }
            });
        },
        async restartApp() {
            axios.get(`/api/pipelines/${this.pipeline}/${this.phase}/${this.app}/restart`)
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
        openConsole() {
            Swal.fire({
                title: "Open Console",
                text: "This feature is not yet implemented. It will be available in a future release.",
                icon: "info",
                background: "rgb(var(--v-theme-cardBackground))",
                /*background: "rgb(var(--v-theme-on-surface-variant))",*/
                color: "rgba(var(--v-theme-on-background),var(--v-high-emphasis-opacity));",
            })
            //window.open(`https://${this.appData.spec.domain}`, '_blank');
        },
    },

    components: {
        Breadcrumbs,
        Events,
        LogsTab,
        Vulnerabilities,
        Overview,
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
      }
    },
})
</script>

<style scoped>
.v-list-item__icon:first-child {
    margin-right: 0px;
    margin: 10px
}
.v-list-item {
    min-height: 32px;
}
</style>