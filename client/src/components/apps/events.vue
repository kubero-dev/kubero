<template>
    <v-container>
        <v-row class="justify-space-between">
            <v-col cols="6" sm="6" md="6" lg="6" xl="6">
                <h1>Events for {{ this.app }}</h1>
            </v-col>
        </v-row>
        <v-layout class="flex-column">
            <!--
                    <v-row  v-for="event in events" :key="event.uid">
                        <v-col cols="3"><nobr>{{ event.eventTime }}</nobr></v-col>
                        <v-col>{{ event.type }}</v-col>
                        <v-col>{{ event.reason }} {{ event.action }}</v-col>
                        <v-col cols="6">{{ event.message }}</v-col>
                    </v-row>
            -->
                <v-row>
                    <!--  v-for="n in 10" :key="n" -->

                    <v-timeline align-top dense>

                        <v-timeline-item
                            v-for="event in events" :key="event.uid"
                            :color=event.color
                            :icon=event.icon
                            fill-dot>
                            <v-card class="grey lighten-2">
                            <v-card-title class="grey lighten-2">
                                [{{ event.reason }}] {{ event.message }}
                            </v-card-title>
                            <v-card-text class="white text--primary">
                                {{ event.eventTime }}

                                {{ event.type }}
                            </v-card-text>
                            </v-card>
                        </v-timeline-item>


                    </v-timeline>

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
        this.loadEvents();
    },
    data: () => ({
        events: [
            /* example
            {
                action: "Binding",
                eventTime: "2022-12-13T14:12:45.614Z",
                uid: "049464b6-3f35-4b72-a885-6c263e64aec7",
                type: "Normal",
                reason: "Scheduled",
                message: "Successfully assigned default/bla-kuberoapp-web-6dfd5c4c9b-mxg9v to kubero-worker-1",
                color: "grey lighten-2",
                icon: "mdi-folder-outline",
            },
            */
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
        default: "new"
      }
    },
    methods: {
      async loadEvents() {
        const self = this;
        const namespace = this.pipeline + "-" + this.phase;
        //axios.get(`/api/events?namespace=${this.$route.query.namespace}`)
        console.log("loadEvents", namespace);
        axios.get(`/api/events?namespace=${namespace}`)
        .then(response => {
            // sort by creationTimestamp
            response.data.sort((a, b) => {
                return new Date(b.metadata.creationTimestamp) - new Date(a.metadata.creationTimestamp);
            });

            for (let i = 0; i < response.data.length; i++) {
                const date = new Date(response.data[i].metadata.creationTimestamp)
                const event = {
                    action: response.data[i].action,
                    eventTime: date.toLocaleDateString() + " " + date.toLocaleTimeString(),
                    message: response.data[i].message,
                    type: response.data[i].type,
                    reason: response.data[i].reason,
                    uid: response.data[i].metadata.uid,
                }

                switch (response.data[i].type) {
                    case "Normal":
                        event.color = "grey lighten-2";
                        break;
                    case "Warning":
                        event.color = "red lighten-4";
                        break;
                    default:
                        event.color = "grey lighten-2";
                }

                switch (response.data[i].reason) {
                    case "Created":
                        event.icon = "mdi-folder-plus-outline";
                        break;
                    case "Deleted":
                        event.icon = "mdi-folder-remove-outline";
                        break;
                    default:
                        event.icon = "mdi-folder-outline";
                }
                self.events.push(event);
            }
        })
        .catch(error => {
            console.log(error);
        });
      },
    },
}
</script>

<style lang="scss">

</style>