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
                        this.kubero.adminDisabled = result.data.adminDisabled;
                        this.kubero.buildPipeline = result.data.buildPipeline;
                        this.kubero.auditEnabled = result.data.auditEnabled;
                        this.kubero.consoleEnabled = result.data.consoleEnabled;
                        this.kubero.metricsEnabled = result.data.metricsEnabled;

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

<style>

.severity-unknown {
    background-color: lightgrey !important;
    color: #0000008a !important;
}
.severity-low {
    background-color: #fdfda0 !important;
    color: #0000008a !important;
}
.severity-medium {
    background-color: #ffd07a !important;
    color: #0000008a !important;
}
.severity-high {
    background-color: #ff946d !important;
    color: #0000008a !important;
}
.severity-critical {
    background-color: #ff8080 !important;
    color: #0000008a !important;
}
.severity-total {
    background-color: gray !important;
    color: whitesmoke!important;
}

.theme--light.v-chip:not(.v-chip--active) {
    background: #e6e6e6;
}

.theme--dark.v-chip:not(.v-chip--active) {
    background: #2c2c2c;
}

</style>
