
<template>
    <div>
    <!--
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
    -->
        <h4 class="text-uppercase">Webhook Endpoint</h4>
        <v-row>
            <v-col
                cols="12"
                md="8"
            >
                <v-text-field
                v-model="settings.webhook.url"
                label="URL"
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
                v-model="settings.webhook.secret"
                label="Secret"
                required
                :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                :type="show ? 'text' : 'password'"
                @click:append="show = !show"
                ></v-text-field>
            </v-col>
        </v-row>
        <v-divider class="ma-5"></v-divider>

        <h4 class="text-uppercase">Github</h4>
        <v-row>
            <v-col
                cols="12"
                md="6"
            >
                <v-text-field
                v-model="settings.repositoryProviders.github.personalAccessToken"
                label="github personal access token"
                required
                :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                :type="show ? 'text' : 'password'"
                @click:append="show = !show"
                ></v-text-field>
            </v-col>
            <v-col
                cols="12"
                md="6"
            >Instructions on how to get a Personal access token from <a href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token" target="_blank">Github</a>
            </v-col>
        </v-row>

        <h4 class="text-uppercase">Gitea</h4>
        <v-row>
            <v-col
                cols="12"
                md="3"
            >
                <v-text-field
                v-model="settings.repositoryProviders.gitea.baseUrl"
                label="Gitea Base URL"
                required
                ></v-text-field>
            </v-col>
            <v-col
                cols="12"
                md="3"
            >
                <v-text-field
                v-model="settings.repositoryProviders.gitea.personalAccessToken"
                label="Gitea Personal Access Token"
                required
                :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                :type="show ? 'text' : 'password'"
                @click:append="show = !show"
                ></v-text-field>
            </v-col>
            <v-col
                cols="12"
                md="6"
            >Instructions on how to get a Personal access token for <a href="https://www.jetbrains.com/help/youtrack/cloud/integration-with-gitea.html#enable-youtrack-integration-gitea" target="_blank">Gitea</a>
            </v-col>
        </v-row>

        <h4 class="text-uppercase">Gogs</h4>
        <v-row>
            <v-col
                cols="12"
                md="3"
            >
                <v-text-field
                v-model="settings.repositoryProviders.gogs.baseUrl"
                label="Gogs Base URL"
                required
                ></v-text-field>
            </v-col>
            <v-col
                cols="12"
                md="3"
            >
                <v-text-field
                v-model="settings.repositoryProviders.gogs.personalAccessToken"
                label="Gogs Personal Access Token"
                required
                :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                :type="show ? 'text' : 'password'"
                @click:append="show = !show"
                ></v-text-field>
            </v-col>
        </v-row>

        <h4 class="text-uppercase">Gitlab</h4>
        <v-row>
            <v-col
                cols="12"
                md="3"
            >
                <v-text-field
                v-model="settings.repositoryProviders.gitlab.baseUrl"
                label="Gitlab Base URL"
                required
                ></v-text-field>
            </v-col>
            <v-col
                cols="12"
                md="3"
            >
                <v-text-field
                v-model="settings.repositoryProviders.gitlab.personalAccessToken"
                label="Gitlab Personal Access Token"
                required
                :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                :type="show ? 'text' : 'password'"
                @click:append="show = !show"
                ></v-text-field>
            </v-col>
        </v-row>

        <h4 class="text-uppercase">Bitbucket</h4>
        <v-row>
            <v-col
                cols="12"
                md="3"
            >
                <v-text-field
                v-model="settings.repositoryProviders.bitbucket.username"
                label="Bitbucket Username"
                required
                ></v-text-field>
            </v-col>
            <v-col
                cols="12"
                md="3"
            >
                <v-text-field
                v-model="settings.repositoryProviders.bitbucket.personalAccessToken"
                label="Bitbucket App Password"
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

export type Settings = {
    env: {
        KUBERO_NAMESPACE : string,
        KUBERO_WEBHOOK_SECRET : string,
        KUBERO_WEBHOOK_URL: string,
        GITEA_BASEURL: string,
        GITEA_PERSONAL_ACCESS_TOKEN: string,
        GOGS_BASEURL: string,
        GOGS_PERSONAL_ACCESS_TOKEN: string,
        GITLAB_BASEURL: string,
        GITLAB_PERSONAL_ACCESS_TOKEN: string,
        BITBUCKET_USERNAME: string,
        BITBUCKET_APP_PASSWORD: string,
        GITHUB_PERSONAL_ACCESS_TOKEN: string,
    }
}

export default defineComponent({
    name: 'FormDeployment',
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