<template>
    <v-app>
        <v-navigation-drawer
            app
            color="#F7F8FB"
            expand-on-hover
            permanent
            mini-variant
            v-if="isAuthenticated"
        >
            <v-list nav dense>
                <v-list-item link to="/">
                    <v-list-item-icon>
                    <v-icon>mdi-server</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title>Pipelines</v-list-item-title>
                </v-list-item>
                <v-list-item link to="/addons">
                    <v-list-item-icon>
                    <v-icon>mdi-bookshelf</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title>Addons</v-list-item-title>
                </v-list-item>
                <v-list-item link to="/settings">
                    <v-list-item-icon>
                    <v-icon>mdi-file-cog-outline</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title>Settings</v-list-item-title>
                </v-list-item>
                <v-list-item @click="logout()" v-if="session">
                    <v-list-item-icon>
                    <v-icon>mdi-logout</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title>Logout</v-list-item-title>
                </v-list-item>

            </v-list>

        </v-navigation-drawer>

        <v-main>
            <router-view></router-view>
        </v-main>

        <!--<Appfooter :swarmversion="status.swarmversion" :kubeversion="status.kubeVersion.gitVersion" />-->
    </v-app>
</template>

<style>
.v-icon {
  color: #8560A9;
}
</style>


<script>
import axios from "axios";
//import Appfooter from "./components/appfooter.vue";

export default {
    name: "App",
    /*
    components: {
        Appfooter
    },
    */
    mounted() {
        this.checkSession()
    },
    updated() {
        this.checkSession();
    },
    data: () => ({
        session: false,
        isAuthenticated: false
    }),
    methods: {
        logout: () => {
            axios.get("/api/logout")
            .then((response) => {
                console.log("Logged out"+response)
                window.location.reload()
            })
            .catch((errors) => {
                console.log("Cannot logout "+errors)
            })
        },
        checkSession() {
            if (this.$route.name != 'Login') {
                axios
                    .get("/api/session")
                    .then((result) => {
                        console.log("isAuthenticated: " + result.data);
                        this.session = result.data;
                        if (result.status === 200) {
                            this.isAuthenticated = true;
                        }
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
        }
    },
};
</script>

<style>
.v-icon {
  color: #8560A9!important;
}
</style>