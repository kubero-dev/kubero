<template>
    <v-container :fluid="true">
        <v-layout row wrap>
            <v-flex xs12 md12>

                <v-row>
                    <v-col cols="6" sm="6" md="6" lg="6" xl="6">
                        Show a List of Apps
                    </v-col>
                    <v-col cols="6" sm="6" md="6" lg="6" xl="6">
                        <v-btn
                        elevation="2"
                        :to="{ name: 'New app'}"
                        >New App</v-btn>
                    </v-col>
                </v-row>

                <v-row v-for="item in appsList.items" v-bind:key="item.spec.appName">
                    <v-col cols="12" sm="3" md="3" lg="3" xl="3">
                        {{ item.spec.appName }}
                    </v-col>
                    <v-col cols="12" sm="3" md="3" lg="3" xl="3">
                        {{ item.spec.gitrepo }}
                    </v-col>
                    <v-col cols="12" sm="3" md="3" lg="3" xl="3">
                        {{ item.spec.reviewapps }}
                    </v-col>
                    <v-col cols="12" sm="3" md="3" lg="3" xl="3">
                        <v-btn
                        elevation="2"
                        fab
                        x-small
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
        updatedApps(instances) {
            console.log("updatedApps", instances);
        },
    },
    mounted() {
        this.loadAppsList();
    },
    data: () => ({
        appsList: {
            items: [],
        },
    }),
    components: {
    },
    methods: {
      loadAppsList() {
        axios.get(`/api/apps`)
        .then(response => {
            console.log(response);
            this.appsList = response.data;
        })
        .catch(error => {
            console.log(error);
        });
      }
    },
}
</script>

<style lang="scss">
</style>