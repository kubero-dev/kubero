
<template>
    <div>

        <v-switch
            v-model="settings.kubero.config.templates.enabled"
            label="Allow Templates"
            color="primary"
            required
        ></v-switch>
        <v-expansion-panels
            v-model="panel"
            multiple
        >

            <v-expansion-panel bg-color="rgb(var(--v-theme-cardBackground))" v-for="(catalog, index) in settings.kubero.config.templates.catalogs" :key="index">
            <v-expansion-panel-title class="text-uppercase text-caption-2 font-weight-medium" color="cardBackground">{{ catalog.name }}</v-expansion-panel-title>
            <v-expansion-panel-text>
            <v-row>
                <v-col
                    cols="12"
                    md="3"
                >
                    <v-text-field
                    v-model="catalog.name"
                    label="Name"
                    required
                    density="compact"
                    ></v-text-field>
                </v-col>
                <v-col
                    cols="12"
                    md="7"
                >
                    <v-text-field
                    v-model="catalog.description"
                    label="Description"
                    required
                    density="compact"
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col
                    cols="12"
                    md="10"
                >
                    <v-text-field
                    v-model="catalog.templateBasePath"
                    label="Template Base Path"
                    required
                    density="compact"
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col
                    cols="12"
                    md="10"
                >
                    <v-text-field
                    v-model="catalog.index.url"
                    label="Index URL"
                    required
                    density="compact"
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row justify="space-between">
                <v-col
                    cols="12"
                    md="6"
                >
                    <v-select
                    v-model="catalog.index.format"
                    :items="['json']"
                    label="Index Format"
                    required
                    ></v-select>
                </v-col>


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
                        @click="deleteBuildpack(catalog)"
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
                @click="addTemplateCatalog"
                >
                    <v-icon color="primary">
                        mdi-plus
                    </v-icon>
            </v-btn>
            Add a new pod size
        </p>
    </div>
</template>


<script lang="ts">
import { defineComponent } from 'vue'

// Types
import { Catalog } from './form.vue'

export interface Buildpack {
    name: string
    language: string
    advanced: boolean
}

export default defineComponent({
    name: 'FormTemplates',
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
            panel: -1
        }
    },
    methods: {
        deleteBuildpack(catalog: Catalog) {
            this.panel = -1
            this.settings.kubero.config.templates.catalogs.splice(this.settings.kubero.config.templates.catalogs.indexOf(catalog), 1)
        },
        addTemplateCatalog() {
            this.settings.kubero.config.templates.catalogs.push({
                name: '',
                description: '',
                templateBasePath: '',
                index: {
                    url: '',
                    format: 'json'
                }
            })

            // open panel 
            this.panel = this.settings.kubero.config.templates.catalogs.length - 1
        }
    }
})

</script>