
<template>
    <div>

        <v-alert 
            type="info"
            variant="tonal"
            style="margin-bottom: 20px; margin-top: 20px;"
            text="These buildpacks are used only for apps using the 'plain' build strategy">
        </v-alert>
        <v-expansion-panels
            v-model="panel"
            multiple
        >

            <v-expansion-panel bg-color="rgb(var(--v-theme-cardBackground))" v-for="buildpack in settings.buildpacks" :key="buildpack.name">
            <v-expansion-panel-title class="text-uppercase text-caption-2 font-weight-medium" color="cardBackground">{{ buildpack.name }}</v-expansion-panel-title>
            <v-expansion-panel-text>
            <v-row>
                <v-col
                    cols="12"
                    md="3"
                >
                    <v-text-field
                    v-model="buildpack.name"
                    label="Name"
                    required
                    density="compact"
                    readonly
                    disabled
                    ></v-text-field>
                </v-col>
                <v-col
                    cols="12"
                    md="3"
                >
                    <v-text-field
                    v-model="buildpack.language"
                    label="Language"
                    required
                    density="compact"
                    ></v-text-field>
                </v-col>
                <v-col
                    cols="12"
                    md="4"
                >
                    <v-switch
                        v-model="buildpack.advanced"
                        label="Advanced"
                        density="compact"
                    ></v-switch>
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
                        @click="deleteBuildpack(buildpack)"
                        >
                            <v-icon color="primary">
                                mdi-delete
                            </v-icon>
                    </v-btn>
                </v-col>
            </v-row>
            <v-divider class="ma-5"></v-divider>
            <FormBuildpacksItem :buildpackStage="buildpack.fetch" title="Fetch" :advanced="buildpack.advanced"></FormBuildpacksItem>

            <v-divider class="ma-5"></v-divider>
            <FormBuildpacksItem :buildpackStage="buildpack.build" title="Build" :advanced="buildpack.advanced"></FormBuildpacksItem>

            <v-divider class="ma-5"></v-divider>
            <FormBuildpacksItem :buildpackStage="buildpack.run" title="Run" :advanced="buildpack.advanced"></FormBuildpacksItem>
            
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
                @click="addBuildpack"
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
import { Settings } from './form.vue'
import { BuildpackStage } from './form-buildpacks-item.vue'
import FormBuildpacksItem from './form-buildpacks-item.vue'



export type Buildpack = {
    advanced?: boolean,
    name: string,
    language: string,
    fetch: BuildpackStage,
    build: BuildpackStage,
    run: BuildpackStage
}

export default defineComponent({
    name: 'FormBuildpacks',
    props: {
        settings: {
            type: Object as () => Settings,
            required: true,
            validator: (settings: Settings) => {
                return settings.buildpacks.every((buildpack: Buildpack) => {
                    return buildpack.name && buildpack.language && buildpack.fetch.repository && buildpack.fetch.tag && buildpack.build.repository && buildpack.build.tag && buildpack.run.repository && buildpack.run.tag
                })
            }
        }
    },
    components: {
        FormBuildpacksItem
    },
    data() {
        return {
            show: false,
            panel: null
        }
    },
    methods: {
        deleteBuildpack(buildpack: Buildpack) {
            this.panel = null
            this.settings.buildpacks.splice(this.settings.buildpacks.indexOf(buildpack), 1)
        },
        addBuildpack() {
            this.settings.buildpacks.push({
                name: '',
                language: '',
                advanced: true,
                fetch: {
                    repository: 'ghcr.io/kubero-dev/buildpacks/fetch',
                    tag: 'latest',
                    command: '',
                    readOnlyAppStorage: false,
                    securityContext: {
                        runAsUser: 1000,
                        runAsGroup: 1000,
                        runAsNonRoot: false,
                        readOnlyRootFilesystem: false,
                        allowPrivilegeEscalation: false,
                        capabilities: {
                            add: [],
                            drop: []
                        }
                    }
                },
                build: {
                    repository: '',
                    tag: '',
                    command: '',
                    readOnlyAppStorage: false,
                    securityContext: {
                        runAsUser: 1000,
                        runAsGroup: 1000,
                        runAsNonRoot: false,
                        readOnlyRootFilesystem: false,
                        allowPrivilegeEscalation: false,
                        capabilities: {
                            add: [],
                            drop: []
                        }
                    }
                },
                run: {
                    repository: '',
                    tag: '',
                    command: '',
                    readOnlyAppStorage: false,
                    securityContext: {
                        runAsUser: 1000,
                        runAsGroup: 1000,
                        runAsNonRoot: false,
                        readOnlyRootFilesystem: false,
                        allowPrivilegeEscalation: false,
                        capabilities: {
                            add: [],
                            drop: []
                        }
                    }
                }
            })
        }
    }
})

</script>