<template>
  <v-main>
    <router-view />
  </v-main>
</template>

<script lang="ts">
import axios from "axios";
import { defineComponent } from 'vue'
import { useKuberoStore } from '../../stores/kubero'
import { mapWritableState } from 'pinia'

export default defineComponent({
    name: 'DefaultView',
    created() {
        this.checkSession()
    },
    updated() {
        this.checkSession();
    },
    computed: {
        ...mapWritableState(useKuberoStore, [
            'kubero',
        ]),
    },
    data: () => ({
        session: false,
        isAuthenticated: false,
        templatesEnabled: true,
        version: "dev",
        kubernetesVersion: "unknown",
    }),
    methods: {
        checkSession() {
            if (this.$route.name != 'Login') {
                axios
                    .get("/api/session")
                    .then((result) => {
                        console.log("isAuthenticated: " + result.data.isAuthenticated);

                        // safe version to vuetufy gloabl scope for use in components
                        this.kubero.templatesEnabled = result.data.templatesEnabled;
                        this.kubero.version = result.data.version;
                        this.kubero.kubernetesVersion = result.data.kubernetesVersion;
                        this.kubero.isAuthenticated = result.data.isAuthenticated;
                        this.kubero.buildPipeline = result.data.buildPipeline;

                    })
                    .catch((err) => {
                        if (err.response.status === 401) {
                            this.isAuthenticated = false;
                            this.$router.push('/login')
                        } else {
                            console.log(err);
                        }
                    });
            }
        },
    },
})
</script>
