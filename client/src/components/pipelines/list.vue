<template>
    <v-container>

                <v-row class="justify-space-between">
                    <v-col cols="6" sm="6" md="6" lg="6" xl="6">
                        Pipelines
                    </v-col>
                    <v-spacer />
                    <v-col>
                        <v-btn
                        elevation="2"
                        :to="{ name: 'New Pipeline'}"
                        >New Pipeline</v-btn>
                    </v-col>
                </v-row>

                <v-row v-for="item in apps" :key="item.spec.appName">
                    <v-col cols="12" sm="3" md="3" lg="3" xl="3">
                        <a :href="'/#/pipeline/'+item.spec.name+'/apps'">{{ item.spec.name }}</a>
                    </v-col>
                    <v-col cols="12" sm="3" md="3" lg="3" xl="3">
                        {{ item.spec.reviewapps }}
                    </v-col>

                    <!-- Actions -->
                    <v-col cols="12" sm="3" md="3" lg="3" xl="3">
                        <v-btn
                        elevation="2"
                        fab
                        x-small
                        @click="deletePipeline(item.spec.name)"
                        >
                            <v-icon dark>
                                mdi-delete
                            </v-icon>
                        </v-btn>
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
        /*
        appsList: {
            items: [],
        },
        */
    }),
    components: {
    },
    methods: {
      async loadPipelinesList() {
        const self = this;
        axios.get(`/api/pipelines`)
        .then(response => {
            console.log(response);
            //self.appsList = response.data;
            self.apps = response.data.items;
            return response.data.items;
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
</style>