    <template>
    <v-container>
        <breadcrumbs :items="breadcrumbItems"></breadcrumbs>

                <v-row class="justify-space-between">
                    <v-col cols="6" sm="6" md="6" lg="6" xl="6">
                        <h1>Pipelines</h1>
                    </v-col>
                    <v-spacer />
                    <v-col class="text-right">
                        <v-btn
                        elevation="2"
                        color="primary"
                        :to="{ name: 'New Pipeline'}"
                        >New Pipeline</v-btn>
                    </v-col>
                </v-row>

                <v-row v-if="apps && apps.length < 1" class="delay-visible-enter-active">
                    <v-col cols="12" style="text-align: center;">
                        <img src="/img/empty.svg" alt="Empty" class="empty" width="100%" style="max-width: 500px; filter: invert(39%) sepia(47%) saturate(584%) hue-rotate(228deg) brightness(95%) contrast(80%);">
                        <h2>Ready to start building your first pipeline?</h2>
                    </v-col>
                </v-row>

                <v-row v-for="item in apps" :key="item.name" :id="item.name">
                    <v-col cols="12">
                        <v-card elevation="2" outlined color="cardBackground">
                            <v-card-text>
                                <v-row>
                                    <v-col cols="12" sm="12" md="6">
                                        <a :href="'/#/pipeline/'+item.name+'/apps'">
                                            <v-card-title>
                                                <v-icon left :class=" (item.git.repository.admin == true) ? 'connected' : 'disconnected' "></v-icon>
                                                <span class="text-h5">{{ item.name }}</span>
                                            </v-card-title>
                                            <v-card-text>
                                                <span>{{ item.git.repository.description }}</span>
                                            </v-card-text>
                                        </a>
                                    </v-col>
                                    <v-col cols="12" sm="12" md="5" style="padding: 26px;">
                                            <v-chip
                                                v-for="phase in item.phases" :key="phase.name"
                                                small
                                                label
                                                class="ma-1"
                                                :color="phase.enabled ? 'green' : ''"
                                                :text-color="phase.enabled  ? 'white' : ''"
                                                >
                                                <v-icon left color="white" v-if="phase.name.includes('review')">
                                                    mdi-eye-refresh-outline
                                                </v-icon>
                                                {{ phase.name }}
                                            </v-chip>
                                    </v-col>

                                    <v-col cols="12" sm="12" md="1">
                                        <v-btn
                                        elevation="2"
                                        fab
                                        small
                                        class="ma-2"
                                        color="secondary"
                                        @click="deletePipeline(item.name)"
                                        >
                                            <v-icon>
                                                mdi-delete
                                            </v-icon>
                                        </v-btn>
                                        <v-btn
                                        elevation="2"
                                        fab
                                        small
                                        class="ma-2"
                                        color="secondary"
                                        :href="'#/pipeline/'+item.name"
                                        >
                                            <v-icon>
                                                mdi-pencil
                                            </v-icon>
                                        </v-btn>
                                    </v-col>

                                </v-row>
                            </v-card-text>

                        </v-card>
                    </v-col>
                </v-row>
    </v-container>
</template>

<script>
import axios from "axios";
export default {
    sockets: {
        async updatedPipelines(instances) {
            console.log("updatedPipelines", instances);
            let _apps = await this.loadPipelinesList();
            this.apps = _apps;
        },
    },
    mounted() {
        this.loadPipelinesList();
        
        // sleep for 1 second till session is loaded
        setTimeout(() => {
            if (this.$vuetify.kubernetesVersion === "unknown") {
                // TODO: use Pinia to maintain a global state
                // https://pinia.vuejs.org/introduction.html
                // https://vuex.vuejs.org/
                // https://vuex.vuejs.org/api/
                console.log("cant reach kubernetes");
            }
        }, 1000);
        
    },

    components: {
        breadcrumbs: () => import('../breadcrumbs.vue'),
    },
    data () { return {
        apps: [],

        breadcrumbItems: [
            {
                text: 'DASHBOARD',
                disabled: true,
                href: '#/',
            }
        ],
    }},
    methods: {
      async loadPipelinesList() {
        const self = this;
        axios.get(`/api/pipelines`)
        .then(response => {
            self.apps = response.data.items;
        })
        .catch(error => {
            console.log(error);
        });
      },
      deletePipeline(app) {
        document.querySelector(`#${app}`).style.display = "none";

        axios.delete(`/api/pipelines/${app}`)
        .then(response => {
            console.log(response);
            //this.loadPipelinesList();
        })
        .catch(error => {
            console.log(error);
        });
      },
      editPipeline(app) {
        this.$router.push({ name: 'Edit Pipeline', params: { name: app } });
      },
    },
}
</script>

<style lang="scss">
.delay-visible-enter-active {
    opacity: 0;
    animation: fadeIn 2s;
    animation-delay: 1s;
    animation-fill-mode: forwards;
}
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
.v-card a{
    text-decoration: none;
    color: #8560A9 !important;
}

.connected{
    background-image: url('./../../../public/img/icons/connected.svg');
    background-size: contain;
    background-repeat: no-repeat;
    filter: invert(39%) sepia(47%) saturate(584%) hue-rotate(228deg) brightness(95%) contrast(80%);
    /*filter: invert(93%) sepia(49%) saturate(7411%) hue-rotate(184deg) brightness(87%) contrast(90%);*/
}

.connected::before {
    height: 23px;
    width: 23px;
    visibility: hidden;
    content: "";
}

.disconnected{
    background-image: url('./../../../public/img/icons/disconnected.svg');
    background-size: contain;
    background-repeat: no-repeat;
    filter: invert(39%) sepia(47%) saturate(584%) hue-rotate(228deg) brightness(95%) contrast(80%);
    /*filter: invert(93%) sepia(49%) saturate(7411%) hue-rotate(184deg) brightness(87%) contrast(90%);*/
}

.disconnected::before {
    height: 23px;
    width: 23px;
    visibility: hidden;
    content: "";
}
</style>