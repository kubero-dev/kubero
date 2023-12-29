    <template>
    <v-container>
        <Breadcrumbs :items="breadcrumbItems"></Breadcrumbs>

        <v-row class="justify-space-between">
            <v-col cols="6" sm="6" md="6" lg="6" xl="6">
                <h1>Pipelines</h1>
            </v-col>
            <v-spacer />
            <v-col class="text-right">
                <v-btn
                elevation="2"
                color="primary"
                :to="{ name: 'Pipeline Form', params: { pipeline: 'new' }}"
                >New Pipeline</v-btn>
            </v-col>
        </v-row>

        <v-row v-if="pipelines && pipelines.length < 1" class="delay-visible-enter-active">
            <v-col cols="12" style="text-align: center;">
                <img src="/img/empty.svg" alt="Empty" class="empty" width="100%" style="max-width: 500px; filter: invert(39%) sepia(47%) saturate(584%) hue-rotate(228deg) brightness(95%) contrast(80%);">
                <h2>Ready to start building your first pipeline?</h2>
            </v-col>
        </v-row>

        <v-row v-for="item in pipelines" :key="item.name" :id="item.name">
            <v-col cols="12">
                <v-card elevation="2" outlined color="cardBackground" @click="$router.push({ name: 'Pipeline Apps', params: { pipeline: item.name } })">
                    <v-card-text>
                        <v-row>
                            <v-col cols="12" sm="12" md="5">
                                    <v-card-title>
                                        <v-icon start size="small" :class=" (item.git.repository.admin == true) ? 'connected' : 'disconnected' "></v-icon>
                                        <span class="text-h5">{{ item.name }}</span>
                                    </v-card-title>
                                    <v-card-text>
                                        <span>{{ item.git.repository.description }}</span>
                                    </v-card-text>
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
                                        <v-icon start v-if="phase.name.includes('review')" icon="mdi-eye-refresh-outline"></v-icon>
                                        {{ phase.name }}
                                    </v-chip>
                            </v-col>

                            <v-col cols="12" sm="12" md="2">
                                <v-btn
                                elevation="2"
                                fab
                                small
                                class="ma-2"
                                color="secondary"
                                @click="deletePipeline(item.name)"
                                >
                                    <v-icon color="primary">
                                        mdi-delete
                                    </v-icon>
                                </v-btn>
                                <v-btn
                                elevation="2"
                                fab
                                small
                                class="ma-2"
                                color="secondary"
                                :href="'/pipeline/'+item.name"
                                >
                                    <v-icon color="primary">
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

<script lang="ts">
import axios from "axios";
import { defineComponent } from 'vue'
import Breadcrumbs from "../breadcrumbs.vue";

type Pipeline = {
    name: string,
    git: {
        repository: {
            admin: boolean,
            description: string,
        }
    },
    phases: {
        name: string,
        enabled: boolean,
    }[]
}

type PipelineList = {
    items: Pipeline[]
}

type PipelineInstance = {
    name: string,
    git: {
        repository: {
            admin: boolean,
            description: string,
        }
    },
    phases: {
        name: string,
        enabled: boolean,
    }[]
}

type PipelineInstanceList = {
    items: PipelineInstance[]
}


export default defineComponent({
    sockets: {
        async updatedPipelines(instances: PipelineInstanceList) {
            console.log("updatedPipelines", instances);
            let _apps = await this.loadPipelinesList();
            if (_apps !== undefined) {
                this.pipelines = _apps;
            }
        },
    },
    mounted() {
        this.loadPipelinesList();
    },

    components: {
        Breadcrumbs,
    },
    data () { return {
        pipelines: [] as Pipeline[], 

        breadcrumbItems: [
            {
                text: 'DASHBOARD',
                disabled: true,
                href: '/',
            }
        ],
    }},
    methods: {
      async loadPipelinesList() {
        const self = this;
        axios.get(`/api/pipelines`)
        .then(response => {
            self.pipelines = response.data.items;
        })
        .catch(error => {
            console.log(error);
        });
      },
      deletePipeline(app: string) {

        const element = document.querySelector(`#${app}`) as HTMLElement;
        if (element) {
            element.style.display = "none";
        }

        axios.delete(`/api/pipelines/${app}`)
        .then(response => {
            console.log(response);
            //this.loadPipelinesList();
        })
        .catch(error => {
            console.log(error);
        });
      },
      editPipeline(app: string) {
        this.$router.push({ name: 'Edit Pipeline', params: { name: app } });
      },
    },
});
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