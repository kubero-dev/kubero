
<template>
    <div>
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



        <v-divider class="ma-5"></v-divider>
        <h4 class="text-uppercase">Webhooks</h4>
        <v-row>
            <v-col
                cols="12"
                md="6"
            >
                <v-text-field
                v-model="settings.env.KUBERO_WEBHOOK_SECRET"
                label="Webhook Secret"
                required
                readonly
                :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                :type="show ? 'text' : 'password'"
                @click:append="show = !show"
                ></v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col
                cols="12"
                md="6"
            >
                <v-text-field
                v-model="settings.env.KUBERO_WEBHOOK_URL"
                label="Webhook URL"
                required
                readonly
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