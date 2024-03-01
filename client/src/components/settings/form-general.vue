
<template>
    <div style="margin-left: 10px">
        <v-row>
            <v-col cols="12" sm="12" md="12" lg="12" xl="12">
                <h2>
                    General Kubero Settings
                </h2>
                <p class="text-justify">
                    The configuration valures are readonly in this version. Please edit the values in the Kubero CRD directly.
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
                v-model="settings.env.KUBERO_NAMESPACE"
                label="Kubero Namespace"
                required
                readonly
            ></v-text-field>
            </v-col>
        </v-row>

        <v-row>
            <v-col
            cols="12"
            md="6"
            >
            <v-switch
                v-model="settings.kubero.readonly"
                label="Readonly Mode"
                required
                readonly
            ></v-switch>
            </v-col>
        </v-row>

        <v-row>
            <v-col
            cols="12"
            md="6"
            >
            <v-switch
                v-model="settings.kubero.console.enabled"
                label="Console enabled"
                required
                readonly
            ></v-switch>
            </v-col>
        </v-row>

        <v-divider class="ma-5"></v-divider>
        <h4 class="text-uppercase">Webhooks</h4>
        <v-row>
            <v-col
                cols="12"
                md="6"
            >
                <v-text-field
                v-model="settings.env.KUBERO_WEBHOOK_URL"
                label="URL"
                required
                readonly
                ></v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col
                cols="12"
                md="6"
            >
                <v-text-field
                v-model="settings.env.KUBERO_WEBHOOK_SECRET"
                label="Secret"
                required
                readonly
                :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                :type="show ? 'text' : 'password'"
                @click:append="show = !show"
                ></v-text-field>
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
                v-model="settings.kubero.banner.enabled"
                label="Banner Enabled"
                required
                ></v-switch>
            </v-col>
            <v-col
                cols="12"
                md="2"
            >
                <v-text-field
                v-model="settings.kubero.banner.bgcolor"
                label="Background Color"
                required
                readonly
                ></v-text-field>
            </v-col>
            <v-col
                cols="12"
                md="2"
            >
                <v-text-field
                v-model="settings.kubero.banner.fontcolor"
                label="Font Color"
                required
                readonly
                ></v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col
                cols="12"
                md="6"
            >
                <v-text-field
                v-model="settings.kubero.banner.message"
                label="Message"
                required
                readonly
                ></v-text-field>
            </v-col>
        </v-row>

    </div>
</template>


<script lang="ts">
import { defineComponent } from 'vue'

// Types
import { Settings } from './form.vue'

export type Kubero = { 
    readonly: boolean,
    console: {
        enabled: boolean,
    },
    banner: {
        enabled: boolean,
        bgcolor: string,
        fontcolor: string,
        message: string,
    }
}


export default defineComponent({
    name: 'FormGeneral',
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