<template>
    <v-container>
        <a :href="`/#/pipeline/${pipeline}/apps`"><v-icon small>mdi-arrow-left-circle</v-icon> {{ this.pipeline }}</a>
        <v-tabs v-model="tab">
            <v-tab>Logs</v-tab>
            <v-tab>Events</v-tab>
        </v-tabs>

        <v-tabs-items v-model="tab">
            <v-tab-item transition="false">
                <logs :pipeline="pipeline" :phase="phase" :app="app"/>
            </v-tab-item>
            <v-tab-item transition="false">
                <events :pipeline="pipeline" :phase="phase" :app="app"/>
            </v-tab-item>
        </v-tabs-items>
    </v-container>
</template>

<script>
export default {
    data () {
        return {
            tab: null,
        }
    },
    components: {
        events : () => import('./events.vue'),
        logs : () => import('./logs.vue'),
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
}
</script>