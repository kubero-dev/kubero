<template>
    <v-container :fluid="true">
        <v-layout>
                <v-row>
                    
                    <v-col>
                        <p class="text-uppercase">Review Apps</p>

                        <Appcard></Appcard>
                        <Appcard></Appcard>
                        <Appcard></Appcard>
                        <Appcard></Appcard>
                    </v-col>


                    <!-- Testing -->
                    <v-col>
                        <p class="text-uppercase">Test</p>

                        <Appcard></Appcard>

                        <v-btn
                        elevation="2"
                        icon
                        large
                        :to="{ name: 'New App', params: { phase: 'test' }}"
                        class="mt-5"
                        >
                            <v-icon dark>
                                mdi-plus
                            </v-icon>
                        </v-btn>
                    </v-col>


                    <!-- Staging -->
                    <v-col>
                        <p class="text-uppercase">Stage</p>

                        <Appcard></Appcard>

                        <v-btn
                        elevation="2"
                        icon
                        large
                        :to="{ name: 'New App', params: { phase: 'stage' }}"
                        class="mt-5"
                        >
                            <v-icon dark>
                                mdi-plus
                            </v-icon>
                        </v-btn>
                    </v-col>

                    <!-- Production -->
                    <v-col>
                        <p class="text-uppercase">Production</p>

                        <Appcard name="App-Prod" domain="www.example.com"></Appcard>

                        <v-btn
                        elevation="2"
                        icon
                        large
                        :to="{ name: 'New App', params: { phase: 'production' }}"
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
import Appcard from "./appcard.vue";

export default {
    sockets: {
    },
    mounted() {
    },
    data: () => ({
    }),
    components: {
        Appcard,
    },
    methods: {
    },
}
</script>

<style lang="scss">
</style>