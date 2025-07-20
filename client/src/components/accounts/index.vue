<template>
  <v-container>
    <v-tabs v-model="tab" background-color="primary" dark>
      <v-tab>{{ $t('accounts.users') }}</v-tab>
      <v-tab>{{ $t('accounts.teams') }}</v-tab>
      <v-tab>{{ $t('accounts.roles') }}</v-tab>
      <v-tab>{{ $t('accounts.tokens') }}</v-tab>
    </v-tabs>
    <v-tabs-window v-model="tab">
      <v-tabs-window-item :value="0">
        <users />
      </v-tabs-window-item>
      <v-tabs-window-item :value="1">
        <teams />
      </v-tabs-window-item>
      <v-tabs-window-item :value="2">
        <roles />
      </v-tabs-window-item>
      <v-tabs-window-item :value="3">
        <tokens />
      </v-tabs-window-item>
    </v-tabs-window>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import users from './users.vue'
import teams from './teams.vue'
import roles from './roles.vue'
import tokens from './tokens.vue'

export default defineComponent({
  name: 'AccountTabs',
  components: {
    users,
    teams,
    roles,
    tokens,
  },
  setup() {
    const tab = ref(0)
    return { tab }
  },
})
</script>
