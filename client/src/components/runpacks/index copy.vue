<template>
  <v-container>


    <v-expansion-panels
        v-model="panel"
        multiple
      >
        <v-expansion-panel bg-color="rgb(var(--v-theme-cardBackground))" v-for="(buildpack, index) in runpacks" :key="index">
        <v-expansion-panel-title class="text-uppercase text-caption-2 font-weight-medium" color="cardBackground">{{ buildpack.name }}</v-expansion-panel-title>
        <v-expansion-panel-text>
        <v-row>
            <v-col
                cols="12"
                md="3"
            >
                <v-text-field
                v-model="buildpack.name"
                label="Name"
                required
                density="compact"
                ></v-text-field>
            </v-col>
            <v-col
                cols="12"
                md="3"
            >
                <v-text-field
                v-model="buildpack.language"
                label="Language"
                required
                density="compact"
                ></v-text-field>
            </v-col>
            <v-col
                cols="12"
                md="4"
            >
                <v-switch
                    v-model="buildpack.advanced"
                    label="Advanced"
                    density="compact"
                ></v-switch>
            </v-col>

            <v-col
                cols="12"
                md="2"
            >
                <v-btn
                    elevation="2"
                    fab
                    small
                    class="ma-2"
                    color="secondary"
                    @click="deleteBuildpack(buildpack)"
                    >
                        <v-icon color="primary">
                            mdi-delete
                        </v-icon>
                </v-btn>
            </v-col>
        </v-row>
        <v-divider class="ma-5"></v-divider>
        <RunpacksItem :buildpackStage="buildpack.fetch" title="Fetch" :advanced="buildpack.advanced"></RunpacksItem>

        <v-divider class="ma-5"></v-divider>
        <RunpacksItem :buildpackStage="buildpack.build" title="Build" :advanced="buildpack.advanced"></RunpacksItem>

        <v-divider class="ma-5"></v-divider>
        <RunpacksItem :buildpackStage="buildpack.run" title="Run" :advanced="buildpack.advanced"></RunpacksItem>
        
        </v-expansion-panel-text>
        </v-expansion-panel>
    </v-expansion-panels>

    
    <v-data-table
      :headers="headers"
      :items="runpacks"
      :loading="loading"
      class="elevation-0 border-0"
      item-key="id"
      :search="search"
    >
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

    <v-dialog v-model="editDialog" max-width="600px">
      <v-card>
        <v-card-title>Edit Runpack</v-card-title>
        <v-card-text>
          <v-text-field v-model="editedRunpack.name" label="Name"></v-text-field>
          <v-text-field v-model="editedRunpack.language" label="Language"></v-text-field>
          <v-text-field v-model="editedRunpack.fetch.repository" label="Fetch Repository"></v-text-field>
          <v-text-field v-model="editedRunpack.fetch.tag" label="Fetch Tag"></v-text-field>
          <v-text-field v-model="editedRunpack.build.repository" label="Build Repository"></v-text-field>
          <v-text-field v-model="editedRunpack.build.tag" label="Build Tag"></v-text-field>
          <v-text-field v-model="editedRunpack.run.repository" label="Run Repository"></v-text-field>
          <v-text-field v-model="editedRunpack.run.tag" label="Run Tag"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="editDialog = false">Abort</v-btn>
          <v-btn color="primary" @click="saveEdit">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="createDialog" max-width="600px">
      <v-card>
        <v-card-title>Create Runpack</v-card-title>
        <v-card-text>
          <v-text-field v-model="newRunpack.name" label="Name"></v-text-field>
          <v-text-field v-model="newRunpack.language" label="Language"></v-text-field>
          <v-text-field v-model="newRunpack.fetch.repository" label="Fetch Repository"></v-text-field>
          <v-text-field v-model="newRunpack.fetch.tag" label="Fetch Tag"></v-text-field>
          <v-text-field v-model="newRunpack.build.repository" label="Build Repository"></v-text-field>
          <v-text-field v-model="newRunpack.build.tag" label="Build Tag"></v-text-field>
          <v-text-field v-model="newRunpack.run.repository" label="Run Repository"></v-text-field>
          <v-text-field v-model="newRunpack.run.tag" label="Run Tag"></v-text-field>
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
    const runpacks = ref<any[]>([])
    const loading = ref(false)
    const search = ref('')
    const editDialog = ref(false)
    const createDialog = ref(false)
    const editedRunpack = ref<any>({})
    const newRunpack = ref<any>({
      name: '',
      language: '',
      fetch: { repository: '', tag: '' },
      build: { repository: '', tag: '' },
      run: { repository: '', tag: '' },
    })

    const headers = [
      { title: 'Name', value: 'name' },
      { title: 'Language', value: 'language' },
      { title: 'Fetch', value: 'fetch' },
      { title: 'Build', value: 'build' },
      { title: 'Run', value: 'run' },
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
        await axios.put(`/api/runpacks/${editedRunpack.value.id}`, editedRunpack.value)
        await loadRunpacks()
        editDialog.value = false
      } catch (e) {
        console.error('Error saving runpack:', e)
      }
    }

    const deleteRunpack = async (runpack: any) => {
      try {
        await axios.delete(`/api/runpacks/${runpack.id}`)
        await loadRunpacks()
      } catch (e) {
        console.error('Error deleting runpack:', e)
      }
    }

    const openCreateDialog = () => {
      newRunpack.value = {
        name: '',
        language: '',
        fetch: { repository: '', tag: '' },
        build: { repository: '', tag: '' },
        run: { repository: '', tag: '' },
      }
      createDialog.value = true
    }

    const saveCreate = async () => {
      try {
        await axios.post('/api/runpacks', newRunpack.value)
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
