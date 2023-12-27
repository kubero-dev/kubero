<template>
  <v-navigation-drawer
      app
      color="navBG"
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
</template>

<script lang="ts">
export default {
  name: "NavDrawer",
    data() {
        return {
        version: '0.0.1',
        templatesEnabled: false,
        session: false
        }
    },
    methods: {
        toggleTheme() {
            //this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
        },
        logout() {
            //this.$store.dispatch('logout');
            //this.$router.push('/login');
        }
    },
    mounted() {
        //this.templatesEnabled = this.$store.state.templatesEnabled;
        //this.session = this.$store.state.session;
    }
};

</script>
