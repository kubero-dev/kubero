
<template>
    <div style="margin-left: 10px">
        <v-row>
            <v-col cols="12" sm="12" md="12" lg="12" xl="12">
                <h2>
                    General Kubero Settings
                </h2>
                <p class="text-justify">
                    Some of the configuration values require a browser refresh to take effect.
                </p>
            </v-col>
        </v-row>

        <v-divider class="ma-5"></v-divider>
        <v-row>
            <v-col
            cols="12"
            md="6"
            >
            <v-text-field
                v-model="settings.kubero.namespace"
                label="Kubero Namespace"
                required
            ></v-text-field>
            </v-col>
        </v-row>

        <v-row>
            <v-col
            cols="12"
            md="6"
            >
            <v-switch
                v-model="settings.kubero.config.kubero.readonly"
                label="Readonly Mode"
                required
                color="primary"
            ></v-switch>
            </v-col>
        </v-row>

        <v-row>
            <v-col
            cols="12"
            md="6"
            >
            <v-switch
                v-model="settings.kubero.config.kubero.console.enabled"
                label="TTY Console enabled"
                required
                color="primary"
            ></v-switch>
            </v-col>
        </v-row>

        <v-divider class="ma-5"></v-divider>
        <h4 class="text-uppercase">Banner</h4>

        <v-row>
            <v-col
                cols="12"
                md="2"
            >
                <v-switch
                v-model="settings.kubero.config.kubero.banner.show"
                label="Enabled"
                color="primary"
                required
                ></v-switch>
            </v-col>
            <v-col
                cols="12"
                md="3"
                v-if="settings.kubero.config.kubero.banner.show"
            >
                <v-text-field
                v-model="settings.kubero.config.kubero.banner.bgcolor"
                label="Background Color"
                required
                ></v-text-field>
            </v-col>
            <v-col
                cols="12"
                md="3"
                v-if="settings.kubero.config.kubero.banner.show"
            >
                <v-text-field
                v-model="settings.kubero.config.kubero.banner.fontcolor"
                label="Font Color"
                required
                ></v-text-field>
            </v-col>
        </v-row>
        <v-row v-if="settings.kubero.config.kubero.banner.show">
            <v-col
                cols="12"
                md="8"
            >
                <v-text-field
                v-model="settings.kubero.config.kubero.banner.message"
                label="Message"
                required
                ></v-text-field>
            </v-col>
        </v-row>

    </div>
</template>


<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'FormGeneral',
    props: {
        settings: {
            type: Object as () => any,
            required: true
        }
    },
    mounted() {
        console.log(this.settings.kubero.namespace)
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