<template>
    <div>
        <v-card 
        color="cardBackground"
        v-if="auditEvents.length >0">
            <v-card-title>
                <h3 class="text-h5">Activity</h3>
            </v-card-title>
            <v-card-text class="mt-10">
                <v-row>
                    <v-timeline align-top truncate-line="start" side="end" class="mr-5">
                        <v-timeline-item
                            v-for="event in auditEvents" :key="event.id"
                            :color=event.color
                            :icon=getIcon(event.action)
                            dot-color="var(--v-primary-base)"
                            fill-dot>
                            <div>
                                <!--<strong class="me-4">{{ event.metadata.creationTimestamp }}</strong>-->
                                <div>
                                    <strong>{{ event.user }}: </strong> {{ event.action }} {{ event.resource }}
                                    <div class="text-caption">
                                        {{ event.timestamp }} · v{{ event.id }} · {{ event.message }}
                                    </div>
                                </div>
                            </div>
                            <v-divider v-if="event !== auditEvents[auditEvents.length - 1]" ></v-divider>
                        </v-timeline-item>

                    </v-timeline>
                </v-row>
            </v-card-text>
        </v-card>

        <v-alert
            outlined
            type="info"
            variant="tonal"
            border="start"
            v-if="auditEvents.length <1">
            <h3>Audit</h3>
            The audi log is ether empty or disabled.

        </v-alert>
    </div>
</template>

<script lang="ts">
import axios from "axios";
import { defineComponent } from 'vue'

type AuditEvent = {
    id: string,
    timestamp: string,
    user: string,
    action: string,
    namespace: string,
    phase: string,
    app: string,
    pipeline: string,
    resource: string,
    message: string,
    severity: string,
    color: string,
    icon: string,
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
    data () {
        return {
            auditEvents: [] as AuditEvent[],
            limit: 10,
            count: 0,
        }
    },
    mounted() {
        this.loadAudit();
    },
    components: {
        
    },
    methods: {
        getIcon(action: string) {
            if (action === "create") return "mdi-creation";
            if (action === "update") return "mdi-pencil";
            if (action === "delete") return "mdi-delete";
            if (action === "start") return "mdi-play";
            if (action === "stop") return "mdi-stop";
            if (action === "restart") return "mdi-restart";
            if (action === "scale") return "mdi-arrow-expand-vertical";
            if (action === "rollback") return "mdi-history";
            if (action === "promote") return "mdi-arrow-up-bold";
            if (action === "demote") return "mdi-arrow-down-bold";
            if (action === "approve") return "mdi-check";
            if (action === "reject") return "mdi-close";
            if (action === "pause") return "mdi-pause";
            if (action === "resume") return "mdi-play";
            if (action === "deploy") return "mdi-rocket";
            if (action === "undeploy") return "mdi-rocket";
            if (action === "release") return "mdi-rocket";
            if (action === "rollback") return "mdi-rocket";
            return "mdi-rocket";
        },
        loadAudit() {
            axios.get('/api/audit', { params: { limit: this.limit, pipeline: this.pipeline, phase: this.phase, app: this.app } }).then(response => {
                this.auditEvents = response.data.audit;
                this.count = response.data.count;
            });
        },
    }
});
</script>