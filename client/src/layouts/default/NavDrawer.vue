<template>
  <v-navigation-drawer
      color="navBG"
      expand-on-hover
      permanent
      rail
  >
    <v-list>
      <v-list-item
        link to="/profile"
      >
        <template #prepend>
          <v-avatar size="30">
            <v-img :src="userAvatar || '/avatar.svg'" alt="User avatar" />
          </v-avatar>
        </template>
        <template #title>
          {{ userName }}
        </template>
        <template #subtitle>
          {{ userEmail }}
        </template>
      </v-list-item>
    </v-list>

    <v-divider></v-divider>
    <v-list nav density="compact">
        <v-list-item 
            link to="/"
            prepend-icon="mdi-server"
            title="Pipelines">
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
            link to="/accounts" 
            v-if="kubero.isAuthenticated && !kubero.adminDisabled"
            prepend-icon="mdi-account-outline"
            title="Accounts">
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
                @click="debugDialog = true"
                prepend-icon="mdi-star"
                :title="''+ kubero.version">
            </v-list-item>
        </v-list>
    </template>
    <v-dialog
      v-model="debugDialog"
      width="auto"
    >
      <v-card
        min-width="400"
        prepend-icon="mdi-information-outline"
        title="Version and Features"
      >
        <v-card-text>
            <v-row dense>
                <v-col cols="12">
                    <v-textarea
                    label="Debug"
                        :model-value="'Kubero UI Version: ' + kubero.version
                        + '\nKubero Operator Version: ' + kubero.operatorVersion
                        + '\nKubernetes Version: ' + kubero.kubernetesVersion
                        + '\nTemplates: ' + kubero.templatesEnabled
                        + '\nAdmin: ' + kubero.adminDisabled
                        + '\nWeb Console: ' + kubero.consoleEnabled
                        + '\nBuild Pipeline: ' + kubero.buildPipeline
                        + '\nMetrics: ' + kubero.metricsEnabled
                        + '\nAudit: ' + kubero.auditEnabled
                        + '\nZeropod Sleep: ' + kubero.sleepEnabled"
                        readonly
                        name="debug"
                        variant="filled"
                        auto-grow
                    ></v-textarea>

                    <a href="https://github.com/kubero-dev/kubero/releases" target="_blank">List of latest Kubero releases</a>
                </v-col>
                <!--
                <v-col cols="12">
                    <v-text-field
                        label="Kubero UI Version"
                        v-model="kubero.version"
                        readonly
                        density="compact"
                        variant="plain"
                    ></v-text-field>
                </v-col>
                <v-col cols="12">
                    <v-text-field
                        label="Kubero Operotor Version"
                        v-model="kubero.operatorVersion"
                        readonly
                        density="compact"
                        variant="plain"
                    ></v-text-field>
                </v-col>
                <v-col cols="12">
                    <v-text-field
                        label="Kubernetes Version"
                        v-model="kubero.kubernetesVersion"
                        readonly
                        density="compact"
                        variant="plain"
                    ></v-text-field>
                </v-col>
                <v-col cols="12">
                    <v-checkbox readonly density="compact" label="Templates" v-model="kubero.templatesEnabled"></v-checkbox>
                    <v-checkbox readonly density="compact" label="Admin" v-model="kubero.adminDisabled"></v-checkbox>
                    <v-checkbox readonly density="compact" label="Web Console" v-model="kubero.consoleEnabled"></v-checkbox>
                    <v-checkbox readonly density="compact" label="Build Pipeline" v-model="kubero.buildPipeline"></v-checkbox>
                    <v-checkbox readonly density="compact" label="Metrics" v-model="kubero.metricsEnabled"></v-checkbox>
                    <v-checkbox readonly density="compact" label="Audit" v-model="kubero.auditEnabled"></v-checkbox>
                    <v-checkbox readonly density="compact" label="Zeropod Sleep" v-model="kubero.sleepEnabled"></v-checkbox>
                </v-col>
                -->
            </v-row>
        </v-card-text>
        <template v-slot:actions>
          <v-btn
            class="ms-auto"
            text="Ok"
            @click="debugDialog = false"
          ></v-btn>
        </template>
      </v-card>
    </v-dialog>
  </v-navigation-drawer>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useTheme } from 'vuetify'
import axios from 'axios'
const theme = useTheme()

const userAvatar = ref<string>('')
const userName = ref<string>('')
const userEmail = ref<string>('')

async function loadUserProfile() {
  try {
    const res = await axios.get('/api/users/profile')
    userName.value = `${res.data.firstName || ''} ${res.data.lastName || ''}`.trim() || res.data.username
    userEmail.value = res.data.email
    userAvatar.value = res.data.image
  } catch {
    userName.value = 'Profile'
    userEmail.value = ''
    userAvatar.value = '/avatar.svg'
  }
}

onMounted(() => {
  loadUserProfile()
})

function toggleTheme() {
    theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
    localStorage.setItem("theme", theme.global.name.value);
}

theme.global.name.value = localStorage.getItem("theme") || 'light';

</script>

<script lang="ts">
import { useCookies } from "vue3-cookies";
import router from "../../router"
import { defineComponent } from 'vue'
import { useKuberoStore } from '../../stores/kubero'
import { mapState } from 'pinia'

const { cookies } = useCookies();

export default defineComponent({
  name: "NavDrawer",
    data() {
        return {
        version: '0.0.1',
        templatesEnabled: false,
        session: false,
        debugDialog: false
        }
    },
    computed: {
      ...mapState(useKuberoStore, ['kubero']),
    },
    methods: {
        logout: () => {
            //localStorage.removeItem("kubero.JWT_TOKEN");
            // Remove cookie
            cookies.remove("kubero.JWT_TOKEN");
            router.push("/login")
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
