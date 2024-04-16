<template>
  <v-navigation-drawer
      color="navBG"
      expand-on-hover
      permanent
      rail
  >
    <v-list nav density="compact">
        <v-list-item 
            link to="/"
            prepend-icon="mdi-server"
            title="Dashboard">
        </v-list-item>
        <v-list-item 
            link to="/templates" 
            v-if="kubero.templatesEnabled"
            prepend-icon="mdi-list-box-outline"
            title="Templates">
        </v-list-item>
        <v-list-item 
            link to="/activity"
            v-if="kubero.auditEnabled"
            prepend-icon="mdi-bell-outline"
            title="Activity">
        </v-list-item>
        <v-list-item 
            link to="/addons"
            prepend-icon="mdi-bookshelf"
            title="Add-Ons">
        </v-list-item>
        <v-list-item 
            link to="/settings" 
            v-if="kubero.isAuthenticated && !kubero.adminDisabled"
            prepend-icon="mdi-cog-outline"
            title="Settings">
        </v-list-item>
        <v-list-item 
            @click="logout()" 
            v-if="kubero.isAuthenticated"
            prepend-icon="mdi-logout"
            title="Logout">
        </v-list-item>
    </v-list>


    <template v-slot:append>
        <v-list nav dense>
            <v-list-item 
                @click="toggleTheme()"
                prepend-icon="mdi-theme-light-dark"
                title="Theme">
            </v-list-item>
            <v-list-item 
                link href="/api/docs" 
                target="_blank"
                prepend-icon="mdi-api"
                title="Kubero API">
            </v-list-item>
            <v-list-item 
                link href="https://docs.kubero.dev/" 
                target="_blank"
                prepend-icon="mdi-book-open-variant"
                title="Documentation">
            </v-list-item>
            <v-list-item 
                link href="https://github.com/kubero-dev/kubero" 
                target="_blank"
                prepend-icon="mdi-github"
                title="Github">
            </v-list-item>
            <!--
            <v-list-item 
                link href="https://www.reddit.com/r/kubero/" 
                target="_blank"
                prepend-icon="mdi-reddit"
                title="Reddit">
            </v-list-item>
            -->
            <v-list-item 
                link href="https://discord.gg/tafRPMWS4r" 
                target="_blank"
                prepend-icon="mdi-discord"
                title="Discord">
                <img src="./../../../public/img/icons/discord.svg" class="image-icon"/>
            </v-list-item>
            <!--
            <v-list-item 
                link href="https://join.slack.com/t/kubero/shared_invite/zt-1leocjhrm-kYwk_dcwHUcEkcjUgQCFaA" 
                target="_blank"
                prepend-icon="mdi-slack"
                title="Slack">
            </v-list-item>
            -->
            <v-list-item
                prepend-icon="mdi-star"
                :title="''+ kubero.version">
            </v-list-item>
        </v-list>
    </template>
  </v-navigation-drawer>
</template>

<script lang="ts" setup>
import { useTheme } from 'vuetify'
const theme = useTheme()

function toggleTheme() {
    theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
    localStorage.setItem("theme", theme.global.name.value);
}

theme.global.name.value = localStorage.getItem("theme") || 'light';

</script>

<script lang="ts">
import axios from "axios";
import { defineComponent } from 'vue'
import { useKuberoStore } from '../../stores/kubero'
import { mapState } from 'pinia'

export default defineComponent({
  name: "NavDrawer",
    data() {
        return {
        version: '0.0.1',
        templatesEnabled: false,
        session: false
        }
    },
    computed: {
      ...mapState(useKuberoStore, ['kubero']),
    },
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
    },
    mounted() {
        //this.templatesEnabled = this.$store.state.templatesEnabled;
        //this.session = this.$store.state.session;
    }
});

</script>

<style scoped>

img.image-icon {
    width: 23px; 
    height: 23px; 
    margin-right: 10px; 
    left: 9px; 
    top: 11px; 
    position: absolute;
}

/* style for the light theme */
.v-theme--light img.image-icon {
    filter: brightness(0) saturate(100%) invert(37%) sepia(5%) saturate(133%) hue-rotate(202deg) brightness(97%) contrast(84%);
    /*filter: invert(39%) sepia(47%) saturate(584%) hue-rotate(228deg) brightness(95%) contrast(80%);
    /*filter: invert(93%) sepia(49%) saturate(7411%) hue-rotate(184deg) brightness(87%) contrast(90%);*/
}

/* style for the dark theme */
.v-theme--dark img.image-icon {
    filter: brightness(0) saturate(100%) invert(86%) sepia(6%) saturate(7%) hue-rotate(331deg) brightness(90%) contrast(86%);
    /*filter: invert(39%) sepia(47%) saturate(584%) hue-rotate(228deg) brightness(95%) contrast(80%);
    /*filter: invert(93%) sepia(49%) saturate(7411%) hue-rotate(184deg) brightness(87%) contrast(90%);*/
}
</style>
