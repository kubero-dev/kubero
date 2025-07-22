<template>
    <v-container>
        <h1>{{ $t('navigation.activity') }}</h1>
        <v-layout>
                <v-row
                v-if="auditEvents.length > 0" class="mb-10">
                    <v-timeline align-top truncate-line="start" side="end" class="mt-10">
                        <v-timeline-item
                            v-for="event in auditEvents" :key="event.id"
                            :color=event.color
                            :icon=getIcon(event.action)
                            dot-color="var(--v-primary-base)"
                            fill-dot>
                            <div class="d-flex">
                                <!--<strong class="me-4">{{ event.metadata.creationTimestamp }}</strong>-->
                                <div>
                                    <strong>{{ event.users.username }}: </strong>  {{ event.action }} {{ event.resource }}
                                    <div class="text-caption">
                                        {{ event.timestamp }} · v{{ event.id }} · {{ event.message }}
                                    </div>
                                </div>
                            </div>
                            <v-divider v-if="event !== auditEvents[auditEvents.length - 1]" ></v-divider>
                        </v-timeline-item>

                    </v-timeline>
                </v-row>
        </v-layout>
    </v-container>
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
    users: {
        id?: string,
        username: string,
        email?: string,
        firstName?: string,
        lastName?: string,
    },
}

type Audit = {
    audit: AuditEvent[],
    count: number,
    limit: number,
}

export default defineComponent({
    sockets: {
        async updatedEvents(events: Event[]) {
            console.log("updatedEvents", events);
        },
    },
    mounted() {
        this.loadAudit();
    },
    data: () => ({
        auditEvents: [] as AuditEvent[],
        limit: 50,
        count: 0,
    }),
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
            axios.get('/api/audit', { params: { limit: this.limit } }).then(response => {
                this.auditEvents = response.data.audit;
                this.count = response.data.count;
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