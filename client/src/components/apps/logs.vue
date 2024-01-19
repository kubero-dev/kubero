<template>
    <div style="height: 95%;">
        <v-tabs class="console-bar">
            <v-tab @click="getLogHistory('web')">run</v-tab>
            <v-tab v-if="deploymentstrategy == 'git'" @click="getLogHistory('builder')">build</v-tab>
            <v-tab v-if="deploymentstrategy == 'git'" @click="getLogHistory('fetcher')">fetch</v-tab>
        </v-tabs>
        <div class="console" id="console">
            <div v-for="line in loglines" :key="line.id">
            {{ new Date(line.time).toLocaleDateString() }} {{ new Date(line.time).toLocaleTimeString()}} <span :style="'color:' +line.color">[{{ line.podID }}/{{ line.container.replace('kuberoapp-', '') }}]</span>
            {{ line.log }}
            </div>
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
        this.getLogHistory('web')
        this.socketJoin()
        this.startLogs()
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
    },
});
</script>

<style lang="scss">

a:link { text-decoration: none;}
.v-icon.v-icon {
    vertical-align:inherit;
}

.v-tabs.console-bar {
    color: #9F9F9F;
}

.v-tabs.console-bar {
    background-color: #1E1E1E; /*#444*/
}

.console {
    height: 100%;
    overflow-x: scroll;
    background-color: #333;
    color: #c0c0c0;
    padding: 5px;
    font: 0.85rem Inconsolata, monospace;

    display: flex;
    flex-direction: column-reverse;
}
</style>