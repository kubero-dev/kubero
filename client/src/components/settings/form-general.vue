
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


        <v-divider class="ma-5"></v-divider>
        <h4 class="text-uppercase">Github</h4>
        <v-row>
            <v-col
                cols="12"
                md="6"
            >
                <v-text-field
                v-model="settings.env.GITHUB_PERSONAL_ACCESS_TOKEN"
                label="github personal access token"
                required
                readonly
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
                v-model="settings.env.GITEA_BASEURL"
                label="Gitea Base URL"
                required
                readonly
                ></v-text-field>
            </v-col>
            <v-col
                cols="12"
                md="3"
            >
                <v-text-field
                v-model="settings.env.GITEA_PERSONAL_ACCESS_TOKEN"
                label="Gitea Personal Access Token"
                required
                readonly
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
                v-model="settings.env.GOGS_BASEURL"
                label="Gogs Base URL"
                required
                readonly
                ></v-text-field>
            </v-col>
            <v-col
                cols="12"
                md="3"
            >
                <v-text-field
                v-model="settings.env.GOGS_PERSONAL_ACCESS_TOKEN"
                label="Gogs Personal Access Token"
                required
                readonly
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
                v-model="settings.env.GITLAB_BASEURL"
                label="Gitlab Base URL"
                required
                readonly
                ></v-text-field>
            </v-col>
            <v-col
                cols="12"
                md="3"
            >
                <v-text-field
                v-model="settings.env.GITLAB_PERSONAL_ACCESS_TOKEN"
                label="Gitlab Personal Access Token"
                required
                readonly
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
                v-model="settings.env.BITBUCKET_USERNAME"
                label="Bitbucket Username"
                required
                readonly
                ></v-text-field>
            </v-col>
            <v-col
                cols="12"
                md="3"
            >
                <v-text-field
                v-model="settings.env.BITBUCKET_APP_PASSWORD"
                label="Bitbucket App Password"
                required
                readonly
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