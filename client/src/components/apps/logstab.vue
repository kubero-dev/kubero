<template>
    <v-container>
        <v-row>
            <v-col cols="6" sm="6" md="6" lg="6" xl="6">
                <!--
                <h1>
                    Logs for {{ app }}
                </h1>
                -->
            </v-col>
            <v-col cols="6" sm="6" md="6" lg="6" xl="6" class="d-flex justify-end">
                <v-btn
                    class="ma-2"
                    @click="openInWindow"
                    color="secondary"
                    >{{ $t('app.actions.openLogs') }}
                    <v-icon right dark >mdi-open-in-new</v-icon>
                </v-btn>
                <p></p>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12" sm="12" md="12" style="height: calc(100vh - 400px);">
                <Logs :pipeline=pipeline :phase=phase :app=app :deploymentstrategy=deploymentstrategy :buildstrategy=buildstrategy logType="runlogs" height="600px"/>
            </v-col>
        </v-row>

    </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Logs from './logs.vue'

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
      },
      deploymentstrategy: {
        type: String,
        default: "docker"
      },
      buildstrategy: {
        type: String,
        default: "dockerfile"
      },
    },
    data: () => ({
    }),
    components: {
        Logs,
    },
    methods: {
        openInWindow() {
            window.open(`/popup/logs/${this.pipeline}/${this.phase}/${this.app}/${this.deploymentstrategy}/${this.buildstrategy}`, '_blank', 'popup=yes,location=no,height=1000,width=1000,scrollbars=yes,status=no');
        }
    },
});
</script>

<style lang="scss">

a:link { text-decoration: none;}
.v-icon.v-icon {
    vertical-align:inherit;
}
</style>