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
            link to="/addons"
            prepend-icon="mdi-bookshelf"
            title="Add-Ons">
        </v-list-item>
        <v-list-item 
            link to="/templates" 
            v-if="kubero.templatesEnabled"
            prepend-icon="mdi-palette-outline"
            title="Templates">
        </v-list-item>
        <v-list-item 
            link to="/events"
            prepend-icon="mdi-file-document-check-outline"
            title="Events">
        </v-list-item>
        <v-list-item 
            link to="/settings" 
            v-if="kubero.session"
            prepend-icon="mdi-cog-outline"
            title="Settings">
        </v-list-item>
        <v-list-item 
            @click="logout()" 
            v-if="kubero.session"
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
                :title="'v'+ kubero.version">
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
}
</script>

<script lang="ts">
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
        logout() {
            //this.$store.dispatch('logout');
            //this.$router.push('/login');
        }
    },
    mounted() {
        //this.templatesEnabled = this.$store.state.templatesEnabled;
        //this.session = this.$store.state.session;
    }
});

</script>
