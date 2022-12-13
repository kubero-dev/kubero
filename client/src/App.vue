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
                <v-list-item link to="/events">
                    <v-list-item-icon>
                    <v-icon>mdi-file-document-check-outline</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title>Events</v-list-item-title>
                </v-list-item>
                <v-list-item link to="/settings">
                    <v-list-item-icon>
                    <v-icon>mdi-cog-outline</v-icon>
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


            <template v-slot:append>
                <v-list nav dense>
                    <v-list-item link href="https://github.com/kubero-dev/kubero/discussions">
                        <v-list-item-icon>
                        <v-icon>mdi-github</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Github</v-list-item-title>
                    </v-list-item>
                    <v-list-item link href="https://www.reddit.com/r/kubero/">
                        <v-list-item-icon>
                        <v-icon>mdi-reddit</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Reddit</v-list-item-title>
                    </v-list-item>
                    <v-list-item link href="https://discord.gg/tafRPMWS4r">
                        <v-list-item-icon>
                        <v-icon class="discord">mdi-discord</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Discord</v-list-item-title>
                    </v-list-item>
                    <v-list-item link href="https://join.slack.com/t/kubero/shared_invite/zt-1leocjhrm-kYwk_dcwHUcEkcjUgQCFaA">
                        <v-list-item-icon>
                        <v-icon>mdi-slack</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Slack</v-list-item-title>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-icon>
                        <v-icon>mdi-star</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>v{{version}}</v-list-item-title>
                    </v-list-item>
                </v-list>
            </template>

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
        isAuthenticated: false,
        version: "dev"
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
                        console.log("isAuthenticated: " + result.data.isAuthenticated);
                        this.session = result.data.isAuthenticated;
                        this.version = result.data.version;
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

.discord{
    background-image: url('./../public/img/icons/discord.svg');
    background-size: contain;
    background-repeat: no-repeat;
    filter: invert(39%) sepia(47%) saturate(584%) hue-rotate(228deg) brightness(95%) contrast(80%);
    /*filter: invert(93%) sepia(49%) saturate(7411%) hue-rotate(184deg) brightness(87%) contrast(90%);*/
}

.discord::before {
    height: 23px;
    width: 23px;
    visibility: hidden;
    content: "";
}
</style>