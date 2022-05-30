<template>
    <v-container :fluid="true">
        <v-layout row wrap>
            <v-flex xs12 md12>

                <v-row>
                    <v-col cols="6" sm="6" md="6" lg="6" xl="6">
                        Pipelines
                    </v-col>
                    <v-col cols="6" sm="6" md="6" lg="6" xl="6">
                        <v-btn
                        elevation="2"
                        :to="{ name: 'New Pipeline'}"
                        >New Pipeline</v-btn>
                    </v-col>
                </v-row>

                <v-row v-for="item in apps" :key="item.spec.appName">
                    <v-col cols="12" sm="3" md="3" lg="3" xl="3">
                        <a :href="'/#/pipeline/details/'+item.spec.appName">{{ item.spec.appName }}</a>
                    </v-col>
                    <v-col cols="12" sm="3" md="3" lg="3" xl="3">
                        {{ item.spec.gitrepo }}
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
                        @click="deleteApp(item.spec.appName)"
                        >
                            <v-icon dark>
                                mdi-delete
                            </v-icon>
                        </v-btn>
                    </v-col>
                </v-row>

            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
import axios from "axios";
export default {
    sockets: {
        async updatedApps(instances) {
            console.log("updatedApps", instances);
            let _apps = await this.loadAppsList();
            this.apps = _apps;
        },
    },
    mounted() {
        this.loadAppsList();
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
      async loadAppsList() {
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
      deleteApp(app) {
        axios.delete(`/api/pipelines/${app}`)
        .then(response => {
            console.log(response);
            this.loadAppsList();
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