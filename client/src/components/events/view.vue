<template>
    <v-container>
        <h1>Events</h1>
        <v-layout>
                <v-row
                v-if="events.length > 0">
                    <v-timeline align-top side="end">
                        <v-timeline-item
                            v-for="event in events" :key="event.metadata.id"
                            :color=event.color
                            :icon=event.icon
                            dot-color="var(--v-primary-base)"
                            fill-dot>
                            <div class="d-flex">
                                <!--<strong class="me-4">{{ event.metadata.creationTimestamp }}</strong>-->
                                <div>
                                    <strong>{{ event.user }}: </strong> {{ event.title }}
                                    <div class="text-caption">
                                        {{ event.metadata.timestamp }} · v{{ event.metadata.id }} · {{ event.message }}
                                    </div>
                                </div>
                            </div>
                            <v-divider v-if="event !== events[events.length - 1]" ></v-divider>
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
                            variant="tonal"
                            border="start"
                        >
                            <h3>No events found</h3>
                            The default TTL for events in the Kube-API is 1 hour. If you want to 
                            see older events, you have to increase the TTL in the 
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
    user: string;
    title: string;
    message: string;
    metadata: {
        timestamp: string;
        id: string;
    };
    color: string;
    icon: string;
}

export default defineComponent({
    sockets: {
        async updatedEvents(events: Event[]) {
            console.log("updatedEvents", events);
        },
    },
    mounted() {
        this.loadEvents();
    },
    data: () => ({
        events: [] as Event[],
    }),
    methods: {
        async loadEvents(){
            const self = this;
            axios.get(`/api/audit`, {
                params: {
                    limit: 25,
                }
            })
            .then(response => {
                //console.log(response.data);

                const auditEntries = response.data.audit as any[];

                for (let i = 0; i < auditEntries.length; i++) {
                    const date = new Date(auditEntries[i].timestamp)
                    const event = {
                        user: auditEntries[i].user,
                        title: auditEntries[i].action + " " + auditEntries[i].resource,
                        message: auditEntries[i].message,
                        metadata: {
                            //timestamp: date.toLocaleDateString() + " " + date.toLocaleTimeString(),
                            timestamp: date.toDateString() + " " + date.toLocaleTimeString(),
                            id: auditEntries[i].id,
                        },
                    } as Event;

                    switch (auditEntries[i].severity) {
                        case "normal":
                            event.color = "grey lighten-2";
                            break;
                        case "info":
                            event.color = "primary lighten-4";
                            break;
                        case "warning":
                            event.color = "orange lighten-4";
                            break;
                        case "error":
                            event.color = "red lighten-4";
                            break;
                        default:
                            event.color = "grey lighten-2";
                    }

                    switch (auditEntries[i].resource) {
                        case "system":
                            event.icon = "mdi-bell-plus-outline";
                            break;
                        case "app":
                            event.icon = "mdi-bell-remove-outline";
                            break;
                        default:
                            event.icon = "mdi-bell-outline";
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

<style scoped>
.v-timeline::before {
    top: 55px;
    height: calc(100% - 110px)
}
</style>