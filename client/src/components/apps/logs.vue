<template>
    <div class="logs-container">
        <v-tabs class="console-bar" style="position: relative;">
            <v-tab v-if="logType == 'runlogs'" @click="getLogHistory('web')">run</v-tab>
            <v-tab v-if="logType == 'runlogs' && deploymentstrategy == 'git' && buildstrategy=='plain'" @click="getLogHistory('builder')">build</v-tab>
            <v-tab v-if="logType == 'runlogs' && deploymentstrategy == 'git' && buildstrategy=='plain'" @click="getLogHistory('fetcher')">fetch</v-tab>
            <v-tab v-if="logType == 'buildlogs'" @click="getBuildLogHistory('fetch')">fetch</v-tab>
            <v-tab v-if="logType == 'buildlogs' && (buildstrategy=='nixpacks' || buildstrategy=='buildpacks')" @click="getBuildLogHistory('build')">build</v-tab>
            <v-tab v-if="logType == 'buildlogs' && (buildstrategy=='nixpacks' || buildstrategy=='dockerfile')" @click="getBuildLogHistory('push')">push</v-tab>
            <v-tab v-if="logType == 'buildlogs'" @click="getBuildLogHistory('deploy')">deploy</v-tab>
        </v-tabs>
        <div class="console" id="console">
            <div v-for="line in loglines" :key="line.id">
            {{ new Date(line.time).toLocaleDateString() }} {{ new Date(line.time).toLocaleTimeString()}} <span :style="'color:' +line.color">[{{ line.podID }}/{{ line.container.replace('kuberoapp-', '') }}]</span>
            {{ line.log }}
            </div>
            <span style="margin: 25px;"></span>
        </div>
    </div>
</template>


<script lang="ts">
import axios from "axios";
import { ref, reactive, defineComponent } from 'vue'
import { useKuberoStore } from '../../stores/kubero'

type LogLine = {
    app: string;
    container: string;
    id: string;
    log: string;
    phase: string;
    pipeline: string;
    pod: string;
    podID: string;
    time: number;
    color: string;
}

const socket = useKuberoStore().kubero.socket as any;
const loglines = ref([] as LogLine[]);

socket.on('log', (data: LogLine) => {
    //console.log("log", data);
    loglines.value.unshift(data)
});


export default defineComponent({
    setup() {
        return {
            loglines,
            socket,
        }
    },
    mounted() {
        if (this.logType == 'buildlogs')  {
            this.getBuildLogHistory('fetch')
            //this.socketJoin()
            //this.startLogs()
        } else {
            this.getLogHistory('web')
            this.socketJoin()
            this.startLogs()
        }
    },
    unmounted() {
        this.socketLeave()
        this.loglines = []
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
      },
      deploymentstrategy: {
        type: String,
        default: "docker"
      },
      buildstrategy: {
        type: String,
        default: "dockerfile"
      },
      logType: {
        type: String,
        default: "runlogs"
      },
      buildID: {
        type: String,
        default: "MISSING"
      },
      height: {
        type: String,
        default: "100%"
      },
    },
    data: () => ({
        loglines: [
            /* example
            {
                app: "bla"
                container: "kuberoapp-web"
                id: "049464b6-3f35-4b72-a885-6c263e64aec7"
                log: "logtest: nana\n"
                phase: "production"
                pipeline: "hoho"
                pod: "bla-kuberoapp-web-6dfd5c4c9b-mxg9v"
                podID: "6dfd5c4c9b-mxg9v"
                time: 1656970421989
            },
            */
        ] as LogLine[],
    }),
    methods: {
        socketJoin() {
            console.log("socketJoin", `${this.pipeline}-${this.phase}-${this.app}`);
            socket.emit("join", {
                room: `${this.pipeline}-${this.phase}-${this.app}`,
            });
        },
        socketLeave() {
            console.log("socketLeave", `${this.pipeline}-${this.phase}-${this.app}`);
            socket.emit("leave", {
                room: `${this.pipeline}-${this.phase}-${this.app}`,
            });
        },
        startLogs() {
            axios.get(`/api/logs/${this.pipeline}/${this.phase}/${this.app}`).then(() => {
                console.log("logs started");
            });
        },
        getLogHistory(container: string) {
            axios.get(`/api/logs/${this.pipeline}/${this.phase}/${this.app}/${container}/history`).then((response) => {
                this.loglines = response.data;
            });
        },
        getBuildLogHistory(container: string) {
            //http://localhost:2000/api/deployments/devcon/production/aaa/20240717-0651/log
            axios.get(`/api/deployments/${this.pipeline}/${this.phase}/${this.app}/${this.buildID}/${container}/history`).then((response) => {
                if (response.data.length > 0) {
                    this.loglines = response.data;
                } else {
                    this.loglines = [{
                        app: "container",
                        container: "debug",
                        id: "00000000-0000-0000-0000-000000000000",
                        log: "No logs available",
                        phase: "",
                        pipeline: "",
                        pod: "",
                        podID: "error",
                        color: "#FF0000",
                        time: Date.now(),
                    }];
                }
            });
        },
    },
});
</script>

<style lang="scss">

a:link { text-decoration: none;}
.v-icon.v-icon {
    vertical-align:inherit;
}

.logs-container {
    /*height: calc(100vh - 400px);*/
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
}

.v-tabs.console-bar {
    color: #9F9F9F;
    background-color: #1E1E1E; /*#444*/
    flex-shrink: 0;
}

.console {
    flex: 1;
    overflow-x: auto;
    overflow-y: auto;
    background-color: #333;
    color: #c0c0c0;
    padding: 5px;
    font: 0.85rem Inconsolata, monospace;
    display: flex;
    flex-direction: column-reverse;
    min-height: 0;
}
</style>