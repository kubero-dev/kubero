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

            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
export default {
    sockets: {
        updatedApps(instances) {
            console.log("updatedApps", instances);
        },
    },
    mounted() {
    },
    data: () => ({
    }),
    components: {
    },
    methods: {
    },
}
</script>

<style lang="scss">
</style>