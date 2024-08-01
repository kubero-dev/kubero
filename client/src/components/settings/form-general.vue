
<template>
    <div style="margin-left: 10px">
        <v-row>
            <v-col cols="12" sm="12" md="12" lg="12" xl="12">
                <h2>
                    General Kubero Settings
                </h2>
                <p class="text-justify">
                    Some of the configuration values require a browser refresh(*) or pod restart(**) to take effect.
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
                disabled
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
                label="Readonly Mode (**)"
                required
                color="primary"
            ></v-switch>
            </v-col>
            <v-col
            cols="12"
            md="6"
            >
            <v-switch
                v-model="settings.kubero.config.kubero.admin.disabled"
                label="Admin disabled"
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
                label="Enabled (*)"
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

        <v-divider class="ma-5"></v-divider>
        <h4 class="text-uppercase">Authentication</h4>

        <v-row>
            <v-col
                cols="12"
                md="2"
            >
                <v-switch
                v-model="settings.kubero.auth.github.enabled"
                label="Github"
                color="primary"
                density="compact"
                required
                ></v-switch>
            </v-col>
            <v-col
                cols="12"
                md="3"
                v-if="settings.kubero.auth.github.enabled"
            >
                <v-text-field
                v-model="settings.kubero.auth.github.id"
                label="ID"
                density="compact"
                required
                ></v-text-field>
            </v-col>
            <v-col
                cols="12"
                md="3"
                v-if="settings.kubero.auth.github.enabled"
            >
                <v-text-field
                v-model="settings.kubero.auth.github.org"
                label="Organization"
                density="compact"
                required
                ></v-text-field>
            </v-col>
        </v-row>
        <v-row v-if="settings.kubero.auth.github.enabled">
            <v-col
                cols="12"
                md="8"
            >
                <v-text-field
                v-model="settings.kubero.auth.github.callbackUrl"
                label="Callback URL"
                density="compact"
                required
                ></v-text-field>
            </v-col>
        </v-row>
        <v-row v-if="settings.kubero.auth.github.enabled">
            <v-col
                cols="12"
                md="8"
                v-if="settings.kubero.auth.github.enabled"
            >
                <v-text-field
                v-model="secrets.GITHUB_CLIENT_SECRET"
                label="Secret"
                density="compact"
                required
                ></v-text-field>
            </v-col>
        </v-row>

        <v-row>
            <v-col
                cols="12"
                md="2"
            >
                <v-switch
                v-model="settings.kubero.auth.oauth2.enabled"
                label="Oauth2"
                color="primary"
                density="compact"
                required
                ></v-switch>
            </v-col>
            <v-col
                cols="12"
                md="3"
                v-if="settings.kubero.auth.oauth2.enabled"
            >
                <v-text-field
                v-model="settings.kubero.auth.oauth2.name"
                label="Name"
                density="compact"
                required
                ></v-text-field>
            </v-col>
            <v-col
                cols="12"
                md="3"
                v-if="settings.kubero.auth.oauth2.enabled"
            >
                <v-text-field
                v-model="settings.kubero.auth.oauth2.id"
                label="ID"
                density="compact"
                required
                ></v-text-field>
            </v-col>
        </v-row>
        <v-row v-if="settings.kubero.auth.oauth2.enabled">
            <v-col
                cols="12"
                md="8"
            >
                <v-text-field
                v-model="settings.kubero.auth.oauth2.authUrl"
                label="Auth URL"
                density="compact"
                required
                ></v-text-field>
            </v-col>
        </v-row>
        <v-row v-if="settings.kubero.auth.oauth2.enabled">
            <v-col
                cols="12"
                md="8"
            >
                <v-text-field
                v-model="settings.kubero.auth.oauth2.tokenUrl"
                label="Token URL"
                density="compact"
                required
                ></v-text-field>
            </v-col>
        </v-row>
        <v-row v-if="settings.kubero.auth.oauth2.enabled">
            <v-col
                cols="12"
                md="8"
            >
                <v-text-field
                v-model="settings.kubero.auth.oauth2.callbackUrl"
                label="Callback URL"
                density="compact"
                required
                ></v-text-field>
            </v-col>
        </v-row>
        <v-row v-if="settings.kubero.auth.oauth2.enabled">
            <v-col
                cols="12"
                md="8"
            >
                <v-text-field
                v-model="settings.kubero.auth.oauth2.scopes"
                label="Scopes"
                density="compact"
                required
                ></v-text-field>
            </v-col>
        </v-row>
        <v-row v-if="settings.kubero.auth.oauth2.enabled">
            <v-col
                cols="12"
                md="8"
            >
                <v-text-field
                v-model="secrets.OAUTH2_CLIENT_SECRET"
                label="Secret"
                density="compact"
                required
                ></v-text-field>
            </v-col>
        </v-row>


        <v-divider class="ma-5"></v-divider>
        <h4 class="text-uppercase">Audit Logs</h4>

        <v-row>
            <v-col
                cols="12"
                md="2"
            >
                <v-switch
                v-model="settings.kubero.auditLogs.enabled"
                label="Enabled (**)"
                color="primary"
                required
                ></v-switch>
            </v-col>
        </v-row>
        <v-row v-if="settings.kubero.auditLogs.enabled">
            <v-col
                cols="12"
                md="4"
                v-if="settings.kubero.auditLogs.enabled"
            >
                <v-select
                  v-model="settings.kubero.auditLogs.storageClassName"
                  :items="storageclasses"
                  label="Storage Class"
                ></v-select>
            </v-col>
            <v-col
                cols="12"
                md="4"
            >
                <v-text-field
                v-model="settings.kubero.auditLogs.limit"
                label="Limit"
                required
                ></v-text-field>
            </v-col>
            <v-col
                cols="12"
                md="4"
            >
                <v-text-field
                v-model="settings.kubero.auditLogs.size"
                label="Size"
                required
                ></v-text-field>
            </v-col>
        </v-row>

    </div>
</template>


<script lang="ts">
import axios from 'axios'
import { defineComponent } from 'vue'
import { Secrets } from './form.vue'

export default defineComponent({
    name: 'FormGeneral',
    props: {
        settings: {
            type: Object as () => any,
            required: true
        },
        secrets: {
            type: Object as () => Secrets,
            required: true
        }
    },
    mounted() {
        this.loadStorageClasses();
    },
    components: {
    },
    data() {
        return {
            show: false,
            storageclasses : [
                /*
                'standard',
                'standard-fast',
                */
            ] as string[],
        }
    },
    methods: {
      loadStorageClasses() {
        axios.get('/api/config/storageclasses').then(response => {
          for (let i = 0; i < response.data.length; i++) {
            this.storageclasses.push(response.data[i].name);
          }
        });
      },
    }
})

</script>