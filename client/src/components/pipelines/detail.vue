<template>
    <v-container :fluid="true">
        <h1>{{ this.pipeline }}</h1>
        <v-layout>
                <v-row>
                    
                    <v-col v-if="this.reviewapps">
                        <p class="text-uppercase">Review Apps</p>

                        <Appcard></Appcard>
                        <Appcard></Appcard>
                        <Appcard></Appcard>
                        <Appcard></Appcard>
                    </v-col>


                    <!-- Testing -->
                    <v-col v-for="phase in activePhases" :key="phase.name">
                        <p class="text-uppercase">{{phase.name}}</p>

                        <Appcard v-for="app in phase.apps" :key="app.name" 
                            :name="app.name" 
                            :domain="app.domain" 
                            :gitrepo="app.gitrepo"
                            :branch="app.branch"
                            :commithash="app.branch"
                            :autodeploy="app.autodeploy"/>

                        <v-btn
                        elevation="2"
                        icon
                        large
                        :to="{ name: 'New App', params: { phase: phase.name }}"
                        class="mt-5"
                        >
                            <v-icon dark>
                                mdi-plus
                            </v-icon>
                        </v-btn>
                    </v-col>

                </v-row>
        </v-layout>
    </v-container>
</template>

<script>
import axios from "axios";
import Appcard from "./appcard.vue";

export default {
    sockets: {
    },
    mounted() {
        this.loadPipeline();
    },
    props: {
      pipeline: {
        type: String,
        default: "MISSSING"
      },
    },
    data: () => ({
        reviewapps: false,
        phases: false,
    }),
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
        Appcard,
    },
    methods: {
      async loadPipeline() {
        const self = this;
        axios.get('/api/pipelines/' + this.pipeline + '/apps')
        .then(response => {
            console.log(response);
            self.phases = response.data.phases;
            self.reviewapps = response.data.reviewapps;
            return response.data.phases;
        })
        .catch(error => {
            console.log(error);
        });
      },
    },
}
</script>

<style lang="scss">
</style>