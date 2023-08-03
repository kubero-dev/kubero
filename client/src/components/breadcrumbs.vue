<template>
  <v-breadcrumbs :items="items">
      <template v-slot:item="{ item }">
      <v-breadcrumbs-item
          :href="item.href"
          :disabled="item.disabled"
      >
          {{ item.text }}
      </v-breadcrumbs-item>
      </template>
  </v-breadcrumbs>
</template>


<script>
  export default {
    props: {
      items: {
        type: Array,
        default: () => ([]),
      },
    },
  }
</script>