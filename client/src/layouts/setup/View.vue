<template>
  <v-main>
    <router-view />
  </v-main>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'LoginView',
})
</script>

<style scoped>
.v-main {
  background: rgb(var(--v-theme-focusbg));
}
</style>