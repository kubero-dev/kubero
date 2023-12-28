<template>
  <v-breadcrumbs :items="items">
      <template v-slot:item="{ item}">
      <v-breadcrumbs-item
          :href="item.href"
          :to="item.to"
          :disabled="item.disabled"
      >
        <v-icon v-if="item.icon">{{ item.icon }}</v-icon> {{ item.text }}
      </v-breadcrumbs-item>
      </template>
  </v-breadcrumbs>
</template>


<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    props: {
      items: {
        type: Array<any>, // can't extract type from v-breadcrumbs-item
        default: () => ([]),
      },
    },
})
</script>

<style scoped>
  .v-breadcrumbs {
    padding-left: 0;
  }
</style>