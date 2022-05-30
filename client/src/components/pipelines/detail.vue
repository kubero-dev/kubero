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

                        <v-btn
                        elevation="2"
                        icon
                        large
                        :to="{ name: 'New App'}"
                        class="mt-5"
                        >
                            <v-icon dark>
                                mdi-plus
                            </v-icon>
                        </v-btn>
                    </v-col>


                    <!-- Testing -->
                    <v-col>
                        <p class="text-uppercase">Testing</p>

                        <Appcard></Appcard>

                        <v-btn
                        elevation="2"
                        icon
                        large
                        :to="{ name: 'New App'}"
                        class="mt-5"
                        >
                            <v-icon dark>
                                mdi-plus
                            </v-icon>
                        </v-btn>
                    </v-col>


                    <!-- Staging -->
                    <v-col>
                        <p class="text-uppercase">Stageing</p>

                        <Appcard></Appcard>

                        <v-btn
                        elevation="2"
                        icon
                        large
                        :to="{ name: 'New App'}"
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

                        <Appcard></Appcard>

                        <v-btn
                        elevation="2"
                        icon
                        large
                        :to="{ name: 'New App'}"
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