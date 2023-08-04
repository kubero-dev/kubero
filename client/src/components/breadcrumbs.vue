<template>
  <v-breadcrumbs :items="items">
      <template v-slot:item="{ item }">
      <v-breadcrumbs-item
          :href="item.href"
          :disabled="item.disabled"
      >
      <v-icon v-if="item.icon">{{ item.icon }}</v-icon> {{ item.text }}
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

<style scoped>
  .v-breadcrumbs {
    padding-left: 0;
  }
</style>