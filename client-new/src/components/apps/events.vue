<template>
    <v-container>
        <v-row class="justify-space-between">
            <v-col cols="6" sm="6" md="6" lg="6" xl="6">
                <h1>Events for {{ app }}</h1>
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
                <v-row
                    v-if="events.length > 0">
                    <v-timeline align-top dense>

                        <v-timeline-item
                            v-for="event in events" :key="event.uid"
                            :color=event.color
                            :icon=event.icon
                            fill-dot>
                            <v-card class="cardBackground darken-2">
                                <v-card-title class="cardBackground darken-2">
                                    [{{ event.reason }}] {{ event.message }}
                                </v-card-title>
                                <v-card-text class="cardBackground text--primary">
                                    {{ event.eventTime }}

                                    {{ event.type }}
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
                            border="start"
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

<script lang="ts">
import axios from "axios";
import { defineComponent } from 'vue'

type Event = {
    action: string,
    eventTime: string,
    uid: string,
    type: string,
    reason: string,
    message: string,
    color: string,
    icon: string,
}

export default defineComponent({
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
        ] as Event[],
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
            response.data.sort((a: any, b: any) => {
                return new Date(b.metadata.creationTimestamp).getMilliseconds() - new Date(a.metadata.creationTimestamp).getMilliseconds();
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
                } as Event;

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
});
</script>

<style lang="scss">

</style>