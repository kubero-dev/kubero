<template>
    <div>
    <v-container>
        <Breadcrumbs :items="breadcrumbItems"></Breadcrumbs>
    </v-container>
    <v-container :fluid="true">
        <h1>{{ pipeline }}</h1>
        <v-layout>
                <v-row>
                    <v-col v-for="phase in activePhases" :key="phase.name">
                        <p><span class="text-uppercase">{{phase.name}}</span><br /><span class="caption">[{{phase.context}}]</span></p>


                        <Appcard v-for="app in phase.apps" :key="app.name"
                            :pipeline="pipeline"
                            :phase="phase.name"
                            :app="app" />

                        <span v-if="phase.name == 'review'">
                            <PRcard v-for="pr in pullrequests" :key="pr.number"
                                :pipeline="pipeline"
                                :pullrequest="pr" />
                        </span>

                        <v-btn
                        elevation="2"
                        icon="mdi-plus"
                        :to="{ name: 'App Form', params: { phase: phase.name }}"
                        class="mt-5 navBG"
                        color="secondary"
                        style="margin-bottom: 5px;"
                        >
                        </v-btn>
                    </v-col>

                </v-row>
        </v-layout>
    </v-container>
    </div>
</template>

<script lang="ts">
import axios from "axios";
import Appcard from "./appcard.vue";
import PRcard from "./prcard.vue";
import Breadcrumbs from "../breadcrumbs.vue";

import { defineComponent } from 'vue'

type Phase = {
    name: string,
    context: string,
    enabled: boolean,
    apps: Array<App>,
}

type App = {
    name: string,
    enabled: boolean,
    autodeploy: boolean,
}

type Git = {
    ssh_url: string,
    provider: string,
}

type Pullrequest = {
    number: number,
    branch: string,
    title: string,
    ssh_url: string,
    created_at: string,
    updated_at: string,
}


export default defineComponent({
    sockets: {
        async updatedApps(instances: Array<App>) {
            console.log("updatedApps", instances);
            this.loadPipeline();
        },
        async deleteApp(instances: Array<App>) {
            console.log("deleteApp", instances);
            this.loadPipeline();
        },
    },
    mounted() {
        this.loadPipeline();
    },
    props: {
      pipeline: {
        type: String,
        default: "MISSING"
      },
    },
    data () {return {
        breadcrumbItems: [
            {
                text: 'DASHBOARD',
                disabled: false,
                to: { name: 'Pipelines', params: {}}
            },
            {
                text: 'PIPELINE:'+this.pipeline,
                disabled: true,
                to: { name: 'Pipeline Apps', params: { pipeline: this.pipeline }}
            }
        ],
        reviewapps: false,
        phases: [] as Array<Phase>,
        git: {
            ssh_url: "",
            provider: ""
        },
        pullrequests: [] as Array<Pullrequest>,
    }},
    computed: {
        activePhases() {
            let phases = [] as Array<Phase>;
            if (this.phases) {
                this.phases.forEach((phase: Phase) => {
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
        Breadcrumbs,
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

        if (this.git.provider == "") {
            return;
        }

        const gitrepoB64 = btoa(this.git.ssh_url);

        axios.get('/api/repo/'+this.git.provider+'/' + gitrepoB64 + '/pullrequests')
        .then(response => {

            self.pullrequests = [] as Array<Pullrequest>;

            // iterate over response.data and search in self.phases[0].name for a match
            // if not found, add the pullrequest to the phase.apps array
            response.data.forEach((pr: Pullrequest) => {
                let found = false;
                self.phases[0].apps.forEach((app: App) => {
                    if (app.name == pr.branch) {
                        found = true;
                    }
                });
                if (!found) {
                    self.pullrequests.push(pr);
                }
            });

            //self.pullrequests = response.data;
            return response.data;
        })
        .catch(error => {
            console.log(error);
        });
      },
    },
})
</script>