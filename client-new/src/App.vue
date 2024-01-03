<template>
  <router-view />
</template>

<script lang="ts" setup>
import { useSocketIO } from './socket.io';
const { socket } = useSocketIO();
</script>

<style>
a {
  text-decoration: none;
  color: rgba(var(--v-theme-kubero),var(--v-high-emphasis-opacity));
}

</style>