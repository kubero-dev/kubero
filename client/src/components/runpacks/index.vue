<template>

  <v-container>
    <v-row>
      <v-col cols="12" md="12" lg="12" xl="6">
        <v-expansion-panels multiple elevation="0" class="mb-6">
          <v-expansion-panel>
            <v-expansion-panel-title class="text-h6 font-weight-bold">What are Runpacks?</v-expansion-panel-title>
            <v-expansion-panel-text>
              <p>
                <strong>Runpacks</strong> in Kubero define how your application is fetched, built, and run inside the Kubernetes cluster. Each runpack consists of three stages:
              </p>
              <ul class="ma-4">
                <li><strong>Fetch</strong>: Retrieves your code from a Git repository using a container image. You can use the default or customize it.</li>
                <li><strong>Build</strong>: Runs build commands in a container of your choice (any Docker image). This is where dependencies are installed or your app is compiled.</li>
                <li><strong>Run</strong>: Starts the final container. The <em>web</em> pod is exposed to the internet, while <em>worker</em> pods are for background jobs.</li>
              </ul>
              <p>
                Runpacks are highly flexible and can be customized for different languages and frameworks. They rely on publicly available container images. You can find example runpacks at <a href="https://github.com/kubero-dev/runpacks/tree/main/packs" target="_blank" rel="noopener">kubero-dev/runpacks</a>.
              </p>
              <p class="mt-2">
                <a href="https://www.kubero.dev/docs/usermanual/runpacks/" target="_blank" rel="noopener">Read more in the Kubero documentation</a>
              </p>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
    
    <v-data-table
      :headers="headers"
      :items="runpacks"
      :loading="loading"
      class="elevation-0 border-0"
      item-key="id"
      item-value="name"
      :search="search"
      show-expand
    >
      <!--
      <template #top>
        <v-text-field
          v-model="search"
          label="Search Runpacks"
          prepend-inner-icon="mdi-magnify"
          single-line
          hide-details
          outlined
          class="mx-0 mt-2"
          clearable
          density="compact"
        ></v-text-field>
      </template>
      -->
      <template v-slot:[`item.name`]="{ item }">
        <span>{{ item.name }}</span>
      </template>
      <template v-slot:[`item.language`]="{ item }">
        <span>{{ item.language }}</span>
      </template>
      <template v-slot:[`item.fetch`]="{ item }">
        <span>{{ item.fetch?.repository }}:{{ item.fetch?.tag }}</span>
      </template>
      <template v-slot:[`item.build`]="{ item }">
        <span>{{ item.build?.repository }}:{{ item.build?.tag }}</span>
      </template>
      <template v-slot:[`item.run`]="{ item }">
        <span>{{ item.run?.repository }}:{{ item.run?.tag }}</span>
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <v-btn
          elevation="0"
          variant="tonal"
          size="small"
          class="ma-2"
          @click="openEditDialog(item)"
        >
          <v-icon color="primary">mdi-pencil</v-icon>
        </v-btn>
        <v-btn
          elevation="0"
          variant="tonal"
          size="small"
          class="ma-2"
          @click="deleteRunpack(item)"
        >
          <v-icon color="primary">mdi-delete</v-icon>
        </v-btn>
      </template>
      <template v-slot:expanded-row="{ columns, item }">
        <tr>
          <td :colspan="columns.length" style="padding:0;">
            <table style="width:100%; border-collapse:separate; border-spacing:0 12px;">
              <tbody>
                <tr style="background:rgba(0,0,0,0.03);">
                  <th colspan="2" style="text-align:left; font-size:1.1em; padding:12px 8px 4px 8px;"><strong>Fetch</strong></th>
                </tr>
                <tr>
                  <td style="width:160px; vertical-align:top; padding:4px 8px;"><strong>Repository:</strong></td>
                  <td style="vertical-align:top; padding:4px 8px;">{{ item.fetch?.repository }}<span v-if="item.fetch?.tag">:{{ item.fetch?.tag }}</span></td>
                </tr>
                <tr v-if="item.fetch?.command">
                  <td style="vertical-align:top; padding:4px 8px;"><strong>Command:</strong></td>
                  <td style="vertical-align:top; padding:4px 8px;">{{ item.fetch.command }}</td>
                </tr>
                <tr>
                  <td style="vertical-align:top; padding:4px 8px;"><strong>ReadOnly App Storage:</strong></td>
                  <td style="vertical-align:top; padding:4px 8px;"><span :style="{color: item.fetch?.readOnlyAppStorage ? 'green' : 'inherit'}">{{ item.fetch?.readOnlyAppStorage ? 'Yes' : 'No' }}</span></td>
                </tr>
                <tr v-if="item.fetch?.securityContext">
                  <td style="vertical-align:top; padding:4px 8px;"><strong>Security Context:</strong></td>
                  <td style="vertical-align:top; padding:4px 8px;">
                    <details>
                      <summary style="cursor:pointer;">Show Details</summary>
                      <div style="font-size:0.95em; margin-left:8px;">
                        <div>runAsUser: {{ item.fetch.securityContext.runAsUser }}</div>
                        <div>runAsGroup: {{ item.fetch.securityContext.runAsGroup }}</div>
                        <div>allowPrivilegeEscalation: {{ item.fetch.securityContext.allowPrivilegeEscalation ? 'Yes' : 'No' }}</div>
                        <div>readOnlyRootFilesystem: {{ item.fetch.securityContext.readOnlyRootFilesystem ? 'Yes' : 'No' }}</div>
                        <div>runAsNonRoot: {{ item.fetch.securityContext.runAsNonRoot ? 'Yes' : 'No' }}</div>
                        <div>Capabilities:
                          <div style="margin-left:8px;">Add: <span v-if="item.fetch.securityContext.capabilities.add.length">{{ item.fetch.securityContext.capabilities.add.join(', ') }}</span><span v-else>-</span></div>
                          <div style="margin-left:8px;">Drop: <span v-if="item.fetch.securityContext.capabilities.drop.length">{{ item.fetch.securityContext.capabilities.drop.join(', ') }}</span><span v-else>-</span></div>
                        </div>
                      </div>
                    </details>
                  </td>
                </tr>
                <tr style="background:rgba(0,0,0,0.03);">
                  <th colspan="2" style="text-align:left; font-size:1.1em; padding:18px 8px 4px 8px;"><strong>Build</strong></th>
                </tr>
                <tr>
                  <td style="width:160px; vertical-align:top; padding:4px 8px;"><strong>Repository:</strong></td>
                  <td style="vertical-align:top; padding:4px 8px;">{{ item.build?.repository }}<span v-if="item.build?.tag">:{{ item.build?.tag }}</span></td>
                </tr>
                <tr v-if="item.build?.command">
                  <td style="vertical-align:top; padding:4px 8px;"><strong>Command:</strong></td>
                  <td style="vertical-align:top; padding:4px 8px;">{{ item.build.command }}</td>
                </tr>
                <tr>
                  <td style="vertical-align:top; padding:4px 8px;"><strong>ReadOnly App Storage:</strong></td>
                  <td style="vertical-align:top; padding:4px 8px;"><span :style="{color: item.build?.readOnlyAppStorage ? 'green' : 'inherit'}">{{ item.build?.readOnlyAppStorage ? 'Yes' : 'No' }}</span></td>
                </tr>
                <tr v-if="item.build?.securityContext">
                  <td style="vertical-align:top; padding:4px 8px;"><strong>Security Context:</strong></td>
                  <td style="vertical-align:top; padding:4px 8px;">
                    <details>
                      <summary style="cursor:pointer;">Show Details</summary>
                      <div style="font-size:0.95em; margin-left:8px;">
                        <div>runAsUser: {{ item.build.securityContext.runAsUser }}</div>
                        <div>runAsGroup: {{ item.build.securityContext.runAsGroup }}</div>
                        <div>allowPrivilegeEscalation: {{ item.build.securityContext.allowPrivilegeEscalation ? 'Yes' : 'No' }}</div>
                        <div>readOnlyRootFilesystem: {{ item.build.securityContext.readOnlyRootFilesystem ? 'Yes' : 'No' }}</div>
                        <div>runAsNonRoot: {{ item.build.securityContext.runAsNonRoot ? 'Yes' : 'No' }}</div>
                        <div>Capabilities:
                          <div style="margin-left:8px;">Add: <span v-if="item.build.securityContext.capabilities.add.length">{{ item.build.securityContext.capabilities.add.join(', ') }}</span><span v-else>-</span></div>
                          <div style="margin-left:8px;">Drop: <span v-if="item.build.securityContext.capabilities.drop.length">{{ item.build.securityContext.capabilities.drop.join(', ') }}</span><span v-else>-</span></div>
                        </div>
                      </div>
                    </details>
                  </td>
                </tr>
                <tr style="background:rgba(0,0,0,0.03);">
                  <th colspan="2" style="text-align:left; font-size:1.1em; padding:18px 8px 4px 8px;"><strong>Run</strong></th>
                </tr>
                <tr>
                  <td style="width:160px; vertical-align:top; padding:4px 8px;"><strong>Repository:</strong></td>
                  <td style="vertical-align:top; padding:4px 8px;">{{ item.run?.repository }}<span v-if="item.run?.tag">:{{ item.run?.tag }}</span></td>
                </tr>
                <tr v-if="item.run?.command">
                  <td style="vertical-align:top; padding:4px 8px;"><strong>Command:</strong></td>
                  <td style="vertical-align:top; padding:4px 8px;">{{ item.run.command }}</td>
                </tr>
                <tr>
                  <td style="vertical-align:top; padding:4px 8px;"><strong>ReadOnly App Storage:</strong></td>
                  <td style="vertical-align:top; padding:4px 8px;"><span :style="{color: item.run?.readOnlyAppStorage ? 'green' : 'inherit'}">{{ item.run?.readOnlyAppStorage ? 'Yes' : 'No' }}</span></td>
                </tr>
                <tr v-if="item.run?.securityContext">
                  <td style="vertical-align:top; padding:4px 8px;"><strong>Security Context:</strong></td>
                  <td style="vertical-align:top; padding:4px 8px;">
                    <details>
                      <summary style="cursor:pointer;">Show Details</summary>
                      <div style="font-size:0.95em; margin-left:8px;">
                        <div>runAsUser: {{ item.run.securityContext.runAsUser }}</div>
                        <div>runAsGroup: {{ item.run.securityContext.runAsGroup }}</div>
                        <div>allowPrivilegeEscalation: {{ item.run.securityContext.allowPrivilegeEscalation ? 'Yes' : 'No' }}</div>
                        <div>readOnlyRootFilesystem: {{ item.run.securityContext.readOnlyRootFilesystem ? 'Yes' : 'No' }}</div>
                        <div>runAsNonRoot: {{ item.run.securityContext.runAsNonRoot ? 'Yes' : 'No' }}</div>
                        <div>Capabilities:
                          <div style="margin-left:8px;">Add: <span v-if="item.run.securityContext.capabilities.add.length">{{ item.run.securityContext.capabilities.add.join(', ') }}</span><span v-else>-</span></div>
                          <div style="margin-left:8px;">Drop: <span v-if="item.run.securityContext.capabilities.drop.length">{{ item.run.securityContext.capabilities.drop.join(', ') }}</span><span v-else>-</span></div>
                        </div>
                      </div>
                    </details>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </template>
    </v-data-table>

    <div style="display: flex; justify-content: flex-end; margin-top: 16px;">
      <v-btn
        fab
        color="primary"
        style="margin-right: 6px;"
        @click="openCreateDialog"
      >
        <v-icon>mdi-plus</v-icon>
        <span class="sr-only">Create Runpack</span>
      </v-btn>
    </div>

    <v-dialog v-model="editDialog" max-width="1000px">
      <v-card>
        <v-card-title>Edit Runpack</v-card-title>
        <v-card-text v-if="editedRunpack">
          <v-text-field v-model="editedRunpack.name" label="Name"></v-text-field>
          <v-text-field v-model="editedRunpack.language" label="Language"></v-text-field>
          <v-divider class="my-4"></v-divider>
          <v-header class="text-uppercase text-caption-2 font-weight-medium" color="cardBackground">Fetch</v-header>
          <RunpacksItem :buildpackStage="editedRunpack.fetch" title="Fetch" :advanced="true"></RunpacksItem>
          <v-divider class="my-4"></v-divider>
          <v-header class="text-uppercase text-caption-2 font-weight-medium" color="cardBackground">Build</v-header>
          <RunpacksItem :buildpackStage="editedRunpack.build" title="Build" :advanced="true"></RunpacksItem>
          <v-divider class="my-4"></v-divider>
          <v-header class="text-uppercase text-caption-2 font-weight-medium" color="cardBackground">Run</v-header>
          <RunpacksItem :buildpackStage="editedRunpack.run" title="Run" :advanced="true"></RunpacksItem>
        </v-card-text>
        <v-card-text v-else>
          <v-alert type="error" dismissible>
            Error loading runpack details for editing. 
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="editDialog = false">Abort</v-btn>
          <v-btn color="primary" @click="saveEdit">Save</v-btn>
        </v-card-actions>
      </v-card>      
    </v-dialog>

    <v-dialog v-model="createDialog" max-width="1000px">
      <v-card>
        <v-card-title>Create Runpack</v-card-title>
        <v-card-text>
          <v-text-field v-model="newRunpack.name" label="Name"></v-text-field>
          <v-text-field v-model="newRunpack.language" label="Language"></v-text-field>
          <v-divider class="my-4"></v-divider>
          <v-header class="text-uppercase text-caption-2 font-weight-medium" color="cardBackground">Fetch</v-header>
          <RunpacksItem :buildpackStage="newRunpack.fetch" title="Fetch" :advanced="true"></RunpacksItem>
          <v-divider class="my-4"></v-divider>
          <v-header class="text-uppercase text-caption-2 font-weight-medium" color="cardBackground">Build</v-header>
          <RunpacksItem :buildpackStage="newRunpack.build" title="Build" :advanced="true"></RunpacksItem>
          <v-divider class="my-4"></v-divider>
          <v-header class="text-uppercase text-caption-2 font-weight-medium" color="cardBackground">Run</v-header>
          <RunpacksItem :buildpackStage="newRunpack.run" title="Run" :advanced="true"></RunpacksItem>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="createDialog = false">Abort</v-btn>
          <v-btn color="primary" @click="saveCreate">Create</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import axios from 'axios'
import RunpacksItem from './runpacks-item.vue'

export default defineComponent({
  name: 'RunpackList',
  setup() {

    // Types for Runpack
    type RunpackCapability = {
      add: string[];
      drop: string[];
    };

    type RunpackSecurityContext = {
      runAsUser: number;
      runAsGroup: number;
      allowPrivilegeEscalation: boolean;
      readOnlyRootFilesystem: boolean;
      runAsNonRoot: boolean;
      capabilities: RunpackCapability;
    };

    type RunpackStage = {
      id?: string;
      repository: string;
      tag: string;
      command: string;
      readOnlyAppStorage: boolean;
      securityContextId: string;
      createdAt: string;
      updatedAt: string;
      securityContext: RunpackSecurityContext;
    };

    type Runpack = {
      id?: string;
      name: string;
      language: string;
      fetch: RunpackStage;
      build: RunpackStage;
      run: RunpackStage;
    };

    const runpacks = ref<Runpack[]>([])
    const loading = ref(false)
    const search = ref('')
    const editDialog = ref(false)
    const createDialog = ref(false)
    const editedRunpack = ref<Runpack | null>(null)
    const newRunpack = ref<Runpack>({
      id: '',
      name: '',
      language: '',
      fetch: {
        id: '',
        repository: '',
        tag: '',
        command: '',
        readOnlyAppStorage: false,
        securityContextId: '',
        createdAt: '',
        updatedAt: '',
        securityContext: {
          runAsUser: 0,
          runAsGroup: 0,
          allowPrivilegeEscalation: false,
          readOnlyRootFilesystem: false,
          runAsNonRoot: false,
          capabilities: { add: [], drop: [] },
        },
      },
      build: {
        id: '',
        repository: '',
        tag: '',
        command: '',
        readOnlyAppStorage: false,
        securityContextId: '',
        createdAt: '',
        updatedAt: '',
        securityContext: {
          runAsUser: 0,
          runAsGroup: 0,
          allowPrivilegeEscalation: false,
          readOnlyRootFilesystem: false,
          runAsNonRoot: false,
          capabilities: { add: [], drop: [] },
        },
      },
      run: {
        id: '',
        repository: '',
        tag: '',
        command: '',
        readOnlyAppStorage: false,
        securityContextId: '',
        createdAt: '',
        updatedAt: '',
        securityContext: {
          runAsUser: 0,
          runAsGroup: 0,
          allowPrivilegeEscalation: false,
          readOnlyRootFilesystem: false,
          runAsNonRoot: false,
          capabilities: { add: [], drop: [] },
        },
      },
    })

    const headers = [
      { title: 'Name', value: 'name' },
      { title: 'Language', value: 'language' },
      /*
      { title: 'Fetch', value: 'fetch' },
      { title: 'Build', value: 'build' },
      { title: 'Run', value: 'run' },
      */
      { title: 'Actions', value: 'actions', sortable: false, align: 'end' as const },
    ]

    const loadRunpacks = async () => {
      loading.value = true
      try {
        const res = await axios.get('/api/config/runpacks')
        runpacks.value = res.data
      } catch (e) {
        runpacks.value = []
      }
      loading.value = false
    }

    const openEditDialog = (runpack: any) => {
      editedRunpack.value = JSON.parse(JSON.stringify(runpack))
      editDialog.value = true
    }

    const saveEdit = async () => {
      try {
        await axios.put(`/api/config/runpacks/${editedRunpack?.value?.id }`, editedRunpack.value)
        await loadRunpacks()
        editDialog.value = false
      } catch (e) {
        console.error('Error saving runpack:', e)
      }
    }

    const deleteRunpack = async (runpack: any) => {
      console.log('Deleting runpack:', runpack)
      try {
        await axios.delete(`/api/config/runpacks/${runpack.id}`)
        await loadRunpacks()
      } catch (e) {
        console.error('Error deleting runpack:', e)
      }
    }

    const openCreateDialog = () => {
      var newRunpack = <Runpack>{};
        
      createDialog.value = true
    }

    const saveCreate = async () => {
      try {
        // Remove empty id and timestamps before sending to backend
        const payload = JSON.parse(JSON.stringify(newRunpack.value))
        delete payload.id
        for (const stage of ['fetch', 'build', 'run']) {
          if (payload[stage]) {
            delete payload[stage].id
            delete payload[stage].createdAt
            delete payload[stage].updatedAt
            delete payload[stage].securityContextId
          }
        }
        await axios.post('/api/config/runpacks', payload)
        await loadRunpacks()
        createDialog.value = false
      } catch (e) {
        console.error('Error creating runpack:', e)
      }
    }

    onMounted(() => {
      loadRunpacks()
    })

    return {
      runpacks,
      headers,
      loading,
      search,
      openEditDialog,
      deleteRunpack,
      editDialog,
      editedRunpack,
      saveEdit,
      createDialog,
      newRunpack,
      openCreateDialog,
      saveCreate,
    }
  },
  components: {
      RunpacksItem
  },
  data() {
      return {
          show: false,
          panel: -1
      }
  },
})
</script>
