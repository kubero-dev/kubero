<template>
<v-card
    :loading="loadingState"
    class="mt-5 pullrequest"
    outlined
    elevation="0"
    color="cardBackground"
    v-if="deleted === false"
    >
    <template slot="progress">
      <v-progress-linear
        color="primary"
        height="2"
        indeterminate
      ></v-progress-linear>
    </template>

    <v-card-actions>
      <v-list-item class="grow">
        <v-list-item-avatar color="grey darken-3" style="height: 35px; min-width: 35px; width: 35px;">
          <v-img
            class="elevation-6"
            :alt="pullrequest.user.login"
            :src="pullrequest.user.avatar_url"
          ></v-img>
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-subtitle>{{ pullrequest.user.login }}</v-list-item-subtitle>
          <v-list-item-title style="white-space: inherit; min-width: 250px;"><a :href="pullrequest.html_url" target="_blank">{{ pullrequest.title }}</a></v-list-item-title>
          <!--
          <v-list-item-subtitle><v-icon small>mdi-source-pull</v-icon>{{ this.pullrequest.updated_at }}</v-list-item-subtitle>
          <v-list-item-subtitle><v-icon small>mdi-source-commit-start</v-icon>{{ this.pullrequest.created_at }}</v-list-item-subtitle>
          -->
        </v-list-item-content>

        
        <v-list-item-action>
            <v-btn
                title="Start Review App"
                depressed
                color="primary lighten-2"
                @click="startReviewApp()"
                v-if="!pullrequest.locked"
            >
                <v-icon
                    color="white"
                    >mdi-play-box-outline
                </v-icon>
            </v-btn>
            <v-btn
                title="Start Review App"
                depressed
                color="primary lighten-2"
                disabled
                v-if="pullrequest.locked"
            >
                <v-icon
                    color="white"
                    >mdi-play-box-lock-outline
                </v-icon>
            </v-btn>
        </v-list-item-action>
      </v-list-item>
    </v-card-actions>
    <v-card-subtitle class="pr-data">
        <v-row>
            <v-col>
                <v-chip label class="mr-1"><span v-if="pullrequest.autodeploy">Autodeploy | </span>{{ pullrequest.branch }}</v-chip>
            </v-col>
            <v-col>
                <v-icon small>mdi-source-commit-start</v-icon> {{ formatDate(pullrequest.created_at) }}<br>
                <v-icon small>mdi-source-pull</v-icon> {{ formatDate(pullrequest.updated_at)}}
            </v-col>
    </v-row>
    </v-card-subtitle>
</v-card>
</template>


<script lang="ts">
 import axios from "axios";

 import { defineComponent } from 'vue'

export default defineComponent({
    props: {
        pipeline: {
            type: String,
            default: "MISSSING"
        },
        pullrequest: {
            type: Object,
            default: () => ({}),
        }
    },
    data: () => ({
        deleted: false,
        loadingState: false,
    }),
    methods: {
        async startReviewApp() {
            console.log("startReviewApp", this.pullrequest.number);
            this.loadingState = true;

            axios.post("/api/repo/pullrequest/start", {
                branch: this.pullrequest.branch,
                title: this.pullrequest.title,
                ssh_url: this.pullrequest.ssh_url,
                pipelineName: this.pipeline,
            }).then((response) => {
                console.log("startReviewApp", response);
            }).catch((error) => {
                console.log("startReviewApp", error);
            });
        },
        formatDate(date: string) {
            return new Date(date).toLocaleString();
        }
    },
})
</script>

<style>
.pr-data {
    font-size: 0.775rem;
    color: #747474;
    padding-top: 0px;
}
.v-btn.v-size--default {
    font-size: 0.675rem;
}

.mr-1.v-chip.v-size--default {
    font-size: 12px;
    height: 28px;
}

.v-application .text-subtitle-1 {
    font-size: 0.825rem !important;
}

.v-application .v-card__title {
    font-size: 1.1rem;
}

.pullrequest {
    outline: dashed 1.3px #747474;
}
</style>