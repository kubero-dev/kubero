<template>
    <v-container>

        <v-row class="justify-space-between">
            <v-col cols="6" sm="6" md="6" lg="6" xl="6">
                <h1>Logs</h1>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12" sm="12" md="10">
                <div class="console">
                    <div v-for="line in loglines" :key="line.id">{{ new Date(line.time).toISOString()}}[{{ line.podID }}/{{ line.container }}] {{ line.log }}</div>
                </div>
            </v-col>
        </v-row>
        <v-btn
        elevation="2"
        @click="socketJoin()"
        >
            Join
        </v-btn>

    </v-container>
</template>

<script>
import axios from "axios";
export default {
    sockets: {
        log: function(data) {
            console.log(data);
            this.loglines.push(data);
        },
        /*
        loadLoags: function() {
            this.$socket.on("logs", data => {
                console.log(data);
                this.loglines.push(data);
            });
        },
        */
    },
    mounted() {
        this.socketJoin()
        this.startLogs()
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
            /*
            {
                app: "ppppp"
                container: "kuberoapp-web"
                id: 1656940401032
                log: "logtest: iasdfdfadafdaffs\n"
                phase: "production"
                pipeline: "popo"
                pod: "ppppp-kuberoapp-web-6ccb6795bb-48qtt"
            },
            */
        ],
    }),
    components: {
    },
    methods: {
        socketJoin() {
            console.log("socketJoin");
            
            this.$socket.client.emit("join", {
                room: "logs",
                //user: this.$store.state.user.name,
            });
        },
        startLogs() {
            axios.get(`/api/logs/${this.pipeline}/${this.phase}/${this.app}`).then(response => {
                //this.podsizesList = response.data;
                console.log("logs started");
            });
        },
    },
}
</script>

<style lang="scss">
.console {
    height: 300px;
    overflow-y: scroll;
    background-color: #333;
    color: #c0c0c0;
    font: 0.85rem Inconsolata, monospace;
}
</style>