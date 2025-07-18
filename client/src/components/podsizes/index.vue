<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="12" lg="12" xl="6">
        <v-expansion-panels multiple elevation="0" class="mb-6">
          <v-expansion-panel>
            <v-expansion-panel-title class="text-h6 font-weight-bold">What are PodSizes?</v-expansion-panel-title>
            <v-expansion-panel-text>
              <p>
                <strong>PodSizes</strong> define the resource requests and limits for your application's pods in Kubero. You can create, edit, and delete pod sizes to match your workload requirements.
              </p>
              <p class="mt-2">
                <a href="https://www.kubero.dev/docs/usermanual/podsizes/" target="_blank" rel="noopener">Read more in the Kubero documentation</a>
              </p>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
    <v-data-table
      :headers="headers"
      :items="podsizes"
      :loading="loading"
      class="elevation-0 border-0"
      item-key="id"
      item-value="name"
      :search="search"
      show-expand
    >
      <template v-slot:[`item.name`]="{ item }">
        <span>{{ item.name }}</span>
      </template>
      <template v-slot:[`item.description`]="{ item }">
        <span>{{ item.description }}</span>
      </template>
      <template v-slot:[`item.resources`]="{ item }">
        <span>
          Requests: CPU {{ item.resources.requests.cpu }}, Mem {{ item.resources.requests.memory }}<br>
          Limits: CPU {{ item.resources.limits.cpu }}, Mem {{ item.resources.limits.memory }}
        </span>
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <v-btn elevation="0" variant="tonal" size="small" class="ma-2" @click="openEditDialog(item)">
          <v-icon color="primary">mdi-pencil</v-icon>
        </v-btn>
        <v-btn elevation="0" variant="tonal" size="small" class="ma-2" @click="deletePodsize(item)">
          <v-icon color="primary">mdi-delete</v-icon>  
        </v-btn>
      </template>
      <template v-slot:expanded-row="{ columns, item }">
        <tr>
          <td :colspan="columns.length" style="padding:0;">
            <v-card class="ma-2 pa-2" outlined color="cardBackground">
              <v-row>
                <v-col cols="12" md="6">
                  <v-list density="compact" style="background: inherit;">
                    <v-list-item>
                      <v-list-item-title class="font-weight-bold">Requests</v-list-item-title>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-subtitle>CPU</v-list-item-subtitle>
                      <v-list-item-title>{{ item.resources.requests.cpu }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-subtitle>Memory</v-list-item-subtitle>
                      <v-list-item-title>{{ item.resources.requests.memory }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-col>
                <v-col cols="12" md="6">
                  <v-list density="compact" style="background: inherit;">
                    <v-list-item>
                      <v-list-item-title class="font-weight-bold">Limits</v-list-item-title>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-subtitle>CPU</v-list-item-subtitle>
                      <v-list-item-title>{{ item.resources.limits.cpu }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-subtitle>Memory</v-list-item-subtitle>
                      <v-list-item-title>{{ item.resources.limits.memory }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-col>
              </v-row>
              <v-divider class="my-2"></v-divider>
              <v-row>
                <v-col cols="12">
                  <v-list density="compact" style="background: inherit;">
                    <v-list-item>
                      <v-list-item-title class="font-weight-bold">Description</v-list-item-title>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title>{{ item.description }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-col>
              </v-row>
            </v-card>
          </td>
        </tr>
      </template>
    </v-data-table>
    <div style="display: flex; justify-content: flex-end; margin-top: 16px;">
      <v-btn fab color="primary" style="margin-right: 6px;" @click="openCreateDialog">
        <v-icon>mdi-plus</v-icon>
        <span class="sr-only">Create PodSize</span>
      </v-btn>
    </div>
    <v-dialog v-model="editDialog" max-width="600px">
      <v-card>
        <v-card-title>Edit PodSize</v-card-title>
        <v-card-text v-if="editedPodsize">
          <v-text-field v-model="editedPodsize.name" label="Name"></v-text-field>
          <v-text-field v-model="editedPodsize.description" label="Description"></v-text-field>
          <v-text-field v-model="editedPodsize.resources.requests.cpu" label="Requests CPU"></v-text-field>
          <v-text-field v-model="editedPodsize.resources.requests.memory" label="Requests Memory"></v-text-field>
          <v-text-field v-model="editedPodsize.resources.limits.cpu" label="Limits CPU"></v-text-field>
          <v-text-field v-model="editedPodsize.resources.limits.memory" label="Limits Memory"></v-text-field>
        </v-card-text>
        <v-card-text v-else>
          <v-alert type="error" dismissible>
            Error loading podsize details for editing.
          </v-alert>
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
        <v-card-title>Create PodSize</v-card-title>
        <v-card-text>
          <v-text-field v-model="newPodsize.name" label="Name"></v-text-field>
          <v-text-field v-model="newPodsize.description" label="Description"></v-text-field>
          <v-text-field v-model="newPodsize.resources.requests.cpu" label="Requests CPU"></v-text-field>
          <v-text-field v-model="newPodsize.resources.requests.memory" label="Requests Memory"></v-text-field>
          <v-text-field v-model="newPodsize.resources.limits.cpu" label="Limits CPU"></v-text-field>
          <v-text-field v-model="newPodsize.resources.limits.memory" label="Limits Memory"></v-text-field>
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

export default defineComponent({
  name: 'PodsizeList',
  setup() {
    type PodsizeResources = {
      requests: { cpu: string; memory: string }
      limits: { cpu: string; memory: string }
    }
    type Podsize = {
      id?: string
      name: string
      description: string
      resources: PodsizeResources
    }
    const podsizes = ref<Podsize[]>([])
    const loading = ref(false)
    const search = ref('')
    const editDialog = ref(false)
    const createDialog = ref(false)
    const editedPodsize = ref<Podsize | null>(null)
    const newPodsize = ref<Podsize>({
      name: '',
      description: '',
      resources: {
        requests: { cpu: '', memory: '' },
        limits: { cpu: '', memory: '' },
      },
    })
    const headers = [
      { title: 'Name', value: 'name' },
      { title: 'Description', value: 'description' },
      //{ title: 'Resources', value: 'resources' },
      { title: 'Actions', value: 'actions', sortable: false, align: 'end' as const },
    ]
    const loadPodsizes = async () => {
      loading.value = true
      try {
        const res = await axios.get('/api/config/podsizes')
        podsizes.value = res.data
      } catch (e) {
        podsizes.value = []
      }
      loading.value = false
    }
    const openEditDialog = (podsize: any) => {
      editedPodsize.value = JSON.parse(JSON.stringify(podsize))
      editDialog.value = true
    }
    const saveEdit = async () => {
      try {
        await axios.put(`/api/config/podsizes/${editedPodsize?.value?.id }`, editedPodsize.value)
        await loadPodsizes()
        editDialog.value = false
      } catch (e) {
        console.error('Error saving podsize:', e)
      }
    }
    const deletePodsize = async (podsize: any) => {
      try {
        await axios.delete(`/api/config/podsizes/${podsize.id}`)
        await loadPodsizes()
      } catch (e) {
        console.error('Error deleting podsize:', e)
      }
    }
    const openCreateDialog = () => {
      newPodsize.value = {
        name: '',
        description: '',
        resources: {
          requests: { cpu: '', memory: '' },
          limits: { cpu: '', memory: '' },
        },
      }
      createDialog.value = true
    }
    const saveCreate = async () => {
      try {
        const payload = JSON.parse(JSON.stringify(newPodsize.value))
        delete payload.id
        await axios.post('/api/config/podsizes', payload)
        await loadPodsizes()
        createDialog.value = false
      } catch (e) {
        console.error('Error creating podsize:', e)
      }
    }
    onMounted(() => {
      loadPodsizes()
    })
    return {
      podsizes,
      headers,
      loading,
      search,
      openEditDialog,
      deletePodsize,
      editDialog,
      editedPodsize,
      saveEdit,
      createDialog,
      newPodsize,
      openCreateDialog,
      saveCreate,
    }
  },
})
</script>

<style scoped>
</style>
