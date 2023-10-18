<template>
    <v-app>

        <v-app-bar dense max-height="50" :color="banner.bgcolor" v-if="banner.show && popup!='true'">
            <v-toolbar-title style="width: 100%; text-align: center; color: azure;">{{ banner.message }}</v-toolbar-title>
        </v-app-bar>
        <v-navigation-drawer
            app
            color="navBG"
            expand-on-hover
            permanent
            mini-variant
            v-if="isAuthenticated && popup!='true'"
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
                    <v-list-item-title>Add-Ons</v-list-item-title>
                </v-list-item>
                <v-list-item link to="/templates" v-if="templatesEnabled">
                    <v-list-item-icon>
                    <v-icon>mdi-palette-outline</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title>Templates</v-list-item-title>
                </v-list-item>
                <v-list-item link to="/events">
                    <v-list-item-icon>
                    <v-icon>mdi-file-document-check-outline</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title>Events</v-list-item-title>
                </v-list-item>
                <v-list-item link to="/settings" v-if="session">
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
                    <v-list-item @click="toggleTheme()" >
                        <v-list-item-icon>
                        <v-icon>mdi-theme-light-dark</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Theme</v-list-item-title>
                    </v-list-item>
                    <v-list-item link href="/api/docs" target="_blank">
                        <v-list-item-icon>
                        <v-icon>mdi-api</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Kubero API</v-list-item-title>
                    </v-list-item>
                    <v-list-item link href="https://docs.kubero.dev/" target="_blank">
                        <v-list-item-icon>
                        <v-icon>mdi-book-open-variant</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Documentation</v-list-item-title>
                    </v-list-item>
                    <v-list-item link href="https://github.com/kubero-dev/kubero" target="_blank">
                        <v-list-item-icon>
                        <v-icon>mdi-github</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Github</v-list-item-title>
                    </v-list-item>
                    <!--
                    <v-list-item link href="https://www.reddit.com/r/kubero/" target="_blank">
                        <v-list-item-icon>
                        <v-icon>mdi-reddit</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Reddit</v-list-item-title>
                    </v-list-item>
                    -->
                    <v-list-item link href="https://discord.gg/tafRPMWS4r" target="_blank">
                        <v-list-item-icon>
                        <v-icon class="discord">mdi-discord</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Discord</v-list-item-title>
                    </v-list-item>
                    <!--
                    <v-list-item link href="https://join.slack.com/t/kubero/shared_invite/zt-1leocjhrm-kYwk_dcwHUcEkcjUgQCFaA" target="_blank">
                        <v-list-item-icon>
                        <v-icon>mdi-slack</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Slack</v-list-item-title>
                    </v-list-item>
                    -->
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

<script>
import axios from "axios";
//import Appfooter from "./components/appfooter.vue";

export default {
    name: "Kubero",
    /*
    components: {
        Appfooter
    },
    */
    created() {
        if (this.$route.query.popup) {
            this.popup = this.$route.query.popup;
        }
        this.$vuetify.theme.dark = this.getTheme();
        this.checkSession()
    },
    mounted() {
        this.loadBanner()
    },
    updated() {
        this.checkSession();
    },
    data: () => ({
        popup: "false",
        session: false,
        isAuthenticated: false,
        templatesEnabled: true,
        version: "dev",
        banner: {
            show: false,
            message: "",
            bgcolor: "white",
            fontcolor: "white"
        }
    }),
    methods: {
        getTheme() {
            const theme = localStorage.getItem("theme");
            console.log('theme: ' + theme);
            if (theme) {
                if (theme === "dark") {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
/*
            const hours = new Date().getHours();
            const darkmode = hours > 6 && hours < 19 ? 'true' : 'false';
            console.log('darkmode: ' + darkmode);
            console.log('hours: ' + hours);
            return darkmode;
*/
        },
        toggleTheme() {
            if (this.$vuetify.theme.dark) {
                this.$vuetify.theme.dark = false;
                localStorage.setItem("theme", "light");
            } else {
                this.$vuetify.theme.dark = true;
                localStorage.setItem("theme", "dark");
            }
        },
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
                        this.templatesEnabled = result.data.templatesEnabled;

                        // safe version to vuetufy gloabl scope for use in components
                        this.$vuetify.version = this.version;
                        this.$vuetify.isAuthenticated = result.data.isAuthenticated;
                        this.$vuetify.buildPipeline = result.data.buildPipeline;

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
        },
        loadBanner() {
            axios
                .get("/api/banner")
                .then((result) => {
                    this.banner = result.data;
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    },
};
</script>

<style>
.v-icon.theme--light{
    color: #8560A9
}

.v-btn > .v-btn__content .v-icon.theme--light {
    color: #8560A9
}

.v-icon.theme--dark{
    color: #8560A9;
}

.v-btn > .v-btn__content .v-icon.theme--dark {
    color: #8560A9;
}

.v-list-item--active .v-icon.theme--dark {
    /*color: #ac89d0;*/
    color: #ceafec;
}

.v-list-item--active .v-icon.theme--light {
    color: #8560A9;
}

.theme--light.v-application {
    color: #454545;
}

.theme--dark.v-application {
    color: #d3d3d3;
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

.severity-unknown {
    background-color: lightgrey !important;
}
.severity-low {
    background-color: #fdfda0 !important;
}
.severity-medium {
    background-color: #ffd07a !important;
}
.severity-high {
    background-color: #ff946d !important;
}
.severity-critical {
    background-color: #ff8080 !important;
}
.severity-total {
    background-color: gray !important;
    color: whitesmoke!important;
}
</style>