<template>
    <v-container>
        <v-row class="justify-space-between">
            <v-col cols="6" sm="6" md="6" lg="6" xl="6">
                <h1>
                    Logs for {{ this.app }}
                    
                    <v-btn
                    class="ma-2"
                    @click="openInWindow"
                    >
                    Open Logs
                    <v-icon
                        right
                        dark
                    >
                        mdi-open-in-new
                    </v-icon>
                    </v-btn>
                </h1>
                <p></p>
            </v-col>
        </v-row>
        <v-row style="height: 1100px">
            <v-col cols="12" sm="12" md="12">
                <div class="console" id="console">
                    <div v-for="line in loglines" :key="line.id">
                    {{ new Date(line.time).toISOString()}}<span :style="'color:' +line.color">[{{ line.podID }}/{{ line.container.replace('kuberoapp-', '') }}]</span>
                    {{ line.log }}
                </div>
                </div>
            </v-col>
        </v-row>

    </v-container>
</template>

<script>
import axios from "axios";
export default {
    sockets: {
        log: function(data) {
            this.loglines.unshift(data)
        },
    },
    mounted() {
        this.socketJoin()
        this.startLogs()
    },
    unmounted() {
        this.socketLeave()
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
        ],
    }),
    components: {
    },
    methods: {
        openInWindow() {
            window.open(`#/pipeline/${this.pipeline}/${this.phase}/${this.app}/logspopup?popup=true`, '_blank', 'popup=yes,location=no,height=1000,width=1000,scrollbars=yes,status=no');
        },
        socketJoin() {
            this.$socket.client.emit("join", {
                room: `${this.pipeline}-${this.phase}-${this.app}`,
            });
        },
        socketLeave() {
            this.$socket.client.emit("leave", {
                room: `${this.pipeline}-${this.phase}-${this.app}`,
            });
        },
        startLogs() {
            axios.get(`/api/logs/${this.pipeline}/${this.phase}/${this.app}`).then(() => {
                console.log("logs started");
            });
        },
    },
}
</script>

<style lang="scss">

a:link { text-decoration: none;}
.v-icon.v-icon {
    vertical-align:inherit;
}
.console {
    height: 100%;
    max-height: 1000px;
    overflow-x: scroll;
    background-color: #333;
    color: #c0c0c0;
    padding: 5px;
    font: 0.85rem Inconsolata, monospace;

    display: flex;
    flex-direction: column-reverse;
}
</style>