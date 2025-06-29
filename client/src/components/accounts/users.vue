<template>
  <v-container>
    <v-data-table
      :headers="headers"
      :items="users"
      :loading="loading"
      class="elevation-0 border-0"
      item-key="id"
      :search="search"
    >
      <template #top>
        <v-text-field
          v-model="search"
          label="Search Users"
          prepend-inner-icon="mdi-magnify"
          single-line
          hide-details
          outlined
          class="mx-0 mt-2"
          clearable
          density="compact"
        ></v-text-field>
      </template>
      <template v-slot:[`item.isActive`]="{ item }">
        <v-chip :color="item.isActive ? 'green' : 'red'" dark>
          {{ item.isActive ? 'Aktive' : 'Disabled' }}
        </v-chip>
      </template>
      <template v-slot:[`item.username`]="{ item }">
        <span>{{ item.username }}</span>
      </template>
      <template v-slot:[`item.name`]="{ item }">
        <span>{{ item.firstName }} {{ item.lastName }}</span>
      </template>
      <template v-slot:[`item.role`]="{ item }">
        <span v-if="item.role">
          <v-chip
            class="ma-2"
            color="primary"
            label
          >
            <v-icon icon="mdi-account-circle-outline" start></v-icon>
            {{ item.role.name}}
          </v-chip>
        </span>
        <span v-else></span>
      </template>
      <template v-slot:[`item.userGroups`]="{ item }">
        <span v-if="item.userGroups && item.userGroups.length">
          <span v-for="team in item.userGroups" :key="team.id">
            <v-chip
              class="ma-2"
              color="grey"
              size="small"
              closable-disabled
              @click:close="deleteGroupFromUser(team, item)"
            >
              {{ team.name }}
            </v-chip>
          </span>
        </span>
        <span v-else></span>
        <v-btn
          class="ma-2"
          color="grey"
          size="small"
          icon="mdi-plus"
          density="compact"
          variant="tonal"
          style="display: none;"
          >
        </v-btn>
      </template>
      <template v-slot:[`item.username`]="{ item }">
        <v-avatar size="32" class="mr-2">
          <v-img :src="`/api/users/${item.id}/avatar`" />
        </v-avatar>
        <b><span>{{ item.username }}</span></b>
      </template>
      <template v-slot:[`item.createdAt`]="{ item }">
        {{ formatDate(item.createdAt) }}
      </template>
      <template v-slot:[`item.updatedAt`]="{ item }">
        {{ formatDate(item.updatedAt) }}
      </template>
      <template v-slot:[`item.actions`]="{ item }">

        <v-btn
          elevation="0"
          variant="tonal"
          size="small"
          class="ma-2"
          @click="deleteUser(item)"
          :disabled="item.username === 'admin' || item.username === 'system'"
        >
          <v-icon color="primary">
            mdi-delete
          </v-icon>
        </v-btn>
        
        <v-btn
          elevation="0"
          variant="tonal"
          size="small"
          class="ma-2"
          @click="openChangePasswordDialog(item)"
          :disabled="item.username === 'system'"
        >
          <v-icon color="primary">
            mdi-lock-reset
          </v-icon>
        </v-btn>

        <v-btn
          elevation="0"
          variant="tonal"
          size="small"
          class="ma-2"
          @click="openEditUserDialog(item)"
          :disabled="item.username === 'admin' || item.username === 'system'"
          >
            <v-icon color="primary">
              mdi-pencil
            </v-icon>
        </v-btn>
        
      </template>
    </v-data-table>

    <!-- Button to add a user -->
    <div style="display: flex; justify-content: flex-end; margin-top: 16px;">
      <v-btn
        fab
        color="primary"
        style="margin-right: 6px;"
        @click="openCreateDialog"
      >
        <v-icon>mdi-plus</v-icon>
        <span class="sr-only">Create User</span>
      </v-btn>
    </div>

    <!-- Dialog to edit a user -->
    <v-dialog v-model="editDialog" max-width="500px">
      <v-card>
        <v-card-title>Edit User</v-card-title>
        <v-card-text>
          <v-text-field v-model="editedUser.username" label="Username"></v-text-field>
          <v-text-field v-model="editedUser.firstName" label="First Name"></v-text-field>
          <v-text-field v-model="editedUser.lastName" label="Last Name"></v-text-field>
          <v-text-field v-model="editedUser.email" label="E-Mail"></v-text-field>
          <v-switch v-model="editedUser.isActive" label="Aktive"></v-switch>
          <v-select
            v-model="editedUser.role"
            :items="roles"
            item-title="name"
            item-value="id"
            label="Role"
            clearable
          ></v-select>
          <v-select
            v-model="editedUser.userGroups"
            :items="teams"
            item-title="name"
            item-value="id"
            label="Teams"
            multiple
            clearable
          >
            <template v-slot:selection="{ item, index }">
              <v-chip :text="item.title"></v-chip>
            </template>
          </v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="editDialog = false">Abort</v-btn>
          <v-btn color="primary" @click="saveEdit">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog for a new User -->
    <v-dialog v-model="createDialog" max-width="500px">
      <v-card>
        <v-card-title>Create User</v-card-title>
        <v-card-text>
          <v-text-field v-model="newUser.username" label="Username"></v-text-field>
          <v-text-field v-model="newUser.firstName" label="First Name"></v-text-field>
          <v-text-field v-model="newUser.lastName" label="Last Name"></v-text-field>
          <v-text-field v-model="newUser.email" label="E-Mail"></v-text-field>
          <v-text-field v-model="newUser.password" label="Password"></v-text-field>
          <v-switch v-model="newUser.isActive" label="Aktive"></v-switch>
          <v-select
            v-model="newUser.role"
            :items="roles"
            item-title="name"
            item-value="id"
            label="Role"
            clearable
          ></v-select>
          <v-select
            v-model="newUser.userGroups"
            :items="teams"
            item-title="name"
            item-value="id"
            label="Teams"
            multiple
            clearable
          >
            <template v-slot:selection="{ item, index }">
              <v-chip :text="item.title"></v-chip>
            </template>
          </v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="createDialog = false">Abort</v-btn>
          <v-btn color="primary" @click="saveCreate">Create</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog to change password -->
    <v-dialog v-model="changePasswordDialog" max-width="500px">
      <v-card>
        <v-card-title>Change Password for {{ editedUser.username }}</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="editedUser.password"
            label="New Password"
            type="password"
          ></v-text-field>
          <v-text-field
            v-model="editedUser.confirmPassword"
            label="Confirm Password"
            type="password"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="changePasswordDialog = false">Abort</v-btn>
          <v-btn color="primary" @click="saveChangePassword">Change Password</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import axios from 'axios'

export default defineComponent({
  name: 'UserList',
  setup() {
    interface User {
      id: string | number;
      username: string;
      email: string;
      firstName: string;
      lastName: string;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
      role?: {
        id: number;
        name: string;
      };
      userGroups?: {
        id: number;
        name: string;
      }[];
    }
    interface Team {
      id: string | number;
      name: string;
    }
    interface Role {
      id: string | number;
      name: string;
    }
    const users = ref<User[]>([])
    const loading = ref(false)
    const search = ref('')
    const editDialog = ref(false)
    const createDialog = ref(false)
    const changePasswordDialog = ref(false)
    const editedUser = ref<User | any>({})
    const newUser = ref({
      username: '',
      firstName: '',
      lastName: '',
      email: '',
      isActive: true,
      password: '',
      role: null,
      userGroups: [],
    })

    const teams = ref<Team[]>([])
    const roles = ref<Role[]>([])

    const headers = [
      { title: 'Status', value: 'isActive' },
      { title: 'Username', value: 'username' },
      { title: 'Name', value: 'name' },
      //{ title: 'First Name', value: 'firstName' },
      //{ title: 'Last Name', value: 'lastName' },
      { title: 'E-Mail', value: 'email' },
      { title: 'Role', value: 'role', sortable: false },
      { title: 'Teams', value: 'userGroups', sortable: false },
      /*
      { text: 'Created', value: 'createdAt' },
      { text: 'Updated', value: 'updatedAt' },
      */
      { title: 'Actions', value: 'actions', sortable: false, align: 'end' as const },
    ]

    const loadUsers = async () => {
      loading.value = true
      try {
        const res = await axios.get('/api/users')
        users.value = res.data
      } catch (e) {
        users.value = []
      }
      loading.value = false
    }

    const loadTeams = async () => {
      try {
        const res = await axios.get('/api/groups')
        teams.value = res.data
      } catch (e) {
        teams.value = []
      }
    }
    const loadRoles = async () => {
      try {
        const res = await axios.get('/api/roles')
        roles.value = res.data
      } catch (e) {
        roles.value = []
      }
    }

    const openEditUserDialog = (user: User) => {
      editedUser.value = { ...user }
      editDialog.value = true
    }

    const saveEdit = async () => {
      try {
        await axios.put(`/api/users/${editedUser.value.id}`, editedUser.value)
        await loadUsers()
        editDialog.value = false
      } catch (e) {
        console.error('Error saving user:', e)
      }
    }

    const deleteUser = async (user: User) => {
      try {
        await axios.delete(`/api/users/${user.id}`)
        await loadUsers()
      } catch (e) {
        console.error('Error deleting user:', e)
      }
    }

    const formatDate = (dateStr: string) => {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return date.toLocaleString('de-DE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const openCreateDialog = () => {
      newUser.value = {
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        isActive: true,
        role: null,
        userGroups: [],
      }
      createDialog.value = true
    }

    const saveCreate = async () => {
      try {
        await axios.post('/api/users', newUser.value)
        await loadUsers()
        createDialog.value = false
      } catch (e) {
        console.error('Error creating user:', e)
      }
    }

    const openChangePasswordDialog = (user: User) => {
      editedUser.value = { ...user }
      changePasswordDialog.value = true
    }

    const saveChangePassword = async () => {
      if (editedUser.value.password !== editedUser.value.confirmPassword) {
        alert('Passwords do not match!')
        return
      }
      try {
        await axios.put(`/api/users/${editedUser.value.id}/password`, {
          password: editedUser.value.password,
        })
        changePasswordDialog.value = false
      } catch (e) {
        console.error('Error changing password:', e)
      }
    }

    const deleteGroupFromUser = async (team: any, user: User) => {
      try {
        await axios.delete(`/api/users/${user.id}/groups/${team.id}`)
        await loadUsers()
      } catch (e) {
        console.error('Error removing group from user:', e)
      }
    }

    onMounted(() => {
      loadUsers()
      loadTeams()
      loadRoles()
    })

    return {
      users,
      headers,
      loading,
      search,
      openEditUserDialog,
      deleteUser,
      editDialog,
      editedUser,
      saveEdit,
      formatDate,
      createDialog,
      newUser,
      openCreateDialog,
      changePasswordDialog,
      openChangePasswordDialog,
      saveChangePassword,
      deleteGroupFromUser,
      saveCreate,
      roles,
      teams,
    }
  },
})
</script>