<template>
  <v-container>
    <v-tabs v-model="tab" background-color="primary" dark>
      <v-tab>Users</v-tab>
      <v-tab>Teams</v-tab>
      <v-tab>Roles</v-tab>
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
    </v-tabs-window>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import users from './users.vue'
import teams from './teams.vue'
import roles from './roles.vue'

export default defineComponent({
  name: 'AccountTabs',
  components: {
    users,
    teams,
    roles,
  },
  setup() {
    const tab = ref(0)
    return { tab }
  },
})
</script>
