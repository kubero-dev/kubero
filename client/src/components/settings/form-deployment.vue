
<template>
    <div>
        <v-row>
            <v-col cols="12" sm="12" md="12" lg="12" xl="12">
                <h2>
                    {{ $t('settings.deployment.title') }}
                </h2>
                <!--
                <p class="text-justify">
                    Define the available pod sizes for the applications.
                </p>
                -->

                <v-alert 
                    type="info"
                    variant="tonal"
                    style="margin-bottom: 20px; margin-top: 20px;"
                    :text="$t('settings.deployment.configAlert')">
                </v-alert>
            </v-col>
        </v-row>

        <v-divider class="ma-5"></v-divider>
        <h4 class="text-uppercase">{{ $t('settings.deployment.webhookEndpoint') }}</h4>
        <v-row>
            <v-col
                cols="12"
                md="8"
            >
                <v-text-field
                v-model="settings.settings.kubero.webhook_url"
                :label="$t('settings.deployment.url')"
                required
                ></v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col
                cols="12"
                md="8"
            >
                <v-text-field
                v-model="settings.secrets.KUBERO_WEBHOOK_SECRET"
                :label="$t('settings.deployment.secret')"
                required
                :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                :type="show ? 'text' : 'password'"
                @click:append="show = !show"
                ></v-text-field>
            </v-col>
        </v-row>
        <v-divider class="ma-5"></v-divider>

        <h4 class="text-uppercase">{{ $t('settings.deployment.github.title') }}</h4>
        <v-row>
            <v-col 
                cols="12"
                md="3"
            >
                <v-text-field
                v-model="settings.secrets.GITHUB_BASEURL"
                :label="$t('settings.deployment.github.baseUrl')" 
                required
                ></v-text-field>  
            </v-col>
            <v-col
                cols="12"
                md="3"
            >
                <v-text-field
                v-model="settings.secrets.GITHUB_PERSONAL_ACCESS_TOKEN"
                :label="$t('settings.deployment.github.personalAccessToken')"
                required
                :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                :type="show ? 'text' : 'password'"
                @click:append="show = !show"
                ></v-text-field>
            </v-col>
            <v-col
                cols="12"
                md="6"
            >{{ $t('settings.deployment.github.instructions') }} <a href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token" target="_blank">Github</a>
            </v-col>
        </v-row>

        <h4 class="text-uppercase">{{ $t('settings.deployment.gitea.title') }}</h4>
        <v-row>
            <v-col
                cols="12"
                md="3"
            >
                <v-text-field
                v-model="settings.secrets.GITEA_BASEURL"
                :label="$t('settings.deployment.gitea.baseUrl')"
                required
                ></v-text-field>
            </v-col>
            <v-col
                cols="12"
                md="3"
            >
                <v-text-field
                v-model="settings.secrets.GITEA_PERSONAL_ACCESS_TOKEN"
                :label="$t('settings.deployment.gitea.personalAccessToken')"
                required
                :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                :type="show ? 'text' : 'password'"
                @click:append="show = !show"
                ></v-text-field>
            </v-col>
            <v-col
                cols="12"
                md="6"
            >{{ $t('settings.deployment.gitea.instructions') }} <a href="https://www.jetbrains.com/help/youtrack/cloud/integration-with-gitea.html#enable-youtrack-integration-gitea" target="_blank">Gitea</a>
            </v-col>
        </v-row>

        <h4 class="text-uppercase">{{ $t('settings.deployment.gogs.title') }}</h4>
        <v-row>
            <v-col
                cols="12"
                md="3"
            >
                <v-text-field
                v-model="settings.secrets.GOGS_BASEURL"
                :label="$t('settings.deployment.gogs.baseUrl')"
                required
                ></v-text-field>
            </v-col>
            <v-col
                cols="12"
                md="3"
            >
                <v-text-field
                v-model="settings.secrets.GOGS_PERSONAL_ACCESS_TOKEN"
                :label="$t('settings.deployment.gogs.personalAccessToken')"
                required
                :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                :type="show ? 'text' : 'password'"
                @click:append="show = !show"
                ></v-text-field>
            </v-col>
        </v-row>

        <h4 class="text-uppercase">{{ $t('settings.deployment.gitlab.title') }}</h4>
        <v-row>
            <v-col
                cols="12"
                md="3"
            >
                <v-text-field
                v-model="settings.secrets.GITLAB_BASEURL"
                :label="$t('settings.deployment.gitlab.baseUrl')"
                required
                ></v-text-field>
            </v-col>
            <v-col
                cols="12"
                md="3"
            >
                <v-text-field
                v-model="settings.secrets.GITLAB_PERSONAL_ACCESS_TOKEN"
                :label="$t('settings.deployment.gitlab.personalAccessToken')"
                required
                :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                :type="show ? 'text' : 'password'"
                @click:append="show = !show"
                ></v-text-field>
            </v-col>
        </v-row>

        <h4 class="text-uppercase">{{ $t('settings.deployment.bitbucket.title') }}</h4>
        <v-row>
            <v-col
                cols="12"
                md="3"
            >
                <v-text-field
                v-model="settings.secrets.BITBUCKET_USERNAME"
                :label="$t('settings.deployment.bitbucket.username')"
                required
                ></v-text-field>
            </v-col>
            <v-col
                cols="12"
                md="3"
            >
                <v-text-field
                v-model="settings.secrets.BITBUCKET_APP_PASSWORD"
                :label="$t('settings.deployment.bitbucket.appPassword')"
                required
                :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                :type="show ? 'text' : 'password'"
                @click:append="show = !show"
                ></v-text-field>
            </v-col>
        </v-row>
    </div>
</template>


<script lang="ts">
import { defineComponent } from 'vue'
import { Secrets } from './form.vue'

interface Settings {
    settings: any,
    secrets: Secrets
}

export default defineComponent({
    name: 'FormDeployment',
    props: {
        settings: {
            type: Object as () => Settings,
            required: true
        },
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
