<template>
    <v-container :fluid="true">
        <h1>Events</h1>
        <v-layout>
                <v-row
                v-if="events.length > 0">
                    <v-timeline align-top dense>
                        <!--  v-for="n in 10" :key="n" -->
                        <v-timeline-item
                            v-for="event in events" :key="event.metadata.uid"
                            :color=event.color
                            :icon=event.icon
                            fill-dot>
                            <v-card class="cardBackground elevation-2">
                            <v-card-title class="text-h5">
                                {{ event.message }}
                            </v-card-title>
                            <v-card-text>
                                {{ event.metadata.creationTimestamp }}
                            </v-card-text>
                            </v-card>
                        </v-timeline-item>

                    </v-timeline>
                </v-row>

                <v-row
                    v-if="events.length === 0">
                    <v-col
                    cols="12"
                    md="6"
                    style="margin-top: 20px;"
                    >
                        <v-alert
                            outlined
                            type="info"
                            prominent
                            border="left"
                            style="background-color: rgba(33, 149, 243, 0.03) !important;"
                        >
                            <h3>No events found</h3>
                            The default TTL for events in the Kube-API is 1 hour. If you want to 
                            see events older events, you have to increase the TTL in the 
                            <a href="https://kubernetes.io/docs/reference/command-line-tools-reference/kube-apiserver/" target="_blank">Kube-apiserver</a>.

                        </v-alert>
                    </v-col>
                </v-row>
        </v-layout>
    </v-container>
</template>



<script>
import axios from "axios";
export default {
    sockets: {
        async updatedEvents(events) {
            console.log("updatedEvents", events);
        },
    },
    mounted() {
        this.loadEvents();
    },
    data: () => ({
        events: [],
    }),
    methods: {
      async loadEvents() {
        const self = this;
        axios.get(`/api/events`)
        .then(response => {
            // sort by creationTimestamp
            response.data.sort((a, b) => {
                return new Date(b.metadata.creationTimestamp) - new Date(a.metadata.creationTimestamp);
            });

            for (let i = 0; i < response.data.length; i++) {
                const date = new Date(response.data[i].metadata.creationTimestamp)
                const event = {
                    message: response.data[i].message,
                    metadata: {
                        creationTimestamp: date.toLocaleDateString() + " " + date.toLocaleTimeString(),
                        uid: response.data[i].metadata.uid,
                    },
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

<style scoped>
.v-timeline::before {
    top: 55px;
    height: calc(100% - 110px)
}
</style>