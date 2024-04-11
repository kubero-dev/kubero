
<template>
    <div>
        <v-expansion-panels
            v-model="panel"
            multiple
        >

            <v-expansion-panel bg-color="rgb(var(--v-theme-cardBackground))" v-for="(n, index) in settings.kubero.config.notifications" :key="index">
            <v-expansion-panel-title class="text-uppercase text-caption-2 font-weight-medium" color="cardBackground">{{ n.name }}</v-expansion-panel-title>
            <v-expansion-panel-text>
            <v-row>
                <v-col
                    cols="12"
                    md="7"
                >
                    <v-text-field
                    v-model="n.name"
                    label="Name"
                    required
                    density="compact"
                    ></v-text-field>
                </v-col>
                <v-col
                    cols="12"
                    md="3"
                >
                <v-switch
                    v-model="n.enabled"
                    label="Enabled"
                    color="primary"
                    inset
                ></v-switch>
                </v-col>
            </v-row>

            <v-row>
                <v-col
                    cols="12"
                    md="10"
                >
                <v-select
                v-model="n.events"
                :items="availableEvents"
                :menu-props="{ maxHeight: '400' }"
                label="Events"
                multiple
                hint="Select one or more"
                persistent-hint
                chips
                class="capability"
                ></v-select>
                </v-col>
            </v-row>
            <v-row>
                <v-col
                    cols="12"
                    md="10"
                >
                    <v-select
                    v-model="n.type"
                    :items="['webhook', 'slack', 'discord']"
                    label="Type"
                    required
                    ></v-select>
                </v-col>
            </v-row>
            <div v-if="n.type == 'webhook'">
                <v-row>
                    <v-col
                        cols="12"
                        md="10"
                    >
                        <v-text-field
                        v-model="n.config.url"
                        label="Webhook URL"
                        required
                        ></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col
                        cols="12"
                        md="10"
                    >
                        <v-text-field
                        v-model="n.config.secret"
                        label="Secret"
                        required
                        ></v-text-field>
                    </v-col>
                </v-row>
            </div>
            <div v-if="n.type == 'slack'">
                <v-row>
                    <v-col
                        cols="12"
                        md="10"
                    >
                        <v-text-field
                        v-model="n.config.url"
                        label="Slack Webhook URL"
                        required
                        ></v-text-field>
                    </v-col>
                </v-row>
            </div>
            <div v-if="n.type == 'discord'">
                <v-row>
                    <v-col
                        cols="12"
                        md="10"
                    >
                        <v-text-field
                        v-model="n.config.url"
                        label="Discord Webhook URL"
                        required
                        ></v-text-field>
                    </v-col>
                </v-row>
            </div>
            <v-row justify="space-between">

                <v-col
                    cols="12"
                    md="2"
                >
                    <v-btn
                        elevation="2"
                        fab
                        small
                        class="ma-2"
                        color="secondary"
                        @click="deleteNotification(n)"
                        >
                            <v-icon color="primary">
                                mdi-delete
                            </v-icon>
                    </v-btn>
                </v-col>
            </v-row>
            </v-expansion-panel-text>
            </v-expansion-panel>
        </v-expansion-panels>
        <p class="text-justify">
            <v-btn
                elevation="2"
                fab
                small
                class="ma-2"
                color="secondary"
                @click="addNotification"
                >
                    <v-icon color="primary">
                        mdi-plus
                    </v-icon>
            </v-btn>
        </p>
    </div>
</template>


<script lang="ts">
import { defineComponent } from 'vue'

// Types
import { Catalog } from './form.vue'

export default defineComponent({
    name: 'FormNotifications',
    props: {
        settings: {
            type: Object as () => any,
            required: true,
        }
    },
    components: {
    },
    data() {
        return {
            show: false,
            panel: -1,
            availableEvents: [
                'updatePipeline',
                'deletePipeline',
                'newPipeline',
                'newApp',
                'updateApp',
                'deleteApp',
                'restartApp',
                'rebuildApp',
                'deployApp',
                'updateSettings',
                'handleWebhookPush',
            ]
        }
    },
    methods: {
        deleteNotification(catalog: Catalog) {
            this.panel = -1
            this.settings.kubero.config.notifications.splice(this.settings.kubero.config.notifications.indexOf(catalog), 1)
        },
        addNotification() {
            this.settings.kubero.config.notifications.push({
                name: '',
                enabled: true,
                type: 'webhook',
                config: {
                    url: '',
                }
            })

            // open panel 
            this.panel = this.settings.kubero.config.notifications.length - 1
        }
    }
})

</script>