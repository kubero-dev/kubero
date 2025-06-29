<template>
  <v-container class="py-8">
    <v-row>
      <v-col cols="12" md="6" lg="4">
        <v-card class="pa-4">
          <v-avatar size="80" class="mb-4">
            <v-img :src="user.image || defaultAvatar" alt="User avatar" />
          </v-avatar>
          <h2 class="mb-1">{{ user.firstName }} {{ user.lastName }}</h2>
          <div class="text--secondary mb-2">@{{ user.username }}</div>
          <div class="mb-2">{{ user.email }}</div>
          <v-chip v-if="user.role" color="primary" class="mb-2">{{ user.role.name }}</v-chip>
          <div class="text--secondary">Last login: <span v-if="user.lastLogin">{{ new Date(user.lastLogin).toLocaleString() }}</span><span v-else>-</span></div>
        </v-card>
      </v-col>
      <v-col cols="12" md="6" lg="8">
        <v-card class="pa-4">
          <h3 class="mb-4">Profile Details</h3>
          <v-list dense>
            <v-list-item>
              <v-list-item-title>First Name</v-list-item-title>
              <v-list-item-subtitle>{{ user.firstName }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Last Name</v-list-item-title>
              <v-list-item-subtitle>{{ user.lastName }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Email</v-list-item-title>
              <v-list-item-subtitle>{{ user.email }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Username</v-list-item-title>
              <v-list-item-subtitle>{{ user.username }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Role</v-list-item-title>
              <v-list-item-subtitle>{{ user.role ? user.role.name : '-' }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Groups</v-list-item-title>
              <v-list-item-subtitle>
                <v-chip v-for="group in user.userGroups" :key="group.id" class="ma-1" color="secondary">{{ group.name }}</v-chip>
                <span v-if="!user.userGroups || user.userGroups.length === 0">-</span>
              </v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Provider</v-list-item-title>
              <v-list-item-subtitle>{{ user.provider || 'local' }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
    <v-row class="mt-6">
      <v-col cols="12">
        <v-card class="pa-4">
          <h3 class="mb-4">API Tokens</h3>
          <v-table density="compact">
            <thead>
              <tr>
                <th>Name</th>
                <th>Expires At</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="token in tokens" :key="token.id">
                <td>{{ token.name }}</td>
                <td>{{ token.expiresAt ? new Date(token.expiresAt).toLocaleString() : '-' }}</td>
                <td class="text-end">
                  <v-btn
                    elevation="0"
                    variant="tonal"
                    size="small"
                    class="ma-2"
                    @click="deleteToken(token)"
                  >
                    <v-icon color="primary">
                      mdi-delete
                    </v-icon>
                  </v-btn>
                </td>
              </tr>
              <tr v-if="tokens.length === 0">
                <td colspan="3" class="text-center">No tokens found.</td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import axios from 'axios'

export default defineComponent({
  name: 'ProfilePage',
  setup() {
    const user = ref<any>({
      firstName: '',
      lastName: '',
      email: '',
      username: '',
      image: '',
      role: null,
      userGroups: [],
      provider: '',
      lastLogin: null,
    })
    const defaultAvatar = '/avatar.svg'
    const tokens = ref<any[]>([])

    const loadProfile = async () => {
      try {
        const res = await axios.get('/api/users/profile')
        user.value = res.data
      } catch (e) {
        // fallback or error handling
      }
    }

    const loadTokens = async () => {
      try {
        const res = await axios.get('/api/tokens/my')
        tokens.value = res.data 
      } catch (e) {
        tokens.value = []
      }
    }

    const deleteToken = async (token: any) => {
      try {
        await axios.delete(`/api/tokens/my/${token.id}`)
        await loadTokens()
      } catch (e) {
        // error handling
      }
    }

    onMounted(() => {
      loadProfile()
      loadTokens()
    })

    return {
      user,
      defaultAvatar,
      tokens,
      deleteToken,
    }
  },
})
</script>
