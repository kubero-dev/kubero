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
            items: [
                {
                    text: 'Pipelines Dashboard',
                    disabled: false,
                    href: '#/',
                },
                {
                    text: this.pipeline,
                    disabled: false,
                    href: '#/pipeline/'+this.pipeline+'/apps',
                },
                {
                    text: this.phase,
                    disabled: false,
                },
                {
                    text: this.app,
                    disabled: false,
                },
            ],
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