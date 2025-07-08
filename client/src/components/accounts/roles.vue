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
            {{getResourcePermissions(item.permissions, 'user') }}
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
      <template v-slot:[`item.permissionsAudit`]="{ item }">
        <span>
          <v-icon
            color="primary"
          >
            {{getResourcePermissions(item.permissions, 'audit') }}
          </v-icon>
        </span>
      </template>
      <template v-slot:[`item.permissionsSecurity`]="{ item }">
        <span>
          <v-icon
            color="primary"
          >
            {{getResourcePermissions(item.permissions, 'security') }}
          </v-icon>
        </span>
      </template>
      <template v-slot:[`item.permissionsToken`]="{ item }">
        <span>
          <v-icon
            color="primary"
          >
            {{getResourcePermissions(item.permissions, 'token') }}
          </v-icon>
        </span>
      </template>
      <template v-slot:[`item.permissionsConsole`]="{ item }">
        <span>
          <v-icon
            color="primary"
          >
            {{getResourcePermissions(item.permissions, 'console') }}
          </v-icon>
        </span>
      </template>
      <template v-slot:[`item.permissionsLogs`]="{ item }">
        <span>
          <v-icon
            color="primary"
          >
            {{getResourcePermissions(item.permissions, 'logs') }}
          </v-icon>
        </span>
      </template>
      <template v-slot:[`item.permissionsReboot`]="{ item }">
        <span>
          <v-icon
            color="primary"
          >
            {{getResourcePermissions(item.permissions, 'reboot') }}
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
          :disabled="item.name === 'admin' || !writeUserPermission"
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
          :disabled="item.name === 'admin' || item.name === 'guest' || item.name === 'member' || !writeUserPermission"
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
        :disabled="!writeUserPermission"
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
          <v-text-field v-model="editedRole.description" label="Descrioption"></v-text-field>
          <v-table density="compact" class="mb-4">
            <tbody>
              <tr>
                <td>App Permissions</td>
                <td>
                  <v-radio-group v-model="editedRole.permissions[0].action" inline>
                    <v-radio label="none" value="none"></v-radio>
                    <v-radio label="read" value="read"></v-radio>
                    <v-radio label="write" value="write"></v-radio>
                  </v-radio-group>
                </td>
              </tr>
              <tr>
                <td>Pipeline Permissions</td>
                <td>
                  <v-radio-group v-model="editedRole.permissions[1].action" inline>
                    <v-radio label="none" value="none"></v-radio>
                    <v-radio label="read" value="read"></v-radio>
                    <v-radio label="write" value="write"></v-radio>
                  </v-radio-group>
                </td>
              </tr>
              <tr>
                <td>User Permissions</td>
                <td>
                  <v-radio-group v-model="editedRole.permissions[2].action" inline>
                    <v-radio label="none" value="none"></v-radio>
                    <v-radio label="read" value="read"></v-radio>
                    <v-radio label="write" value="write"></v-radio>
                  </v-radio-group>
                </td>
              </tr>
              <tr>
                <td>Config Permissions</td>
                <td>
                  <v-radio-group v-model="editedRole.permissions[3].action" inline>
                    <v-radio label="none" value="none"></v-radio>
                    <v-radio label="read" value="read"></v-radio>
                    <v-radio label="write" value="write"></v-radio>
                  </v-radio-group>
                </td>
              </tr>
              <tr>
                <td>Security Permissions</td>
                <td>
                  <v-radio-group v-model="editedRole.permissions[4].action" inline>
                    <v-radio label="none" value="none"></v-radio>
                    <v-radio label="read" value="read"></v-radio>
                    <v-radio label="write" value="write"></v-radio>
                  </v-radio-group>
                </td>
              </tr>
              <tr>
                <td>Token Permissions</td>
                <td>
                  <v-radio-group v-model="editedRole.permissions[5].action" inline>
                    <v-radio label="none" value="none"></v-radio>
                    <v-radio label="own" value="ok"></v-radio>
                    <v-radio label="all" value="write"></v-radio>
                  </v-radio-group>
                </td>
              </tr>
              <tr>
                <td>Audit</td>
                <td>
                  <v-switch color="primary" value="ok" v-model="editedRole.permissions[6].action" label=""></v-switch>
                </td>
              </tr>
              <tr>
                <td>Console</td>
                <td>
                  <v-switch color="primary" value="ok" v-model="editedRole.permissions[7].action" label=""></v-switch>
                </td>
              </tr>
              <tr>
                <td>Logs</td>
                <td>
                  <v-switch color="primary" value="ok" v-model="editedRole.permissions[8].action" label=""></v-switch>
                </td>
              </tr>
              <tr>
                <td>Reboot</td>
                <td>
                  <v-switch color="primary" value="ok" v-model="editedRole.permissions[9].action" label=""></v-switch>
                </td>
              </tr>
            </tbody>
          </v-table>
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
          <v-text-field v-model="newRole.description" label="Descrioption"></v-text-field>
          <v-table density="compact" class="mb-4">
            <tbody>
              <tr>
                <td>App Permissions</td>
                <td>
                  <v-radio-group v-model="newRole.permissions[0].action" inline>
                    <v-radio label="none" value="none"></v-radio>
                    <v-radio label="read" value="read"></v-radio>
                    <v-radio label="write" value="write"></v-radio>
                  </v-radio-group>
                </td>
              </tr>
              <tr>
                <td>Pipeline Permissions</td>
                <td>
                  <v-radio-group v-model="newRole.permissions[1].action" inline>
                    <v-radio label="none" value="none"></v-radio>
                    <v-radio label="read" value="read"></v-radio>
                    <v-radio label="write" value="write"></v-radio>
                  </v-radio-group>
                </td>
              </tr>
              <tr>
                <td>User Permissions</td>
                <td>
                  <v-radio-group v-model="newRole.permissions[2].action" inline>
                    <v-radio label="none" value="none"></v-radio>
                    <v-radio label="read" value="read"></v-radio>
                    <v-radio label="write" value="write"></v-radio>
                  </v-radio-group>
                </td>
              </tr>
              <tr>
                <td>Config Permissions</td>
                <td>
                  <v-radio-group v-model="newRole.permissions[3].action" inline>
                    <v-radio label="none" value="none"></v-radio>
                    <v-radio label="read" value="read"></v-radio>
                    <v-radio label="write" value="write"></v-radio>
                  </v-radio-group>
                </td>
              </tr>
              <tr>
                <td>Security Permissions</td>
                <td>
                  <v-radio-group v-model="newRole.permissions[4].action" inline>
                    <v-radio label="none" value="none"></v-radio>
                    <v-radio label="read" value="read"></v-radio>
                    <v-radio label="write" value="write"></v-radio>
                  </v-radio-group>
                </td>
              </tr>
              <tr>
                <td>Token Permissions</td>
                <td>
                  <v-radio-group v-model="newRole.permissions[5].action" inline>
                    <v-radio label="none" value="none"></v-radio>
                    <v-radio label="own" value="ok"></v-radio>
                    <v-radio label="all" value="write"></v-radio>
                  </v-radio-group>
                </td>
              </tr>
              <tr>
                <td>Audit</td>
                <td>
                  <v-switch color="primary" value="ok" v-model="newRole.permissions[6].action" label=""></v-switch>
                </td>
              </tr>
              <tr>
                <td>Console</td>
                <td>
                  <v-switch color="primary" value="ok" v-model="newRole.permissions[7].action" label=""></v-switch>
                </td>
              </tr>
              <tr>
                <td>Logs</td>
                <td>
                  <v-switch color="primary" value="ok" v-model="newRole.permissions[8].action" label=""></v-switch>
                </td>
              </tr>
              <tr>
                <td>Reboot</td>
                <td>
                  <v-switch color="primary" value="ok" v-model="newRole.permissions[9].action" label=""></v-switch>
                </td>
              </tr>
            </tbody>
          </v-table>
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
import { useAuthStore } from '../../stores/auth'

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
    const newRole = ref<Role | any>({
      name: '',
      description: '',
      permissions: [
        { resource: 'app', action: 'none' },
        { resource: 'pipeline', action: 'none' },
        { resource: 'user', action: 'none' },
        { resource: 'config', action: 'none' },
        { resource: 'security', action: 'none' },
        { resource: 'token', action: 'none' },
        { resource: 'audit', action: 'none' },
        { resource: 'console', action: 'none' },
        { resource: 'logs', action: 'none' },
        { resource: 'reboot', action: 'none' }
      ]
    })
    const authStore = useAuthStore();
    const writeUserPermission = authStore.hasPermission('user:write')

    const headers = [
      { title: 'Role', value: 'name' },
      //{ title: 'Permissions', value: 'permissions' },
      { title: 'App', value: 'permissionsApp', align: 'center' as const },
      { title: 'Pipeline', value: 'permissionsPipeline', align: 'center' as const },
      { title: 'Accounts', value: 'permissionsAccount', align: 'center' as const},
      { title: 'Settings', value: 'permissionsConfig', align: 'center' as const},
      { title: 'Security', value: 'permissionsSecurity', align: 'center' as const},
      { title: 'Token', value: 'permissionsToken', align: 'center' as const},
      { title: 'Audit', value: 'permissionsAudit', align: 'center' as const},
      { title: 'Console', value: 'permissionsConsole', align: 'center' as const},
      { title: 'Logs', value: 'permissionsLogs', align: 'center' as const},
      { title: 'Reboot', value: 'permissionsReboot', align: 'center' as const},

      { title: 'Actions', value: 'actions', sortable: false, align: 'end' as const },
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
      newRole.value = {
        name: '',
        description: '',
        permissions: [
          { resource: 'app', action: 'none' },
          { resource: 'pipeline', action: 'none' },
          { resource: 'user', action: 'none' },
          { resource: 'config', action: 'none' },
          { resource: 'security', action: 'none' },
          { resource: 'token', action: 'none' },
          { resource: 'audit', action: 'none' },
          { resource: 'console', action: 'none' },
          { resource: 'logs', action: 'none' },
          { resource: 'reboot', action: 'none' }
        ]
      }
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
            case 'ok':
              return 'mdi-check';
              break;
            default:
              return 'mdi-minus';
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
      writeUserPermission,
    }
  },
})
</script>
