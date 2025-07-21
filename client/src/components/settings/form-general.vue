
<template>
    <div style="margin-left: 10px">
        <v-row>
            <v-col cols="12" sm="12" md="12" lg="12" xl="12">
                <h2>
                    {{ $t('settings.general.title') }}
                </h2>
                <p class="text-justify">
                    {{ $t('settings.general.description') }}
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
                :label="$t('settings.general.namespace')"
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
                :label="$t('settings.general.readonlyMode')"
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
                :label="$t('settings.general.adminDisabled')"
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
                :label="$t('settings.general.ttyConsoleEnabled')"
                required
                color="primary"
            ></v-switch>
            </v-col>
        </v-row>

        <v-divider class="ma-5"></v-divider>
        <h4 class="text-uppercase">{{ $t('settings.general.banner.title') }}</h4>

        <v-row>
            <v-col
                cols="12"
                md="2"
            >
                <v-switch
                v-model="settings.kubero.config.kubero.banner.show"
                :label="$t('settings.general.banner.enabled')"
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
                :label="$t('settings.general.banner.backgroundColor')"
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
                :label="$t('settings.general.banner.fontColor')"
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
                :label="$t('settings.general.banner.message')"
                required
                ></v-text-field>
            </v-col>
        </v-row>

        <v-divider class="ma-5"></v-divider>
        <h4 class="text-uppercase">{{ $t('settings.general.authentication.title') }}</h4>

        <v-row>
            <v-col
                cols="12"
                md="2"
            >
                <v-switch
                v-model="settings.kubero.auth.github.enabled"
                :label="$t('settings.general.authentication.github.enabled')"
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
                :label="$t('settings.general.authentication.github.id')"
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
                :label="$t('settings.general.authentication.github.organization')"
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
                :label="$t('settings.general.authentication.github.callbackUrl')"
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
                :label="$t('settings.general.authentication.github.secret')"
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
                :label="$t('settings.general.authentication.oauth2.enabled')"
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
                :label="$t('settings.general.authentication.oauth2.name')"
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
                :label="$t('settings.general.authentication.oauth2.id')"
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
                :label="$t('settings.general.authentication.oauth2.authUrl')"
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
                :label="$t('settings.general.authentication.oauth2.tokenUrl')"
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
                :label="$t('settings.general.authentication.oauth2.callbackUrl')"
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
                :label="$t('settings.general.authentication.oauth2.scopes')"
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
                :label="$t('settings.general.authentication.oauth2.secret')"
                density="compact"
                required
                ></v-text-field>
            </v-col>
        </v-row>


        <v-divider class="ma-5"></v-divider>
        <h4 class="text-uppercase">{{ $t('settings.general.auditLogs.title') }}</h4>

        <v-row>
            <v-col
                cols="12"
                md="2"
            >
                <v-switch
                v-model="settings.kubero.auditLogs.enabled"
                :label="$t('settings.general.auditLogs.enabled')"
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
                  :label="$t('settings.general.auditLogs.storageClass')"
                ></v-select>
            </v-col>
            <v-col
                cols="12"
                md="4"
            >
                <v-text-field
                v-model="settings.kubero.auditLogs.limit"
                :label="$t('settings.general.auditLogs.limit')"
                required
                ></v-text-field>
            </v-col>
            <v-col
                cols="12"
                md="4"
            >
                <v-text-field
                v-model="settings.kubero.auditLogs.size"
                :label="$t('settings.general.auditLogs.size')"
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
        axios.get('/api/kubernetes/storageclasses').then(response => {
          for (let i = 0; i < response.data.length; i++) {
            this.storageclasses.push(response.data[i].name);
          }
        });
      },
    }
})

</script>