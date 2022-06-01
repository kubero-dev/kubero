<template>
    <v-app>
        <v-navigation-drawer
            app
            color="#F7F8FB"
            expand-on-hover
            permanent
            mini-variant
        >
            <v-list nav dense>
                <v-list-item link to="/">
                    <v-list-item-icon>
                    <v-icon>mdi-server</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title>Pipelines</v-list-item-title>
                </v-list-item>
                
                <v-list-item link to="/settings">
                    <v-list-item-icon>
                    <v-icon>mdi-file-cog-outline</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title>Settings</v-list-item-title>
                </v-list-item>
                
                <v-list-item link to="/addons">
                    <v-list-item-icon>
                    <v-icon>mdi-bookshelf</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title>Addons</v-list-item-title>
                </v-list-item>
                
            </v-list>

        </v-navigation-drawer>

        <v-main>
            <router-view></router-view>
        </v-main>
        
        <Appfooter :swarmversion="status.swarmversion" :kubeversion="status.kubeVersion.gitVersion" />
    </v-app>
</template>

<style>
.v-icon {
  color: #8560A9;
}
</style>


<script>
//import axios from "axios";
import Appfooter from "./components/appfooter.vue";

export default {
    name: "App",
    components: {
        Appfooter
    },
    mounted() {
        /*
        axios
            .get("/api/status")
            .then((result) => {
                this.status = result.data;
            })
            .catch((err) => {
                console.error(err);
            });
        */
    },
    data: () => ({
      status: {
        swarmversion: "",
        kubeVersion: {
          gitVersion: ""
        }
      }
    }),
};
</script>

<style>
.v-icon {
  color: #8560A9!important;
}
</style>