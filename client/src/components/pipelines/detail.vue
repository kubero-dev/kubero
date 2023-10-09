<template>
    <div>
    <v-container>
        <breadcrumbs :items="breadcrumbItems"></breadcrumbs>
    </v-container>
    <v-container :fluid="true">
        <h1>{{ this.pipeline }}</h1>
        <v-layout>
                <v-row>
                    <v-col v-for="phase in activePhases" :key="phase.name">
                        <p><span class="text-uppercase">{{phase.name}}</span><br /><span class="caption">[{{phase.context}}]</span></p>


                        <Appcard v-for="app in phase.apps" :key="app.name"
                            :pipeline="pipeline"
                            :phase="phase.name"
                            :app="app" />

                        <div v-if="phase.name == 'review'">
                            <PRcard v-for="pr in pullrequests" :key="pr.number"
                                :pullrequest="pr" />
                        </div>

                        <v-btn
                        elevation="2"
                        icon
                        large
                        :to="{ name: 'New App', params: { phase: phase.name }}"
                        class="mt-5 navBG"
                        >
                            <v-icon>
                                mdi-plus
                            </v-icon>
                        </v-btn>
                    </v-col>

                </v-row>
        </v-layout>
    </v-container>
    </div>
</template>

<script>
import axios from "axios";
import Appcard from "./appcard.vue";
import PRcard from "./prcard.vue";

export default {
    mounted() {
        this.loadPipeline();
    },
    props: {
      pipeline: {
        type: String,
        default: "MISSSING"
      },
    },
    data () {return {
        breadcrumbItems: [
            {
                text: 'DASHBOARD',
                disabled: false,
                href: '#/',
            },
            {
                text: 'PIPELINE:'+this.pipeline,
                disabled: true,
                href: '#/pipeline/'+this.pipeline+'/apps',
            }
        ],
        reviewapps: false,
        phases: false,
        git: {
            ssh_url: "",
            provider: ""
        },
        pullrequests: [],
    }},
    computed: {
        activePhases() {
            let phases = [];
            if (this.phases) {
                this.phases.forEach(phase => {
                    if (phase.enabled) {
                        phases.push(phase);
                    }
                });
            }
            return phases;
        }
    },
    components: {
        PRcard,
        Appcard,
        breadcrumbs: () => import('../breadcrumbs.vue'),
    },
    methods: {
      async loadPipeline() {
        const self = this;
        axios.get('/api/pipelines/' + this.pipeline + '/apps')
        .then(response => {
            self.phases = response.data.phases;
            self.reviewapps = response.data.reviewapps;
            self.git.ssh_url = response.data.git.repository.ssh_url;
            self.git.provider = response.data.git.provider;
            if (self.reviewapps) {
                self.loadPullrequests();
            }
            return response.data.phases;
        })
        .catch(error => {
            console.log(error);
        });
      },
      async loadPullrequests() {
        const self = this;

        const gitrepoB64 = btoa(this.git.ssh_url);

        axios.get('/api/repo/'+this.git.provider+'/' + gitrepoB64 + '/pullrequests')
        .then(response => {
            self.pullrequests = response.data;
            return response.data;
        })
        .catch(error => {
            console.log(error);
        });
      },
    },
}
</script>