<template>
    <v-container>

        <v-row class="justify-space-between">
            <v-col cols="6" sm="6" md="6" lg="6" xl="6">
                <h1>Addons</h1>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12" sm="12" md="4"
            v-for="addon in addons" :key="addon.id">
                <v-card :disabled="!addon.enabled">
                    <v-list-item-content class="justify-center">
                        <v-avatar
                            size="57"
                            rounded
                            ><img
                            :src="'/img/addons/'+addon.icon"
                            :alt="addon.name"
                            ></v-avatar>
                        <v-card-title>{{ addon.name }}</v-card-title>
                        <v-card-subtitle>{{ addon.version }}</v-card-subtitle>
                        <v-card-text>
                            Operator: {{ addon.operator }}
                        </v-card-text>

                    </v-list-item-content>
                </v-card>
            </v-col>
        </v-row>

    </v-container>
</template>

<script>
import axios from "axios";
export default {
    sockets: {
    },
    mounted() {
        this.loadAddonsList();
    },
    data: () => ({
        addons: [],
    }),
    components: {
    },
    methods: {
        loadAddonsList() {
            const self = this;
            axios.get(`/api/addons`)
            .then(response => {
                console.log(response);
                self.addons = response.data;
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