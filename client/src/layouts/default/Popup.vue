<template>
  <v-app>
    <default-view />
  </v-app>
</template>

<script lang="ts" setup>
  import DefaultView from './View.vue'
</script>

<script lang="ts">

import { useKuberoStore } from '../../stores/kubero'
import { useCookies } from "vue3-cookies";
import { useSocketIO } from '../../socket.io';

const { cookies } = useCookies();
const token = cookies.get("kubero.websocketToken");
//console.log("COOKIE token", token);
const { socket } = useSocketIO(token);

// Write socket to pinia
const kuberoStore = useKuberoStore();
kuberoStore.kubero.socket = socket;

</script>