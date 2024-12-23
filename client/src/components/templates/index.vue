<template>
    <v-container>

        <v-row class="justify-space-between">
            <v-col cols="6" sm="12" md="12" lg="6" xl="6">
                <h1>Templates</h1>
            </v-col>
            <v-col cols="3" sm="6" md="3">
                <v-text-field 
                    label="Search"
                    v-model="search"
                    color="secondary"
                    @input="searchTemplates"
                    density="comfortable"
                ></v-text-field>
            </v-col>
            <v-col cols="3" sm="6" md="3">
                <v-select
                    :items="categories"
                    color="secondary"
                    density="comfortable"
                    @update:modelValue="filterByCategory"
                    label="Category"
                    :v-model="selectedCategory"
                ></v-select>
            </v-col>
        </v-row>
        <v-row>
            <v-tabs v-if="templates.catalogs.length > 1">
                    <v-tab
                        v-for="(catalog, index) in Object.entries(templates.catalogs)"
                        :key="index"
                        @click="loadTemplates(catalog[1].index.url)"
                    >
                        {{ catalog[1].name }}
                    </v-tab>
            </v-tabs>
        </v-row>
        <v-row>
            <v-col cols="12" sm="12" md="3"
            v-for="template in showedTemplates.services" :key="template.name">
                <v-card
                    style="padding-bottom: 40px;"
                    height="320px"
                    color="cardBackground">
                    <v-list-item>

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
                                size="small"
                                class="mr-2"
                                prepend-icon="mdi-star"
                            >{{ template.stars }}</v-chip>
                            <v-chip
                                label
                                size="small"
                                prepend-icon="mdi-file-certificate"
                                v-if="template.spdx_id && template.spdx_id !== 'NOASSERTION'"
                            >{{ template.spdx_id }}</v-chip>
                        </v-card-subtitle>

                        <v-card-text>
                            {{ template.description }}
                            <!--Operator: <a :href="template.url">{{ template.id }}</a>-->
                        </v-card-text>
                    </v-list-item>
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
            <v-card :title="clickedTemplate.name">
                <v-card-item>
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
                            @click="openInstall(clickedTemplate.template, pipeline, phase)"
                            >
                            Load template
                        </v-btn>
                    </v-card-text>
                </v-card-item>
            </v-card>
        </v-dialog>

    </v-container>
</template>

<script lang="ts">
import axios from "axios";
import { forEach } from "lodash";
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
    template: string,
    addons: string[],
    language: string,
    categories: string[],
    created_at: string,
    last_updated: string,
    last_pushed: string,
    status: string,
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

type TemplatesList = {
    services: Template[],
    categories: Object,
    // categories: {
    //     title: string,
    //     count: number,
    // }[]
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
        templatesList: {} as TemplatesList,
        showedTemplates: {} as TemplatesList,
        dialog: false,
        clickedTemplate: {} as Template,
        catalogId: 0,
        templates: {
            enabled: true,
            catalogs: [] as Catalog[],
        },
        catalogTabs: [] as string[],
        categories: [
            { title: 'All', value: 'All' },
        ],
        search: '',
        selectedCategory: {
            title: 'All',
            value: 'All',
        },
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
        openInstall(templateurl: string, pipeline: string, phase: string) {
            // redirect to install page
            const templateurlB64 = btoa(templateurl);
            this.$router.push({ name: 'App Form', params: { pipeline: pipeline, phase: phase, app: 'new'}, query: { template: templateurlB64 }})

        },
        openInstallDialog(template: Template) {
            this.clickedTemplate = template;
            this.dialog = true;
        },
        loadCatalogs(catalogId: number) {
            const self = this;
            axios.get(`/api/config/catalogs`)
            .then(response => {
                self.templates = response.data as Templates;
                if (self.templates.catalogs.length > 0 && self.templates.enabled == true) {
                    self.loadTemplates(self.templates.catalogs[catalogId].index.url)
                }

            })
            .catch(error => {
                console.log(error);
            });
        },
        filterByCategory(selectedCategory: string) {
            console.log(selectedCategory);
            if (selectedCategory === 'All') {
                this.showedTemplates.services = this.templatesList.services;
            } else {
                this.showedTemplates.services = this.templatesList.services.filter((template) => {
                    return template.categories.includes(selectedCategory);
                });
            }
        },
        searchTemplates() {
            if (this.search !== '') {
                this.showedTemplates.services = this.templatesList.services.filter((template) => {
                    return template.name.toLowerCase().includes(this.search.toLowerCase());
                });
            } else {
                this.showedTemplates.services = this.templatesList.services;
            }
        },
        async loadTemplates(indexUrl: string) {
            const self = this;
            axios.get(indexUrl)
            .then(response => {
                self.templatesList = response.data;
                forEach(self.templatesList.categories, (value, key) => {
                    self.categories.push({ title: key + ' (' + value + ')', value: key });
                });
                self.searchTemplates();
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