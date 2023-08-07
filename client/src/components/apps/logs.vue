<template>
    <div class="console" id="console" style="height: 100%;">
        <div v-for="line in loglines" :key="line.id">
        {{ new Date(line.time).toISOString()}}<span :style="'color:' +line.color">[{{ line.podID }}/{{ line.container.replace('kuberoapp-', '') }}]</span>
        {{ line.log }}
        </div>
    </div>
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
    methods: {
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