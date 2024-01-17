<template>
    <v-container>
        <v-row>
            <v-col cols="12" sm="12" md="6" lg="6" xl="6">
                <Appstats :pipeline="pipeline" :phase="phase" :app="app" :appData="appData" :pipelineData="pipelineData"></Appstats>
            </v-col>
            <v-col cols="12" sm="12" md="6" lg="6" xl="6">
                <Audit :pipeline="pipeline" :phase="phase" :app="app"></Audit>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import Audit from './eventsAudit.vue'
import Appstats from './appstats.vue'

import { defineComponent } from 'vue'

export default defineComponent({
    props: {
      appData: {
        type: Object,
        default: () => {}
      },
      pipelineData : {
        type: Object,
        default: () => {}
      },
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
      },
    },
    data: () => ({
    }),
    components: {
        Audit,
        Appstats,
    },
});
</script>

<style lang="scss">

</style>