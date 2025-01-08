    <template>
    <v-container>
        <Breadcrumbs :items="breadcrumbItems"></Breadcrumbs>

        <v-row class="justify-space-between">
            <v-spacer />
            <v-col class="text-right">
                <v-btn
                elevation="2"
                :disabled="kubero.kubernetesVersion == 'unknown'"
                color="primary"
                :to="{ name: 'Pipeline Form', params: { pipeline: 'new' }}"
                >New Pipeline</v-btn>
            </v-col>
        </v-row>

        <v-row v-if="(pipelines && pipelines.length < 1) && kubero.kubernetesVersion != 'unknown'" class="delay-visible-enter-active">
            <v-alert
                color="info"
                icon="mdi-star-outline"
                            width="40%"
                            variant="tonal"
                            prominent
                            closable
                >
                If you find Kubero useful, please consider starring the project 
                <a href="https://github.com/kubero-dev/kubero" target="_blank">on GitHub</a>. 
                Your support contributes to the project's growth and development.
            </v-alert>
            <v-col cols="12" style="text-align: center;">
                <img src="/img/empty.svg" alt="Empty" class="empty" width="100%" style="max-width: 500px; filter: invert(39%) sepia(47%) saturate(584%) hue-rotate(228deg) brightness(95%) contrast(80%);">

                <h1 style="font-size: 3em;">👋 Welcome to Kubero!</h1>
                <p>Congratulations on successfully installing Kubero! We're glad to have you on board.</p>
                <br>

                <v-btn
                elevation="2"
                color="primary"
                :to="{ name: 'Pipeline Form', params: { pipeline: 'new' }}"
                >Create your first pipeline</v-btn>
            </v-col>
        </v-row>
        <v-row v-if="kubero.kubernetesVersion == 'unknown'">
            <v-alert
                type="error"
                prominent
                title="Kubernetes Connection Error"
                variant="tonal"
                >
                <p>Kubero can't reach your kubernetes cluster. Please proceed with the setup to continue.</p>

                <v-btn
                color="success"
                class="mt-4"
                :to="{ name: 'Setup', params: { step: '1' }}"
                >Start Setup</v-btn>
            </v-alert>
        </v-row>

        <div class="mt-5"></div>
        <div v-for="item in pipelines" :key="item.name" :id="item.name">
            <v-row class="my-0 row">
                <v-col cols="12" sm="0" md="1"  style="cursor: pointer;" @click="$router.push({ name: 'Pipeline Apps', params: { pipeline: item.name } })">
                    <img :src="(item.git.repository.admin == true) ? '/img/icons/hexagon3.svg' : '/img/icons/hexagon3-empty-bold-tp.svg'" alt="Pipeline" width="40" height="40">
                </v-col>
                <v-col cols="12" sm="11" md="4"  style="cursor: pointer;" @click="$router.push({ name: 'Pipeline Apps', params: { pipeline: item.name } })">
                        <h3>
                            <span class="text-h5">{{ item.name }}</span>
                        </h3>
                        <p v-if="item.git.repository.admin">
                            <v-icon start size="small" >mdi-link</v-icon>
                            <span>{{ item.git.repository.description }}</span>
                        </p>
                </v-col>
                <v-col cols="12" sm="12" md="5" style="cursor: pointer;" @click="$router.push({ name: 'Pipeline Apps', params: { pipeline: item.name } })">
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
                    elevation="0"
                    vartiant="tonal"
                    size="small"
                    class="ma-2"
                    color="secondary"
                    @click="deletePipeline(item.name)"
                    >
                        <v-icon color="primary">
                            mdi-delete
                        </v-icon>
                    </v-btn>
                    <v-btn
                    elevation="0"
                    vartiant="tonal"
                    size="small"
                    class="ma-2"
                    color="secondary"
                    :to="{ name: 'Pipeline Form', params: { pipeline: item.name }}"
                    >
                        <v-icon color="primary">
                            mdi-pencil
                        </v-icon>
                    </v-btn>
                </v-col>

            </v-row>
            <v-divider></v-divider>
        </div>
    </v-container>
</template>

<script lang="ts">
import axios from "axios";
import { ref, defineComponent } from 'vue'
import Breadcrumbs from "../breadcrumbs.vue";
import { useKuberoStore } from '../../stores/kubero'
import { mapState } from 'pinia'
import Swal from 'sweetalert2';

type Pipeline = {
    name: string,
    git: {
        repository: {
            admin: boolean,
            description: string,
            clone_url: string,
            ssh_url: string,
        }
    },
    phases: {
        name: string,
        enabled: boolean,
    }[]
}

const socket = useKuberoStore().kubero.socket as any;

socket.on('updatedPipelines', (instances: any) => {
    //console.log("updatedPipelines", instances);
    loadPipelinesList();
});

const pipelines = ref([] as Pipeline[]);
function loadPipelinesList() {
    axios.get(`/api/pipelines`)
    .then(response => {
        pipelines.value = response.data.items;
    })
    .catch(error => {
        console.log(error);
    });
}

export default defineComponent({
    name: 'Pipelines List',
    setup() {
        return {
            pipelines,
            socket,
        }
    },
    mounted() {
        loadPipelinesList();
    },
    components: {
        Breadcrumbs,
    },
    data () { return {
        pipelines: [] as Pipeline[], 

        breadcrumbItems: [
            {
                title: 'Dashboard.Pipelines',
                disabled: true,
                href: '/',
            }
        ],
    }},
    computed: {
      ...mapState(useKuberoStore, ['kubero']),
    },
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
      deletePipeline(pipeline: string) {

        Swal.fire({
            title: "Delete Pipeline ”" + pipeline + "” ?",
            text: "Do you want to delete this pipeline? This action cannot be undone. It will delete all the apps and data associated with this pipeline.",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Delete",
            cancelButtonText: "Cancel",
            confirmButtonColor: "rgb(var(--v-theme-kubero))",
            background: "rgb(var(--v-theme-cardBackground))",
            /*background: "rgb(var(--v-theme-on-surface-variant))",*/
            color: "rgba(var(--v-theme-on-background),var(--v-high-emphasis-opacity));",
        })
        .then((result) => {
            if (result.isConfirmed) {
                const element = document.querySelector(`#${pipeline}`) as HTMLElement;
                if (element) {
                    element.style.display = "none";
                }

                axios.delete(`/api/pipelines/${pipeline}`)
                .then(response => {
                    //console.log(response);
                    //this.loadPipelinesList(); //reload not needed?
                })
                .catch(error => {
                    console.log(error);
                });
            }
            return;
        });

      },
      editPipeline(pipeline: string) {
        this.$router.push({ name: 'Edit Pipeline', params: { name: pipeline } });
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

.row:hover {
    background-color: rgb(var(--v-theme-cardBackground));
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
button:where(.swal2-styled)  {
    color: #FFF !important;
}

</style>