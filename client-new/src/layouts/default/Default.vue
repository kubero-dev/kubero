<template>
  <v-app>
    <app-bar />
    <nav-drawer/>
    <default-view />
  </v-app>
</template>

<script lang="ts" setup>
  import AppBar from './AppBar.vue'
  import NavDrawer from './NavDrawer.vue'
  import DefaultView from './View.vue'
</script>
