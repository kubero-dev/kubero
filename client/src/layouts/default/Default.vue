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
  
  import { SweetAlertIcon} from 'sweetalert2'
  import Swal from 'sweetalert2'

</script>

<script lang="ts">

import { useKuberoStore } from '../../stores/kubero'
import { useCookies } from "vue3-cookies";
import { useSocketIO } from '../../socket.io';

const { cookies } = useCookies();
const token = cookies.get("kubero.JWT_TOKEN");
//console.log("COOKIE token", token);
const { socket } = useSocketIO(token);

// Write socket to pinia
const kuberoStore = useKuberoStore();
kuberoStore.kubero.socket = socket;

type Message = {
    name: string,
    user: string,
    resource: "system" | "app" | "pipeline" | "phase" | "namespace" | "addon" | "settings" | "user" | "events" | "security" | "templates" | "config" | "addons" | "kubernetes" | "unknown",
    action: string,
    severity: "normal" | "info" | "warning" | "critical" | "error" | "unknown",
    message: string,
    phaseName: string,
    pipelineName: string,
    appName: string,
    data?: any
}

socket.on('newApp', (message: Message) => {
    triggerToast('success', 'App '+message.action, message.message);
});
socket.on('updateApp', (message: Message) => {
    triggerToast('success', 'App '+message.action, message.message);
});
socket.on('deleteApp', (message: Message) => {
    triggerToast('success', 'App '+message.action, message.message);
});
socket.on('restartApp', (message: Message) => {
    triggerToast('success', 'App '+message.action, message.message);
});
socket.on('rebuildApp', (message: Message) => {
    triggerToast('success', 'App '+message.action, message.message);
});
socket.on('handleWebhookPush', (message: Message) => {
    triggerToast('success', 'App '+message.action, message.message);
});
socket.on('deployApp', (message: Message) => {
    triggerToast('success', 'App '+message.action, message.message);
});
socket.on('newBuild', (message: Message) => {
    triggerToast('success', 'App '+message.action, message.message);
});

socket.on('newPipeline', (message: Message) => {
    triggerToast('success', 'Pipeline '+message.action, message.message);
});
socket.on('updatePipeline', (message: Message) => {
    triggerToast('success', 'Pipeline '+message.action, message.message);
});
socket.on('deletePipeline', (message: Message) => {
    triggerToast('success', 'Pipeline '+message.action, message.message);
});

socket.on('updateSettings', (message: Message) => {
    triggerToast('success', 'Kubero System', message.message ?? '');
});

function triggerToast(icon: SweetAlertIcon, title: string, text: string) {
  Swal.fire({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      icon: icon,
      title: title,
      html: text,
      showCancelButton: false,
      background: "rgb(var(--v-theme-cardBackground))",
      /*background: "rgb(var(--v-theme-on-surface-variant))",*/
      color: "rgba(var(--v-theme-on-background),var(--v-high-emphasis-opacity));",
    })
}
</script>
