
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

        <div v-for="(podSize, index) in settings.kubero.config.podSizeList" :key="index">
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
                    :readonly="!podSize.editable"
                    :disabled="!podSize.editable"
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
                <v-col
                    cols="12"
                    md="4"
                >
                    <v-checkbox label="default" v-model="podSize.default" @click="makeDefaultUnique(podSize)"></v-checkbox>
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
                        @click="deletePodSize(podSize)"
                        >
                            <v-icon color="primary">
                                mdi-delete
                            </v-icon>
                    </v-btn>
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

        <v-divider class="ma-5"></v-divider>
        <p class="text-justify">
            <v-btn
                elevation="2"
                fab
                small
                class="ma-2"
                color="secondary"
                @click="addPodSize"
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
import { PodSize } from './form.vue'

export default defineComponent({
    name: 'FormPodsizes',
    props: {
        settings: {
            type: Object as () => any,
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
        makeDefaultUnique(podSize: PodSize) {
            this.settings.kubero.config.podSizeList.forEach((ps: PodSize) => {
                if (ps !== podSize) {
                    ps.default = false
                }
            })
        },
        deletePodSize(podSize: PodSize) {
            const index = this.settings.kubero.config.podSizeList.indexOf(podSize)
            this.settings.kubero.config.podSizeList.splice(index, 1)
        },
        addPodSize() {
            this.settings.kubero.config.podSizeList.push({
                name: '',
                description: '',
                editable: true,
                resources: {
                    requests: {
                        cpu: '',
                        memory: '',
                    },
                    limits: {
                        cpu: '',
                        memory: '',
                    }
                }
            })
        }
    }
})

</script>