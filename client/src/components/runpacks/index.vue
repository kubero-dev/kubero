<template>

  <v-container>
    <v-row>
      <v-col cols="12" md="12" lg="12" xl="6">
        <v-expansion-panels multiple elevation="0" class="mb-6">
          <v-expansion-panel>
            <v-expansion-panel-title class="text-h6 font-weight-bold">{{ $t('runpacks.helpTitle') }}</v-expansion-panel-title>
            <v-expansion-panel-text>
              <div v-html="$t('runpacks.helpText')"></div>
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
                  <th colspan="2" style="text-align:left; font-size:1.1em; padding:12px 8px 4px 8px;"><strong>{{ $t('runpacks.stages.fetch') }}</strong></th>
                </tr>
                <tr>
                  <td style="width:160px; vertical-align:top; padding:4px 8px;"><strong>{{ $t('runpacks.details.repository') }}:</strong></td>
                  <td style="vertical-align:top; padding:4px 8px;">{{ item.fetch?.repository }}<span v-if="item.fetch?.tag">:{{ item.fetch?.tag }}</span></td>
                </tr>
                <tr v-if="item.fetch?.command">
                  <td style="vertical-align:top; padding:4px 8px;"><strong>{{ $t('runpacks.details.command') }}:</strong></td>
                  <td style="vertical-align:top; padding:4px 8px;">{{ item.fetch.command }}</td>
                </tr>
                <tr>
                  <td style="vertical-align:top; padding:4px 8px;"><strong>{{ $t('runpacks.details.readOnlyAppStorage') }}:</strong></td>
                  <td style="vertical-align:top; padding:4px 8px;"><span :style="{color: item.fetch?.readOnlyAppStorage ? 'green' : 'inherit'}">{{ item.fetch?.readOnlyAppStorage ? $t('runpacks.details.yes') : $t('runpacks.details.no') }}</span></td>
                </tr>
                <tr v-if="item.fetch?.securityContext">
                  <td style="vertical-align:top; padding:4px 8px;"><strong>{{ $t('runpacks.details.securityContext') }}:</strong></td>
                  <td style="vertical-align:top; padding:4px 8px;">
                    <details>
                      <summary style="cursor:pointer;">{{ $t('runpacks.details.showDetails') }}</summary>
                      <div style="font-size:0.95em; margin-left:8px;">
                        <div>{{ $t('runpacks.details.runAsUser') }}: {{ item.fetch.securityContext.runAsUser }}</div>
                        <div>{{ $t('runpacks.details.runAsGroup') }}: {{ item.fetch.securityContext.runAsGroup }}</div>
                        <div>{{ $t('runpacks.details.allowPrivilegeEscalation') }}: {{ item.fetch.securityContext.allowPrivilegeEscalation ? $t('runpacks.details.yes') : $t('runpacks.details.no') }}</div>
                        <div>{{ $t('runpacks.details.readOnlyRootFilesystem') }}: {{ item.fetch.securityContext.readOnlyRootFilesystem ? $t('runpacks.details.yes') : $t('runpacks.details.no') }}</div>
                        <div>{{ $t('runpacks.details.runAsNonRoot') }}: {{ item.fetch.securityContext.runAsNonRoot ? $t('runpacks.details.yes') : $t('runpacks.details.no') }}</div>
                        <div>{{ $t('runpacks.details.capabilities') }}:
                          <div style="margin-left:8px;">{{ $t('runpacks.details.add') }}: <span v-if="item.fetch.securityContext.capabilities.add.length">{{ item.fetch.securityContext.capabilities.add.join(', ') }}</span><span v-else>-</span></div>
                          <div style="margin-left:8px;">{{ $t('runpacks.details.drop') }}: <span v-if="item.fetch.securityContext.capabilities.drop.length">{{ item.fetch.securityContext.capabilities.drop.join(', ') }}</span><span v-else>-</span></div>
                        </div>
                      </div>
                    </details>
                  </td>
                </tr>
                <tr style="background:rgba(0,0,0,0.03);">
                  <th colspan="2" style="text-align:left; font-size:1.1em; padding:18px 8px 4px 8px;"><strong>{{ $t('runpacks.stages.build') }}</strong></th>
                </tr>
                <tr>
                  <td style="width:160px; vertical-align:top; padding:4px 8px;"><strong>{{ $t('runpacks.details.repository') }}:</strong></td>
                  <td style="vertical-align:top; padding:4px 8px;">{{ item.build?.repository }}<span v-if="item.build?.tag">:{{ item.build?.tag }}</span></td>
                </tr>
                <tr v-if="item.build?.command">
                  <td style="vertical-align:top; padding:4px 8px;"><strong>{{ $t('runpacks.details.command') }}:</strong></td>
                  <td style="vertical-align:top; padding:4px 8px;">{{ item.build.command }}</td>
                </tr>
                <tr>
                  <td style="vertical-align:top; padding:4px 8px;"><strong>{{ $t('runpacks.details.readOnlyAppStorage') }}:</strong></td>
                  <td style="vertical-align:top; padding:4px 8px;"><span :style="{color: item.build?.readOnlyAppStorage ? 'green' : 'inherit'}">{{ item.build?.readOnlyAppStorage ? $t('runpacks.details.yes') : $t('runpacks.details.no') }}</span></td>
                </tr>
                <tr v-if="item.build?.securityContext">
                  <td style="vertical-align:top; padding:4px 8px;"><strong>{{ $t('runpacks.details.securityContext') }}:</strong></td>
                  <td style="vertical-align:top; padding:4px 8px;">
                    <details>
                      <summary style="cursor:pointer;">{{ $t('runpacks.details.showDetails') }}</summary>
                      <div style="font-size:0.95em; margin-left:8px;">
                        <div>{{ $t('runpacks.details.runAsUser') }}: {{ item.build.securityContext.runAsUser }}</div>
                        <div>{{ $t('runpacks.details.runAsGroup') }}: {{ item.build.securityContext.runAsGroup }}</div>
                        <div>{{ $t('runpacks.details.allowPrivilegeEscalation') }}: {{ item.build.securityContext.allowPrivilegeEscalation ? $t('runpacks.details.yes') : $t('runpacks.details.no') }}</div>
                        <div>{{ $t('runpacks.details.readOnlyRootFilesystem') }}: {{ item.build.securityContext.readOnlyRootFilesystem ? $t('runpacks.details.yes') : $t('runpacks.details.no') }}</div>
                        <div>{{ $t('runpacks.details.runAsNonRoot') }}: {{ item.build.securityContext.runAsNonRoot ? $t('runpacks.details.yes') : $t('runpacks.details.no') }}</div>
                        <div>{{ $t('runpacks.details.capabilities') }}:
                          <div style="margin-left:8px;">{{ $t('runpacks.details.add') }}: <span v-if="item.build.securityContext.capabilities.add.length">{{ item.build.securityContext.capabilities.add.join(', ') }}</span><span v-else>-</span></div>
                          <div style="margin-left:8px;">{{ $t('runpacks.details.drop') }}: <span v-if="item.build.securityContext.capabilities.drop.length">{{ item.build.securityContext.capabilities.drop.join(', ') }}</span><span v-else>-</span></div>
                        </div>
                      </div>
                    </details>
                  </td>
                </tr>
                <tr style="background:rgba(0,0,0,0.03);">
                  <th colspan="2" style="text-align:left; font-size:1.1em; padding:18px 8px 4px 8px;"><strong>{{ $t('runpacks.stages.run') }}</strong></th>
                </tr>
                <tr>
                  <td style="width:160px; vertical-align:top; padding:4px 8px;"><strong>{{ $t('runpacks.details.repository') }}:</strong></td>
                  <td style="vertical-align:top; padding:4px 8px;">{{ item.run?.repository }}<span v-if="item.run?.tag">:{{ item.run?.tag }}</span></td>
                </tr>
                <tr v-if="item.run?.command">
                  <td style="vertical-align:top; padding:4px 8px;"><strong>{{ $t('runpacks.details.command') }}:</strong></td>
                  <td style="vertical-align:top; padding:4px 8px;">{{ item.run.command }}</td>
                </tr>
                <tr>
                  <td style="vertical-align:top; padding:4px 8px;"><strong>{{ $t('runpacks.details.readOnlyAppStorage') }}:</strong></td>
                  <td style="vertical-align:top; padding:4px 8px;"><span :style="{color: item.run?.readOnlyAppStorage ? 'green' : 'inherit'}">{{ item.run?.readOnlyAppStorage ? $t('runpacks.details.yes') : $t('runpacks.details.no') }}</span></td>
                </tr>
                <tr v-if="item.run?.securityContext">
                  <td style="vertical-align:top; padding:4px 8px;"><strong>{{ $t('runpacks.details.securityContext') }}:</strong></td>
                  <td style="vertical-align:top; padding:4px 8px;">
                    <details>
                      <summary style="cursor:pointer;">{{ $t('runpacks.details.showDetails') }}</summary>
                      <div style="font-size:0.95em; margin-left:8px;">
                        <div>{{ $t('runpacks.details.runAsUser') }}: {{ item.run.securityContext.runAsUser }}</div>
                        <div>{{ $t('runpacks.details.runAsGroup') }}: {{ item.run.securityContext.runAsGroup }}</div>
                        <div>{{ $t('runpacks.details.allowPrivilegeEscalation') }}: {{ item.run.securityContext.allowPrivilegeEscalation ? $t('runpacks.details.yes') : $t('runpacks.details.no') }}</div>
                        <div>{{ $t('runpacks.details.readOnlyRootFilesystem') }}: {{ item.run.securityContext.readOnlyRootFilesystem ? $t('runpacks.details.yes') : $t('runpacks.details.no') }}</div>
                        <div>{{ $t('runpacks.details.runAsNonRoot') }}: {{ item.run.securityContext.runAsNonRoot ? $t('runpacks.details.yes') : $t('runpacks.details.no') }}</div>
                        <div>{{ $t('runpacks.details.capabilities') }}:
                          <div style="margin-left:8px;">{{ $t('runpacks.details.add') }}: <span v-if="item.run.securityContext.capabilities.add.length">{{ item.run.securityContext.capabilities.add.join(', ') }}</span><span v-else>-</span></div>
                          <div style="margin-left:8px;">{{ $t('runpacks.details.drop') }}: <span v-if="item.run.securityContext.capabilities.drop.length">{{ item.run.securityContext.capabilities.drop.join(', ') }}</span><span v-else>-</span></div>
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
        <span class="sr-only">{{ $t('runpacks.actions.create') }}</span>
      </v-btn>
    </div>

    <v-dialog v-model="editDialog" max-width="1000px">
      <v-card>
        <v-card-title>{{ $t('runpacks.actions.edit') }}</v-card-title>
        <v-card-text v-if="editedRunpack">
          <v-text-field v-model="editedRunpack.name" :label="$t('runpacks.form.name')"></v-text-field>
          <v-text-field v-model="editedRunpack.language" :label="$t('runpacks.form.language')"></v-text-field>
          <v-divider class="my-4"></v-divider>
          <v-header class="text-uppercase text-caption-2 font-weight-medium" color="cardBackground">{{ $t('runpacks.stages.fetch') }}</v-header>
          <RunpacksItem :buildpackStage="editedRunpack.fetch" title="Fetch" :advanced="true"></RunpacksItem>
          <v-divider class="my-4"></v-divider>
          <v-header class="text-uppercase text-caption-2 font-weight-medium" color="cardBackground">{{ $t('runpacks.stages.build') }}</v-header>
          <RunpacksItem :buildpackStage="editedRunpack.build" title="Build" :advanced="true"></RunpacksItem>
          <v-divider class="my-4"></v-divider>
          <v-header class="text-uppercase text-caption-2 font-weight-medium" color="cardBackground">{{ $t('runpacks.stages.run') }}</v-header>
          <RunpacksItem :buildpackStage="editedRunpack.run" title="Run" :advanced="true"></RunpacksItem>
        </v-card-text>
        <v-card-text v-else>
          <v-alert type="error" dismissible>
            {{ $t('runpacks.errors.load') }}
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="editDialog = false">{{ $t('runpacks.actions.abort') }}</v-btn>
          <v-btn color="primary" @click="saveEdit">{{ $t('runpacks.actions.save') }}</v-btn>
        </v-card-actions>
      </v-card>      
    </v-dialog>

    <v-dialog v-model="createDialog" max-width="1000px">
      <v-card>
        <v-card-title>{{ $t('runpacks.actions.create') }}</v-card-title>
        <v-card-text>
          <v-text-field v-model="newRunpack.name" :label="$t('runpacks.form.name')"></v-text-field>
          <v-text-field v-model="newRunpack.language" :label="$t('runpacks.form.language')"></v-text-field>
          <v-divider class="my-4"></v-divider>
          <v-header class="text-uppercase text-caption-2 font-weight-medium" color="cardBackground">{{ $t('runpacks.stages.fetch') }}</v-header>
          <RunpacksItem :buildpackStage="newRunpack.fetch" title="Fetch" :advanced="true"></RunpacksItem>
          <v-divider class="my-4"></v-divider>
          <v-header class="text-uppercase text-caption-2 font-weight-medium" color="cardBackground">{{ $t('runpacks.stages.build') }}</v-header>
          <RunpacksItem :buildpackStage="newRunpack.build" title="Build" :advanced="true"></RunpacksItem>
          <v-divider class="my-4"></v-divider>
          <v-header class="text-uppercase text-caption-2 font-weight-medium" color="cardBackground">{{ $t('runpacks.stages.run') }}</v-header>
          <RunpacksItem :buildpackStage="newRunpack.run" title="Run" :advanced="true"></RunpacksItem>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="createDialog = false">{{ $t('runpacks.actions.abort') }}</v-btn>
          <v-btn color="primary" @click="saveCreate">{{ $t('runpacks.actions.create') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import RunpacksItem from './runpacks-item.vue'

export default defineComponent({
  name: 'RunpackList',
  setup() {
    const { t } = useI18n()

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

    const headers = computed(() => [
      { title: t('runpacks.table.name'), value: 'name' },
      { title: t('runpacks.table.language'), value: 'language' },
      /*
      { title: t('runpacks.table.fetch'), value: 'fetch' },
      { title: t('runpacks.table.build'), value: 'build' },
      { title: t('runpacks.table.run'), value: 'run' },
      */
      { title: t('runpacks.table.actions'), value: 'actions', sortable: false, align: 'end' as const },
    ])

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
