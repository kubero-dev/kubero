<template>
    <v-container>
        <Breadcrumbs :items="breadcrumbItems"></Breadcrumbs>

        <v-container class="d-flex justify-space-between align-center mb-2">
            <v-tabs v-model="tab"  class="background">
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
                <v-list-item-group>
                    <v-list-item
                        @click="ActionEditApp"
                        prepend-icon="mdi-pencil"
                        title="Edit App">
                    </v-list-item>
                    <v-list-item
                        @click="ActionOpenApp"
                        prepend-icon="mdi-open-in-new"
                        title="Open App">
                    </v-list-item>
                    <v-list-item 
                        disabled
                        @click="ActionStartDownload"
                        prepend-icon="mdi-download"
                        title="Download Config">
                    </v-list-item>
                </v-list-item-group>
            </v-list>
            </v-menu>
        </v-container>
        
        <v-window v-model="tab">
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
import Events from "./events.vue";
import LogsTab from "./logstab.vue";
import Vulnerabilities from "./vulnerabilities.vue";


export default defineComponent({
    data () {
        return {
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
        this.socketJoin();
    },
    beforeDestroy() {
        this.socketLeave();
    },
    methods: {
        socketLeave() {
            /*
            this.$socket.client.emit("leave", {
                room: `${this.pipeline}-${this.phase}-${this.app}`,
            });
            */
        },
        socketJoin() {
            /*
            this.$socket.client.emit("join", {
                room: `${this.pipeline}-${this.phase}-${this.app}`,
            });
            */
        },
        loadPipeline() {
            axios.get('/api/pipelines/'+this.pipeline).then(response => {
                this.pipelineData = response.data;
            });
        },
        loadApp() {
            axios.get('/api/pipelines/'+this.pipeline+'/'+this.phase+'/'+this.app).then(response => {
                this.appData = response.data;
            });
        },
        ActionOpenApp() {
            window.open(`https://${this.appData.spec.domain}`, '_blank');
        },
        ActionEditApp() {
            this.$router.push(`/pipeline/${this.pipeline}/${this.phase}/apps/${this.app}`);
        },
        ActionStartDownload() {
            console.log("ActionStartDownload");
        }
    },

    components: {
        Breadcrumbs,
        Events,
        LogsTab,
        Vulnerabilities
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