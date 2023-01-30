<template>
    <v-container>

        <v-row class="justify-space-between">
            <v-col cols="6" sm="6" md="6" lg="6" xl="6">
                <h1>Services</h1>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12" sm="12" md="3"
            v-for="addon in services.services" :key="addon.name">
                <v-card
                    style="padding-bottom: 40px;"
                    height="320px"
                    color="#fafafa">
                    <v-list-item-content class="justify-center">

                        <v-avatar
                            size="57"
                            rounded
                            ><img
                            :src="addon.icon"
                            :alt="addon.name"
                            ></v-avatar>
                        <v-card-title>
                            <v-badge
                                v-if="addon.spdx_idxxx"
                                color="blue"
                                :content=addon.spdx_id
                                >
                            <a :href="addon.website">{{ addon.name }}</a>
                            </v-badge>
                            <a v-else :href="addon.website">{{ addon.name }}</a>
                        </v-card-title>

                        <v-card-subtitle>
                            <v-chip
                                color="#ddd"
                                label
                                small
                                class="mr-2"
                            ><v-icon left small>mdi-star</v-icon>{{ addon.stars }}</v-chip>
                            <v-chip
                                color="#ddd"
                                label
                                small
                                v-if="addon.spdx_id && addon.spdx_id !== 'NOASSERTION'"
                            ><v-icon left small>mdi-file-certificate</v-icon>{{ addon.spdx_id }}</v-chip>
                        </v-card-subtitle>

                        <v-card-text>
                            {{ addon.description }}
                            <!--Operator: <a :href="addon.url">{{ addon.id }}</a>-->
                        </v-card-text>
                    </v-list-item-content>
                </v-card>
                <div class="text-center" style="height:0px" v-if="!addon.enabled">
                <v-btn
                    style="top: -50px;"
                    color="primary"
                    dark
                    @click="openInstallDialog(addon)"
                    >
                    Install
                </v-btn>
                </div>
            </v-col>
        </v-row>
        <v-dialog
            v-model="dialog"
            max-width="890"
            >
            <v-card>
                <v-card-title class="text-h5">
                    {{clickedAddon.name}}
                </v-card-title>
                <v-card-text>
                    {{clickedAddon.description}}
                </v-card-text>
                <v-card-text>
                    <v-carousel v-if="clickedAddon.screenshots && clickedAddon.screenshots.length > 0">
                        <v-carousel-item
                        v-for="(screenshot, i) in clickedAddon.screenshots"
                        :key="i"
                        :src="screenshot"
                        >
                        </v-carousel-item>
                    </v-carousel>

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
        this.loadServicesList();
    },
    data: () => ({
        services: [],
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
        loadServicesList() {
            const self = this;
            axios.get(`https://services.kubero.dev`)
            .then(response => {
                self.services = response.data;
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