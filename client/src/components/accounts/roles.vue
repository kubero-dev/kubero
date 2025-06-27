<template>
  <v-container>
    <v-data-table
      :headers="headers"
      :items="roles"
      :loading="loading"
      class="elevation-0 border-0"
      item-key="id"
      :search="search"
    >
      <template #top>
        <v-text-field
          v-model="search"
          label="Search Roles"
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
        <span>
          <v-chip
            class="ma-2"
            color="primary"
            label
          >
            <v-icon icon="mdi-account-circle-outline" start></v-icon>
            {{ item.name}}
          </v-chip>
        </span>
      </template>
      <template v-slot:[`item.permissions`]="{ item }">
        <span v-for="permission in item.permissions" :key="permission.id">
          {{ permission.resource }}: {{ permission.action }}
        </span>
      </template>
      <template v-slot:[`item.permissionsApp`]="{ item }">
        <span>
          <v-icon
            color="primary"
          >
            {{getResourcePermissions(item.permissions, 'app') }}
          </v-icon>
        </span>
      </template>
      <template v-slot:[`item.permissionsPipeline`]="{ item }">
        <span>
          <v-icon
            color="primary"
          >
            {{getResourcePermissions(item.permissions, 'pipeline') }}
          </v-icon>
        </span>
      </template>
      <template v-slot:[`item.permissionsAccount`]="{ item }">
        <span>
          <v-icon
            color="primary"
          >
            {{getResourcePermissions(item.permissions, 'account') }}
          </v-icon>
        </span>
      </template>
      <template v-slot:[`item.permissionsConfig`]="{ item }">
        <span>
          <v-icon
            color="primary"
          >
            {{getResourcePermissions(item.permissions, 'config') }}
          </v-icon>
        </span>
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <v-btn
          elevation="0"
          variant="tonal"
          size="small"
          class="ma-2"
          color="secondary"
          @click="openEditRoleDialog(item)"
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
          @click="deleteRole(item)"
        >
          <v-icon color="primary">
            mdi-delete
          </v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <!-- Button to add a role -->
    <div style="display: flex; justify-content: flex-end; margin-top: 16px;">
      <v-btn
        fab
        color="primary"
        style="margin-right: 6px;"
        @click="openCreateDialog"
      >
        <v-icon>mdi-plus</v-icon>
        <span class="sr-only">Create Role</span>
      </v-btn>
    </div>

    <!-- Dialog to edit a role -->
    <v-dialog v-model="editDialog" max-width="500px">
      <v-card>
        <v-card-title>Edit Role</v-card-title>
        <v-card-text>
          <v-text-field v-model="editedRole.name" label="Role Name"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="editDialog = false">Abort</v-btn>
          <v-btn color="primary" @click="saveEdit">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog for a new Role -->
    <v-dialog v-model="createDialog" max-width="500px">
      <v-card>
        <v-card-title>Create Role</v-card-title>
        <v-card-text>
          <v-text-field v-model="newRole.name" label="Role Name"></v-text-field>
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
  name: 'RolesTable',
  setup() {
    interface Role {
      id: string | number;
      name: string;
      permissions?: Permission[]; 
    }
    interface Permission {
      id: string | number;
      resource: string;
      action: string;
    }
    const roles = ref<Role[]>([])
    const loading = ref(false)
    const search = ref('')
    const editDialog = ref(false)
    const createDialog = ref(false)
    const editedRole = ref<Role | any>({})
    const newRole = ref({
      name: '',
    })

    const headers = [
      { title: 'Role', value: 'name' },
      //{ text: 'Permissions', value: 'permissions' },
      { title: 'App', value: 'permissionsApp', align: 'center' },
      { title: 'Pipeline', value: 'permissionsPipeline', align: 'center' },
      { title: 'Accounts', value: 'permissionsAccount', align: 'center' },
      { title: 'Configuration', value: 'permissionsConfig', align: 'center' },
      //{ text: 'Actions', value: 'actions', sortable: false, align: 'end' },
    ]

    const loadRoles = async () => {
      loading.value = true
      try {
        const res = await axios.get('/api/roles')
        roles.value = res.data
      } catch (e) {
        roles.value = []
      }
      loading.value = false
    }

    const openEditRoleDialog = (role: Role) => {
      editedRole.value = { ...role }
      editDialog.value = true
    }

    const saveEdit = async () => {
      try {
        await axios.put(`/api/roles/${editedRole.value.id}`, editedRole.value)
        await loadRoles()
        editDialog.value = false
      } catch (e) {
        console.error('Error saving role:', e)
      }
    }

    const deleteRole = async (role: Role) => {
      try {
        await axios.delete(`/api/roles/${role.id}`)
        await loadRoles()
      } catch (e) {
        console.error('Error deleting role:', e)
      }
    }

    const openCreateDialog = () => {
      newRole.value = { name: '' }
      createDialog.value = true
    }

    const saveCreate = async () => {
      try {
        await axios.post('/api/roles', newRole.value)
        await loadRoles()
        createDialog.value = false
      } catch (e) {
        console.error('Error creating role:', e)
      }
    }
/*
    const getResources = async () => {
      try {
        const res = await axios.get('/api/roles/resources')
        return res.data
      } catch (e) {
        console.error('Error fetching resources:', e)
        return []
      }
    }
*/
    const getResourcePermissions = (permissions: any, resource: string) => {
      for (const permission of permissions) {
        if (permission.resource === resource) {
          switch (permission.action) {
            case 'write':
              return 'mdi-pencil';
              break;
            case 'read':
              return 'mdi-eye';
              break;
          }
          return 
        }
      }
      return 'mdi-cancel'
    }
      
    onMounted(() => {
      loadRoles()
    })

    return {
      roles,
      headers,
      loading,
      search,
      editDialog,
      createDialog,
      editedRole,
      newRole,
      openEditRoleDialog,
      saveEdit,
      deleteRole,
      openCreateDialog,
      saveCreate,
      getResourcePermissions,
    }
  },
})
</script>
