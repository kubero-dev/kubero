<template>
  <v-footer padless>
    <v-col
      cols="12"
      class="grey lighten-2 text-center"
    >
      <strong>Swarmadmin</strong> {{ swarmversion }} | 
      <strong>Kubernetes API</strong> {{ kubeversion }}
    </v-col>
  </v-footer>
</template>
<script>
export default {

  props: [
    'kubeversion',
    'swarmversion',
  ],
}
</script>