<template>
    <v-container>

                <v-row class="justify-space-between">
                    <v-col cols="6" sm="6" md="6" lg="6" xl="6">
                        <h1>Pipelines</h1>
                    </v-col>
                    <v-spacer />
                    <v-col class="text-right">
                        <v-btn 
                        elevation="2"
                        color="primary"
                        :to="{ name: 'New Pipeline'}"
                        >New Pipeline</v-btn>
                    </v-col>
                </v-row>

                <v-row v-for="item in apps" :key="item.name">
                    <v-col cols="12">
                        <v-card elevation="2" outlined color="#fafafa">
                            
                            <v-card-text>
                                <v-row>
                                    <v-col cols="12" sm="12" md="6">
                                        <a :href="'/#/pipeline/'+item.name+'/apps'">
                                            <v-card-title>
                                                <v-icon left>mdi-{{ item.deploymentstrategy}}</v-icon>
                                                <span class="text-h5">{{ item.name }}</span>
                                            </v-card-title>
                                            <v-card-text>
                                                <span>{{ item.repository.repository.description }}</span>
                                            </v-card-text>
                                        </a>
                                    </v-col>
                                    <v-col cols="12" sm="12" md="5" style="padding: 26px;">
                                            <v-chip
                                                v-for="phase in item.phases" :key="phase.name"
                                                small
                                                label
                                                class="ma-1"
                                                :color="phase.enabled ? 'green' : ''"
                                                :text-color="phase.enabled  ? 'white' : ''"
                                                >
                                                <v-icon left color="white" v-if="phase.name.includes('review')">
                                                    mdi-eye-refresh-outline
                                                </v-icon>
                                                {{ phase.name }}
                                            </v-chip>
                                    </v-col>

                                    <v-col cols="12" sm="12" md="1">
                                        <v-btn
                                        elevation="2"
                                        fab
                                        @click="deletePipeline(item.name)"
                                        >
                                            <v-icon dark>
                                                mdi-delete
                                            </v-icon>
                                        </v-btn>
                                    </v-col>

                                </v-row>
                            </v-card-text>

                        </v-card>
                    </v-col>
                </v-row>
    </v-container>
</template>

<script>
import axios from "axios";
export default {
    sockets: {
        async updatedPipelines(instances) {
            console.log("updatedPipelines", instances);
            let _apps = await this.loadPipelinesList();
            this.apps = _apps;
        },
    },
    mounted() {
        this.loadPipelinesList();
    },
    data: () => ({
        apps: [],
    }),
    methods: {
      async loadPipelinesList() {
        const self = this;
        axios.get(`/api/pipelines`)
        .then(response => {
            self.apps = response.data.items;
        })
        .catch(error => {
            console.log(error);
        });
      },
      deletePipeline(app) {
        axios.delete(`/api/pipelines/${app}`)
        .then(response => {
            console.log(response);
            this.loadPipelinesList();
        })
        .catch(error => {
            console.log(error);
        });
      },
    },
}
</script>

<style lang="scss">
.v-card a{
    text-decoration: none;
    color: #8560A9 !important;
}
</style>