<template>
  <v-container>
    <v-data-table
      :headers="headers"
      :items="tokens"
      :loading="loading"
      class="elevation-0 border-0"
      item-key="id"
      :search="search"
    >
      <template #top>
        <v-text-field
          v-model="search"
          label="Search Tokens"
          prepend-inner-icon="mdi-magnify"
          single-line
          hide-details
          outlined
          class="mx-0 mt-2"
          clearable
          density="compact"
        ></v-text-field>
      </template>
      <template v-slot:[`item.token`]="{ item }">
        {{ item.id }}
      </template>
      <template v-slot:[`item.user.username`]="{ item }">
        <span>{{ item.user.username }}</span>
      </template>
      <template v-slot:[`item.expiresAt`]="{ item }">
        <span v-if="item.expiresAt">{{ new Date(item.expiresAt).toLocaleString() }}</span>
        <span v-else class="text--secondary">-</span>
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <v-btn
          elevation="0"
          variant="tonal"
          size="small"
          class="ma-2"
          color="secondary"
          @click="deleteToken(item)"
        >
          <v-icon color="primary">
            mdi-delete
          </v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <!-- Button to add a token 
    <div style="display: flex; justify-content: flex-end; margin-top: 16px;">
      <v-btn
        fab
        color="primary"
        style="margin-right: 6px;"
        @click="openCreateDialog"
      >
        <v-icon>mdi-plus</v-icon>
        <span class="sr-only">Create Token</span>
      </v-btn>
    </div>

    <!-- Dialog for a new Token 
    <v-dialog v-model="createDialog" max-width="500px">
      <v-card>
        <v-card-title>Create Token</v-card-title>
        <v-card-text>
          <v-text-field v-model="newToken.name" label="Name"></v-text-field>
          <v-text-field
            v-model="newToken.expiresAt"
            label="Expires At (ISO)"
            type="datetime-local"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="createDialog = false">Abort</v-btn>
          <v-btn color="primary" @click="saveCreate">Create</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  -->
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import axios from 'axios'

export default defineComponent({
  name: 'TokensTable',
  setup() {
    interface Token {
      id?: string;
      token?: string;
      name: string;
      expiresAt?: string;
      userId?: string;
    }
    const tokens = ref<Token[]>([])
    const loading = ref(false)
    const search = ref('')
    const createDialog = ref(false)
    const newToken = ref<Token>({ token: '', name: '', expiresAt: '', userId: '' })

    const headers = [
      { title: 'Token ID', value: 'token' },
      { title: 'Name', value: 'name' },
      { title: 'Owner', value: 'user.username' },
      { title: 'Expires At', value: 'expiresAt' },
      { title: 'Actions', value: 'actions', sortable: false, align: 'end' as const },
    ]

    const loadTokens = async () => {
      loading.value = true
      try {
        const res = await axios.get('/api/tokens')
        tokens.value = res.data
      } catch (e) {
        tokens.value = []
      }
      loading.value = false
    }

    const deleteToken = async (token: Token) => {
      try {
        await axios.delete(`/api/tokens/${token.id}`)
        await loadTokens()
      } catch (e) {
        console.error('Error deleting token:', e)
      }
    }

    const openCreateDialog = () => {
      newToken.value = { token: '', name: '', expiresAt: '', userId: '' }
      createDialog.value = true
    }

    const saveCreate = async () => {
      try {
        await axios.post('/api/tokens', newToken.value)
        await loadTokens()
        createDialog.value = false
      } catch (e) {
        console.error('Error creating token:', e)
      }
    }

    onMounted(() => {
      loadTokens()
    })

    return {
      tokens,
      headers,
      loading,
      search,
      createDialog,
      newToken,
      deleteToken,
      openCreateDialog,
      saveCreate,
    }
  },
})
</script>
