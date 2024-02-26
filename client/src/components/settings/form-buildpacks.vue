
<template>
    <div>
        <div v-for="buildpack in settings.buildpacks" :key="buildpack.name">

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
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-divider class="ma-5"></v-divider>
        </div>
    </div>
</template>


<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'FormBuildpacks',
    props: {
        settings: {
            type: Object,
            required: true
        }
    },
    components: {
    },
    data() {
        return {
            show: false,
        }
    },
    methods: {
    }
})

</script>