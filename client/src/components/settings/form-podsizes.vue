
<template>
    <div>
        <div v-for="podSize in settings.podSizeList" :key="podSize.name">

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
                    readonly
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
                    readonly
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
                    readonly
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
                    readonly
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
    name: 'FormPodsizes',
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