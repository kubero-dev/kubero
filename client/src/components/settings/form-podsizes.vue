
<template>
    <div>

        <v-row>
            <v-col cols="12" sm="12" md="12" lg="12" xl="12">
                <h2>
                    Vertical Scaling
                </h2>
                <p class="text-justify">
                    Define the available pod sizes for the applications.
                </p>


                <v-alert 
                    type="info"
                    variant="tonal"
                    style="margin-bottom: 20px; margin-top: 20px;"
                    text="Configuration changes won't take effect until the next deployment.">
                </v-alert>
            </v-col>
        </v-row>

        <div v-for="podSize in settings.podSizeList" :key="podSize.name">
            <v-divider class="ma-5"></v-divider>
            <v-row>
                <v-col
                    cols="12"
                    md="2"
                >
                    <v-text-field
                    v-model="podSize.name"
                    label="Name"
                    required
                    readonly
                    ></v-text-field>
                </v-col>
                <v-col
                    cols="12"
                    md="4"
                >
                    <v-text-field
                    v-model="podSize.description"
                    label="Description"
                    required
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col
                    cols="12"
                    md="2"
                    class="d-flex align-center v-label theme--light"
                >Request
                </v-col>
                <v-col
                    cols="12"
                    md="2"
                >
                    <v-text-field
                    v-model="podSize.resources.requests.memory"
                    label="Memory"
                    required
                    ></v-text-field>
                </v-col>
                <v-col
                    cols="12"
                    md="2"
                >
                    <v-text-field
                    v-model="podSize.resources.requests.cpu"
                    label="CPU"
                    required
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col
                    cols="12"
                    md="2"
                    class="d-flex align-center v-label theme--light"
                >Limits
                </v-col>
                <v-col
                    cols="12"
                    md="2"
                >
                    <v-text-field
                    v-model="podSize.resources.limits.memory"
                    label="Memory"
                    required
                    ></v-text-field>
                </v-col>
                <v-col
                    cols="12"
                    md="2"
                >
                    <v-text-field
                    v-model="podSize.resources.limits.cpu"
                    label="CPU"
                    required
                    ></v-text-field>
                </v-col>
            </v-row>
        </div>
    </div>
</template>


<script lang="ts">
import { defineComponent } from 'vue'

// Types
import { Settings } from './form.vue'

export type PodSize = {
    name: string,
    description: string,
    resources: {
        requests: {
            cpu: string,
            memory: string,
        },
        limits: {
            cpu: string,
            memory: string,
        }
    }
}

export default defineComponent({
    name: 'FormPodsizes',
    props: {
        settings: {
            type: Object as () => Settings,
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