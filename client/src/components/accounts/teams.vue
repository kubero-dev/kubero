<template>
  <v-container>
    <v-data-table
      :headers="headers"
      :items="teams"
      :loading="loading"
      class="elevation-0 border-0"
      item-key="id"
      :search="search"
    >
      <template #top>
        <v-text-field
          v-model="search"
          label="Search Teams"
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
        <v-chip
          class="ma-2"
          color="grey"
          size="small"
        >
          {{ item.name }}
        </v-chip>
      </template>
      <template v-slot:[`item.description`]="{ item }">
        <span v-if="item.description">{{ item.description }}</span>
        <span v-else class="text--secondary">-</span>
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <v-btn
          elevation="0"
          variant="tonal"
          size="small"
          class="ma-2"
          color="secondary"
          @click="openEditTeamDialog(item)"
        >
          <v-icon color="primary">
            mdi-pencil
          </v-icon>
        </v-btn>
        <v-btn
          elevation="0"
          variant="tonal"
          size="small"
          class="ma-2"
          color="secondary"
          @click="deleteTeam(item)"
        >
          <v-icon color="primary">
            mdi-delete
          </v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <!-- Button to add a group -->
    <div style="display: flex; justify-content: flex-end; margin-top: 16px;">
      <v-btn
        fab
        color="primary"
        style="margin-right: 6px;"
        @click="openCreateDialog"
      >
        <v-icon>mdi-plus</v-icon>
        <span class="sr-only">Create Team</span>
      </v-btn>
    </div>

    <!-- Dialog to edit a group -->
    <v-dialog v-model="editDialog" max-width="500px">
      <v-card>
        <v-card-title>Edit Team</v-card-title>
        <v-card-text>
          <v-text-field v-model="editedTeam.name" label="Team Name"></v-text-field>
          <v-text-field
            v-model="editedTeam.description"
            label="Description"
            type="text"
            multiline
            rows="2"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="editDialog = false">Abort</v-btn>
          <v-btn color="primary" @click="saveEdit">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog for a new Team -->
    <v-dialog v-model="createDialog" max-width="500px">
      <v-card>
        <v-card-title>Create Team</v-card-title>
        <v-card-text>
          <v-text-field v-model="newTeam.name" label="Team Name"></v-text-field>
          <v-text-field
            v-model="newTeam.description"
            label="Description"
            type="text"
            multiline
            rows="2"
          ></v-text-field>
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
  name: 'TeamsTable',
  setup() {
    interface Team {
      id?: string;
      name: string;
      description?: string;
    }
    const teams = ref<Team[]>([])
    const loading = ref(false)
    const search = ref('')
    const editDialog = ref(false)
    const createDialog = ref(false)
    const editedTeam = ref<Team | any>({})
    const newTeam = ref(<Team>({ name: '', description: '' }))

    const headers = [
      { title: 'Team', value: 'name' },
      { title: 'Description', value: 'description' },
      { title: 'Actions', value: 'actions', sortable: false, align: 'end' as const },
    ]

    const loadTeams = async () => {
      loading.value = true
      try {
        const res = await axios.get('/api/groups')
        teams.value = res.data
      } catch (e) {
        teams.value = []
      }
      loading.value = false
    }

    const openEditTeamDialog = (group: Team) => {
      editedTeam.value = { ...group }
      editDialog.value = true
    }

    const saveEdit = async () => {
      try {
        await axios.put(`/api/groups/${editedTeam.value.id}`, editedTeam.value)
        await loadTeams()
        editDialog.value = false
      } catch (e) {
        console.error('Error saving group:', e)
      }
    }

    const deleteTeam = async (group: Team) => {
      try {
        await axios.delete(`/api/groups/${group.id}`)
        await loadTeams()
      } catch (e) {
        console.error('Error deleting group:', e)
      }
    }

    const openCreateDialog = () => {
      newTeam.value = { name: '' }
      createDialog.value = true
    }

    const saveCreate = async () => {
      try {
        await axios.post('/api/groups', newTeam.value)
        await loadTeams()
        createDialog.value = false
      } catch (e) {
        console.error('Error creating group:', e)
      }
    }

    onMounted(() => {
      loadTeams()
    })

    return {
      teams,
      headers,
      loading,
      search,
      editDialog,
      createDialog,
      editedTeam,
      newTeam,
      openEditTeamDialog,
      saveEdit,
      deleteTeam,
      openCreateDialog,
      saveCreate,
    }
  },
})
</script>
