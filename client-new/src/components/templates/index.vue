<template>
    <v-container>

        <v-row class="justify-space-between">
            <v-col cols="6" sm="6" md="6" lg="6" xl="6">
                <h1>Templates</h1>
            </v-col>
        </v-row>
        <v-row>
            <v-tabs v-if="templates.catalogs.length > 1">
                <template>
                    <v-tab
                        v-for="(catalog, index) in Object.entries(templates.catalogs)"
                        :key="index"
                        @click="loadTemplates(catalog[1].index.url)"
                    >
                        {{ catalog[1].name }}
                    </v-tab>
                </template>
            </v-tabs>
            <v-col cols="12" sm="12" md="3"
            v-for="template in services.services" :key="template.name">
                <v-card
                    style="padding-bottom: 40px;"
                    height="320px"
                    color="cardBackground">
                    <v-list-item-content>

                        <div  class="d-flex justify-center">
                            <v-avatar
                                size="57"
                                rounded
                                style="margin-top: 20px;"
                                >
                                <v-img
                                    :src="template.icon"
                                    :alt="template.name"
                                ></v-img>
                            </v-avatar>
                        </div>
                        <v-card-title>
                            <a :href="template.website" target="_blank">{{ template.name }}</a>
                        </v-card-title>

                        <v-card-subtitle>
                            <v-chip
                                label
                                small
                                class="mr-2"
                            ><v-icon left small>mdi-star</v-icon>{{ template.stars }}</v-chip>
                            <v-chip
                                label
                                small
                                v-if="template.spdx_id && template.spdx_id !== 'NOASSERTION'"
                            ><v-icon left small>mdi-file-certificate</v-icon>{{ template.spdx_id }}</v-chip>
                        </v-card-subtitle>

                        <v-card-text>
                            {{ template.description }}
                            <!--Operator: <a :href="template.url">{{ template.id }}</a>-->
                        </v-card-text>
                    </v-list-item-content>
                </v-card>
                <div class="text-center" style="height:0px" v-if="!template.enabled">
                <v-btn
                    style="top: -50px;"
                    color="primary"
                    dark
                    @click="openInstallDialog(template)"
                    >
                    details
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
                    {{clickedTemplate.name}}
                </v-card-title>
                <v-card-text>
                    {{clickedTemplate.description}}
                </v-card-text>
                <v-card-text v-if="clickedTemplate.screenshots && clickedTemplate.screenshots.length > 0">
                    <v-carousel>
                        <v-carousel-item
                        v-for="(screenshot, i) in clickedTemplate.screenshots"
                        :key="i"
                        :src="screenshot"
                        >
                        </v-carousel-item>
                    </v-carousel>
                </v-card-text>
                <v-card-text>
                    <v-select
                        :items="pipelines"
                        label="Pipeline"
                        v-model="pipeline"
                    ></v-select>
                    <v-select
                        :items="phases[pipeline]"
                        label="Phase"
                        v-model="phase"
                    ></v-select>
                    <v-btn
                        color="primary"
                        dark
                        :disabled="!pipeline || !phase"
                        @click="openInstall(clickedTemplate.dirname, pipeline, phase, catalogId)"
                        >
                        Install
                    </v-btn>
                </v-card-text>
            </v-card>
        </v-dialog>

    </v-container>
</template>

<script lang="ts">
import axios from "axios";
import { defineComponent } from 'vue'

type Pipeline = {
    name: string,
    git: {
        repository: {
            admin: boolean,
            description: string,
        }
    },
    phases: {
        name: string,
        enabled: boolean,
    }[]
}

type PipelineList = {
    items: Pipeline[]
}

type Template = {
    name: string,
    description: string,
    enabled: boolean,
    icon: string,
    stars: number,
    spdx_id: string,
    website: string,
    screenshots: string[],
    dirname: string,
}

type Templates = {
    enabled: boolean,
    catalogs: {
        name: string,
        index: {
            url: string,
        }
    }[]
}

type Catalog = {
    name: string,
    index: {
        url: string,
    }
}

type Services = {
    services: Template[],
}

export default defineComponent({
    sockets: {
    },
    mounted() {
        this.loadCatalogs(this.catalogId);
        this.loadPipelinesList();
    },
    data: () => ({
        pipeline: '',
        phase: '',
        pipelines: [] as string[],
        phases: {} as { [key: string]: string[] },
        services: {} as Services,
        dialog: false,
        clickedTemplate: {} as Template,
        catalogId: 0,
        templates: {
            enabled: true,
            catalogs: [] as Catalog[],
        },
        catalogTabs: [] as string[],
    }),
    components: {
    },
    methods: {
        async copyInstall(install: string) {
            try {
                await navigator.clipboard.writeText(install);
            } catch($e) {
                console.log('Cannot copy');
            }
            this.dialog = false;
        },
        openInstall(templatename: string, pipeline: string, phase: string, catalogId: number) {
            // redirect to install page
            window.location.href = `/#/pipeline/${pipeline}/${phase}/apps/new?template=${templatename}&catalogId=${catalogId}`;

        },
        openInstallDialog(template: Template) {
            this.clickedTemplate = template;
            this.dialog = true;
        },
        loadCatalogs(catalogId: number) {
            const self = this;
            axios.get(`/api/config/catalogs`)
            .then(response => {
                self.templates = response.data;
                if (self.templates.catalogs.length > 0 && self.templates.enabled == true) {
                    self.loadTemplates(self.templates.catalogs[catalogId].index.url)
                }

            })
            .catch(error => {
                console.log(error);
            });
        },
        async loadTemplates(indexUrl: string) {
            const self = this;
            axios.get(indexUrl)
            .then(response => {
                self.services = response.data;
            })
            .catch(error => {
                console.log(error);
            });
        },
        loadPipelinesList() {
            const self = this;
            axios.get(`/api/pipelines`)
            .then(response => {
                for (let i = 0; i < response.data.items.length; i++) {
                    const pipeline = response.data.items[i] as Pipeline;
                    let p = [];
                    for (let j = 0; j < pipeline.phases.length; j++) {
                        const phase = pipeline.phases[j];
                        if (phase.enabled == true) {
                            p.push(phase.name);
                        }
                    }
                    self.pipelines.push(pipeline.name);
                    self.phases[pipeline.name] = p;

                }
            })
            .catch(error => {
                console.log(error);
            });
        },
    },
})
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


.theme--light.v-chip:not(.v-chip--active) {
    background: #e6e6e6;
}

.theme--dark.v-chip:not(.v-chip--active) {
    background: #2c2c2c;
}

</style>