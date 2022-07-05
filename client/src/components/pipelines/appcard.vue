<template>
<v-card
    :loading="loadingState"
    class="mt-5"
    outlined
    elevation="2"
    color="#fafafa"
    >

    <template slot="progress">
      <v-progress-linear
        color="primary"
        height="2"
        indeterminate
      ></v-progress-linear>
    </template>

    <v-card-title><a :href="'/#/pipeline/'+pipeline+'/'+phase+'/'+app">{{ this.app }}</a></v-card-title>

    <v-card-text>
        <v-row
            class="mx-0"
        >
            <v-icon left small>mdi-github</v-icon>

            <div class="grey--text text-subtitle-1">
                {{ this.gitrepo.ssh_url }}
            </div>
        </v-row>
        <p></p>
        <v-chip label class="mr-1"><span v-if="this.autodeploy">Autodeploy | </span>{{ this.branch }}</v-chip>
        <v-chip label class="mr-1">{{ this.commithash }}</v-chip>

    </v-card-text>

    <v-divider></v-divider>

    <v-card-actions class="ml-2">
        <v-btn
            v-if="this.domain"
            color="deep-purple lighten-2"
            text
            @click="restartApp()"
        >
            <v-icon
                >mdi-reload-alert
            </v-icon>
        </v-btn>
        <v-btn
            color="deep-purple lighten-2"
            text
            :href="'/#/pipeline/'+pipeline+'/'+phase+'/'+app+'/logs'"
        >
            <v-icon
                >mdi-console
            </v-icon>
        </v-btn>
        <v-btn
            v-if="this.domain"
            color="deep-purple lighten-2"
            text
            :href="'https:/'+domain" target="_blank"
        >
            <v-icon
                >mdi-open-in-new
            </v-icon>
        </v-btn>
    </v-card-actions>
</v-card>
</template>

<script>
import axios from "axios";
export default {
    props: {
      pipeline: {
        type: String,
        default: "pipelineName"
      },
      phase: {
        type: String,
        default: "phaseName"
      },
      app: {
        type: String,
        default: "AppName"
      },
      gitrepo: {
        type: Object,
        default: () => ({}),
        /*
        default: {
          repository: {
            ssh_url: ""
          },
          webhook: {
            url: ""
          }
        }
        */
      },
      branch: {
        type: String,
        default: "master"
      },
      commithash: {
        type: String,
        default: "c142824f"
      },
      domain: {
        type: String,
      },
      autodeploy: {
        type: Boolean,
        default: false
      }
    },
    data: () => ({
      loadingState: false,
    }),
    methods: {
        restartApp() {
            axios.get(`/api/pipelines/${this.pipeline}/${this.phase}/${this.app}/restart`)
            .then(response => {
                console.log(response);
                this.loadingState = true;
            })
            .catch(error => {
                console.log(error);
            });
        }
    }
}
</script>

<style>
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
</style>