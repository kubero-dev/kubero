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
  
  import { useSocketIO } from '../../socket.io';
  import { SweetAlertIcon} from 'sweetalert2'
  import Swal from 'sweetalert2'

</script>

<script lang="ts">
const { socket } = useSocketIO();

type Message = {
    action: string,
    pipelineName: string,
    phaseName?: string,
    appName?: string,
    data?: any
}

socket.on('updatedApps', (message: Message) => {
    console.log("updatedApps", message);
    const text = `App <b>${message.appName}</b> ${message.action} in ${message.pipelineName} ${message.phaseName}`;
    triggerToast('success', 'App '+message.action, text);
});

socket.on('updatedPipelines', (message: Message) => {
    console.log("updatedPipelines", message);
    const text = `Pipeline <b>${message.pipelineName}</b> ${message.action}`;
    triggerToast('success', 'Pipeline '+message.action, text);
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
