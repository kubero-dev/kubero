<template>
    <v-container>
        <breadcrumbs :items="breadcrumbItems"></breadcrumbs>
        <v-tabs v-model="tab"  class="background">
            <v-tab class="background">Logs</v-tab>
            <v-tab class="background">Events</v-tab>
            <v-tab class="background">Vulnerabilities</v-tab>
            <v-spacer  class="background"></v-spacer>
        </v-tabs>

        <v-tabs-items v-model="tab">
            <v-tab-item transition="false" class="background">
                <logs :pipeline="pipeline" :phase="phase" :app="app"/>
            </v-tab-item>
            <v-tab-item transition="false" class="background">
                <events :pipeline="pipeline" :phase="phase" :app="app"/>
            </v-tab-item>
            <v-tab-item transition="false" class="background">
                <vulnerabilities :pipeline="pipeline" :phase="phase" :app="app"/>
            </v-tab-item>
        </v-tabs-items>
    </v-container>
</template>

<script>
export default {
    data () {
        return {
            tab: null,
            breadcrumbItems: [
                {
                    text: 'DASHBOARD',
                    disabled: false,
                    href: '#/',
                },
                {
                    text: 'PIPELINE:'+this.pipeline,
                    disabled: false,
                    href: '#/pipeline/'+this.pipeline+'/apps',
                },
                {
                    text: 'PHASE:'+this.phase,
                    disabled: true,
                    href: `#/pipeline/${this.pipeline}/${this.phase}/${this.app}/detail`,
                },
                {
                    text: 'APP:'+this.app,
                    disabled: true,
                    href: `#/pipeline/${this.pipeline}/${this.phase}/${this.app}/detail`,
                },
                {
                    text: "EDIT",
                    disabled: false,
                    //http://localhost:2000/#/pipeline/customcommand/production/noproc
                    href: `#/pipeline/${this.pipeline}/${this.phase}/${this.app}`,
                    icon: "mdi-pencil-box-outline",
                },
            ],
        }
    },
    components: {
        events : () => import('./events.vue'),
        logs : () => import('./logs.vue'),
        vulnerabilities : () => import('./vulnerabilities.vue'),
        breadcrumbs: () => import('../breadcrumbs.vue'),
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