<template>
    <div>
        <v-alert
            outlined
            type="info"
            variant="tonal"
            border="start"
            v-if="events.length === 0"
            class="p-5"
        >
            <h3>No Kubernetes events found</h3>
            The default TTL for events in the Kube-API is 1 hour. If you want to 
            see older events, you have to increase the TTL in the 
            <a href="https://kubernetes.io/docs/reference/command-line-tools-reference/kube-apiserver/" target="_blank">Kube-apiserver</a>.

        </v-alert>

        <v-card
        color="cardBackground"
        v-if="events.length > 0">
            <v-card-title>
                <h3 class="text-h5">Kubernetes Events</h3>
            </v-card-title>
            <v-card-text class="mt-10">
                    <v-timeline align-top dense truncate-line="both" side="end">

                        <v-timeline-item
                            v-for="event in events" :key="event.uid"
                            :color=event.color
                            :icon=event.icon
                            dot-color="var(--v-primary-base)"
                            fill-dot>
                            <div class="d-flex">
                                <!--<strong class="me-4">{{ event.metadata.creationTimestamp }}</strong>-->
                                <div>
                                    <strong>{{ event.involvedResource }}</strong> {{ event.reason }} {{ event.action }}
                                    <div class="text-caption">
                                        {{ event.eventTime }} · {{ event.type }} <br>
                                        {{ event.message }}
                                    </div>
                                </div>
                            </div>
                            <v-divider v-if="event !== events[events.length - 1]" ></v-divider>
                            <!--
                            <v-card class="mx-3 elevation-2" color="cardBackground ">
                                <v-card-title class="cardBackground darken-2">
                                    [{{ event.reason }}] {{ event.message }}
                                </v-card-title>
                                <v-card-text class="cardBackground text--primary">
                                    {{ event.eventTime }}

                                    {{ event.type }}
                                </v-card-text>
                            </v-card>
                            -->
                        </v-timeline-item>


                    </v-timeline>

            </v-card-text>
        </v-card>

    </div>
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
    involvedObject: string,
    involvedResource: string,
}

export default defineComponent({
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
    mounted() {
        this.loadEvents();
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

                if (response.data[i].involvedObject.name) {
                    event.involvedObject = response.data[i].involvedObject.name;
                } 
                if (response.data[i].involvedObject.kind) {
                    event.involvedResource = response.data[i].involvedObject.kind;
                }

                switch (response.data[i].type) {
                    case "Normal":
                        event.color = "gray lighten-2";
                        break;
                    case "Warning":
                        event.color = "red lighten-4";
                        break;
                    default:
                        event.color = "gray lighten-2";
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