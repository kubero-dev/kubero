<template>
    <v-container>
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
                    <v-timeline align-top dense truncate-line="both" side="end" class="my-10">

                        <v-timeline-item
                            v-for="event in events" :key="event.uid"
                            :dot-color=event.color
                            :icon=event.icon
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
                            <h3>{{ $t('app.events.empty.title', { app: app }) }}</h3>
                            <p>{{ $t('app.events.empty.message') }}</p>
                            <br>
                            <a href="https://kubernetes.io/docs/reference/command-line-tools-reference/kube-apiserver/" target="_blank">{{ $t('app.events.empty.link') }}</a>

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
    involvedObject: string,
    involvedResource: string,
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
        //console.log("loadEvents", namespace);
        axios.get(`/api/kubernetes/events?namespace=${namespace}`)
        .then(response => {
            // sort by creationTimestamp
            response.data.sort((a: any, b: any) => {
                return new Date(b.metadata.creationTimestamp).getMilliseconds() - new Date(a.metadata.creationTimestamp).getMilliseconds();
            });
            response.data.reverse()

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
                        event.color = "rgba(var(--v-primary-base))";
                        break;
                    case "Warning":
                        event.color = "rgba(var(--v-theme-error))";
                        break;
                    default:
                        event.color = "rgba(var(--v-primary-base))";
                }

                switch (event.involvedResource) {
                    case "Pod":
                        event.icon = "mdi-folder-outline";
                        break;
                    case "Deployment":
                        event.icon = "mdi-folder-multiple-outline";
                        break;
                    case "Service":
                        event.icon = "mdi-folder-network-outline";
                        break;
                    case "Ingress":
                        event.icon = "mdi-folder-network-outline";
                        break;
                    case "PersistentVolumeClaim":
                        event.icon = "mdi-folder-zip-outline";
                        break;
                    case "PersistentVolume":
                        event.icon = "mdi-folder-zip-outline";
                        break;
                    case "ReplicaSet":
                        event.icon = "mdi-folder-multiple-outline";
                        break;
                    case "StatefulSet":
                        event.icon = "mdi-folder-multiple-outline";
                        break;
                    case "ConfigMap":
                        event.icon = "mdi-folder-settings-outline";
                        break;
                    case "Secret":
                        event.icon = "mdi-folder-key-outline";
                        break;
                    case "Job":
                        event.icon = "mdi-folder-clock-outline";
                        break;
                    case "CronJob":
                        event.icon = "mdi-folder-clock-outline";
                        break;
                    case "DaemonSet":
                        event.icon = "mdi-folder-multiple-outline";
                        break;
                    case "HorizontalPodAutoscaler":
                        event.icon = "mdi-folder-multiple-outline";
                        break;
                    case "PodDisruptionBudget":
                        event.icon = "mdi-folder-multiple-outline";
                        break;
                    case "ServiceAccount":
                        event.icon = "mdi-folder-account-outline";
                        break;
                    case "Role":
                        event.icon = "mdi-folder-account-outline";
                        break;
                    case "RoleBinding":
                        event.icon = "mdi-folder-account-outline";
                        break;
                    case "ClusterRole":
                        event.icon = "mdi-folder-account-outline";
                        break;
                    case "ClusterRoleBinding":
                        event.icon = "mdi-folder-account-outline";
                        break;
                    case "StorageClass":
                        event.icon = "mdi-folder-zip-outline";
                        break;
                    case "VolumeAttachment":
                        event.icon = "mdi-folder-zip-outline";
                        break;
                    case "CustomResourceDefinition":
                        event.icon = "mdi-folder-star-outline";
                        break;
                    case "MutatingWebhookConfiguration":
                        event.icon = "mdi-folder-star-outline";
                        break;
                    case "ValidatingWebhookConfiguration":
                        event.icon = "mdi-folder-star-outline";
                        break;
                    case "PodSecurityPolicy":
                        event.icon = "mdi-folder-star-outline";
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