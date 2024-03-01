
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
                    readonly
                    density="compact"
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
                    readonly
                    density="compact"
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col
                    cols="12"
                    md="4"
                >
                    <v-text-field
                    v-model="buildpack.fetch.repository"
                    label="Fetch Repository"
                    required
                    readonly
                    density="compact"
                    ></v-text-field>
                </v-col>
                <v-col
                    cols="12"
                    md="2"
                >
                    <v-text-field
                    v-model="buildpack.fetch.tag"
                    label="Tag"
                    required
                    readonly
                    density="compact"
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col
                    cols="12"
                    md="4"
                >
                    <v-text-field
                    v-model="buildpack.build.repository"
                    label="Build Repository"
                    required
                    readonly
                    density="compact"
                    ></v-text-field>
                </v-col>
                <v-col
                    cols="12"
                    md="2"
                >
                    <v-text-field
                    v-model="buildpack.build.tag"
                    label="Tag"
                    required
                    readonly
                    density="compact"
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col
                    cols="12"
                    md="4"
                >
                    <v-text-field
                    v-model="buildpack.run.repository"
                    label="Run Repository"
                    required
                    readonly
                    density="compact"
                    ></v-text-field>
                </v-col>
                <v-col
                    cols="12"
                    md="2"
                >
                    <v-text-field
                    v-model="buildpack.run.tag"
                    label="Tag"
                    required
                    readonly
                    density="compact"
                    ></v-text-field>
                </v-col>
            </v-row>
            </v-expansion-panel-text>
            </v-expansion-panel>
        </v-expansion-panels>
    </div>
</template>


<script lang="ts">
import { defineComponent } from 'vue'

// Types
import { Settings } from './form.vue'


export type Buildpack = {
    name: string,
    language: string,
    fetch: {
        repository: string,
        tag: string
    },
    build: {
        repository: string,
        tag: string
    },
    run: {
        repository: string,
        tag: string
    }
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
    },
    data() {
        return {
            show: false,
            panel: null
        }
    },
    methods: {
    }
})

</script>