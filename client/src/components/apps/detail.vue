<template>
    <v-container>
        <v-breadcrumbs :items="items">
            <template v-slot:item="{ item }">
            <v-breadcrumbs-item
                :href="item.href"
                :disabled="item.disabled"
            >
                {{ item.text.toUpperCase() }}
            </v-breadcrumbs-item>
            </template>
        </v-breadcrumbs>
        <v-tabs v-model="tab">
            <v-tab>Logs</v-tab>
            <v-tab>Events</v-tab>
            <v-tab>Vulnerabilities</v-tab>
        </v-tabs>

        <v-tabs-items v-model="tab">
            <v-tab-item transition="false">
                <logs :pipeline="pipeline" :phase="phase" :app="app"/>
            </v-tab-item>
            <v-tab-item transition="false">
                <events :pipeline="pipeline" :phase="phase" :app="app"/>
            </v-tab-item>
            <v-tab-item transition="false">
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
            items: [
                {
                    text: 'Dashboard',
                    disabled: false,
                    href: '#/',
                },
                {
                    text: 'Pipeline:'+this.pipeline,
                    disabled: false,
                    href: '#/pipeline/'+this.pipeline+'/apps',
                },
                {
                    text: 'Phase:'+this.phase,
                    disabled: false,
                },
                {
                    text: this.app,
                    disabled: false,
                    //http://localhost:2000/#/pipeline/customcommand/production/noproc
                    href: `#/pipeline/${this.pipeline}/${this.phase}/${this.app}`,
                },
            ],
        }
    },
    components: {
        events : () => import('./events.vue'),
        logs : () => import('./logs.vue'),
        vulnerabilities : () => import('./vulnerabilities.vue'),
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