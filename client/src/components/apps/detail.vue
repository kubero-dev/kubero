<template>
    <v-container>
        <breadcrumbs :items="breadcrumbItems"></breadcrumbs>

        <v-container class="d-flex justify-space-between align-center mb-2">
            <v-tabs v-model="tab"  class="background">
                <v-tab class="background">Logs</v-tab>
                <v-tab class="background">Events</v-tab>
                <v-tab class="background">Vulnerabilities</v-tab>
                <v-spacer  class="background"></v-spacer>
            </v-tabs>
            <v-btn
                elevation="2"
                color="primary"
                :href="`#/pipeline/${this.pipeline}/${this.phase}/${this.app}`"
                >Edit App
            </v-btn>
        </v-container>
        
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
                }
            ],
        }
    },
    components: {
        events : () => import('./events.vue'),
        logs : () => import('./logstab.vue'),
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