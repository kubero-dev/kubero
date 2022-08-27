<template>
    <v-container>

        <v-row class="justify-space-between">
            <v-col cols="6" sm="6" md="6" lg="6" xl="6">
                <h1>Addons</h1>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12" sm="12" md="4"
            v-for="addon in addons" :key="addon.kind">
                <v-card 
                    :disabled="!addon.enabled"
                    color="#fafafa">
                    <v-list-item-content class="justify-center">
                        
                        <v-avatar
                            size="57"
                            rounded
                            ><img
                            :src="'/img/addons/'+addon.kind+'.png'"
                            :alt="addon.name"
                            ></v-avatar>
                        <v-card-title>
                            <v-badge 
                                v-if="addon.beta"
                                color="blue"
                                content="beta"
                                >
                            {{ addon.kind }}
                            </v-badge>
                        </v-card-title>
                        <v-card-subtitle>
                            <span v-if="addon.enabled">{{ addon.version.installed }}</span>
                            <span v-if="!addon.enabled">{{ addon.version.latest }}</span>
                        </v-card-subtitle>
                        <v-card-text>
                            Operator: {{ addon.id }}
                        </v-card-text>
                        <v-btn
                            color="primary"
                            dark
                            @click="openInstallDialog(addon)"
                            >
                            Installation
                        </v-btn>

                    </v-list-item-content>
                </v-card>
            </v-col>
        </v-row>
        <v-dialog
            v-model="dialog"
            max-width="890"
            >
            <v-card>
                <v-card-title class="text-h5">
                {{clickedAddon.kind}}
                </v-card-title>
                <v-card-text>
                    <pre>{{clickedAddon.install}}</pre>
                    <v-btn
                        color="grey lighten-2"
                        @click="copyInstall(clickedAddon.install)"
                        >
                        copy
                        <v-icon
                            right
                            dark
                        >
                            mdi-content-copy
                        </v-icon>
                    </v-btn>

                </v-card-text>
            </v-card>
        </v-dialog>

    </v-container>
</template>

<script>
import axios from "axios";
export default {
    sockets: {
    },
    mounted() {
        this.loadAddonsList();
    },
    data: () => ({
        addons: [],
        dialog: false,
        clickedAddon: {},
    }),
    components: {
    },
    methods: {
        async copyInstall(install) {
            try {
                await navigator.clipboard.writeText(install);
            } catch($e) {
                console.log('Cannot copy');
            }
            this.dialog = false;
        },
        openInstallDialog(addon) {
            this.clickedAddon = addon;
            this.dialog = true;
        },
        loadAddonsList() {
            const self = this;
            axios.get(`/api/addons`)
            .then(response => {
                self.addons = response.data;
            })
            .catch(error => {
                console.log(error);
            });
        },
    },
}
</script>

<style lang="scss">
pre {
    background: #f4f4f4;
    border: 1px solid #ddd;
    border-left: 3px solid #f36d33;
    color: #666;
    page-break-inside: avoid;
    font-family: monospace;
    font-size: 15px;
    line-height: 1.6;
    margin-bottom: 1.6em;
    max-width: 100%;
    overflow: auto;
    padding: 1em 1.5em;
    display: block;
    word-wrap: break-word;
}
</style>