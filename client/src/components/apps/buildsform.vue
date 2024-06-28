<template>
    <div>
      <v-dialog
        v-model="dialog"
        max-width="600"
      >
        <template v-slot:activator="{ props: activatorProps }">
          <v-btn
            block
            prepend-icon="mdi-wrench"
            text="Build"
            color="secondary"
            v-bind="activatorProps"
          ></v-btn>
        </template>
  
        <v-card
          prepend-icon="mdi-account"
          title="New Build"
        >
          <v-card-text>

            <v-row dense>
              <v-col
                cols="12"
                sm="6"
              >
                <v-select
                  :items="['nixpacks', 'dockerfile', 'buildpacks']"
                  label="Build strategy*"
                  description="The strategy to build the source code"
                  auto-select-first
                  required
                  v-model="form.strategy"
                ></v-select>
              </v-col>
              <v-col
                cols="12"
                sm="6"
              >
                <v-text-field
                  label="Reference"
                  description="The reference to the source code"
                  v-model="form.reference"
                ></v-text-field>
              </v-col>
            </v-row>
  
            <small class="text-caption text-medium-emphasis">*indicates required field</small>
          </v-card-text>
  
          <v-divider></v-divider>
  
          <v-card-actions>
            <v-spacer></v-spacer>
  
            <v-btn
              text="Cancel"
              variant="plain"
              @click="dialog = false"
            ></v-btn>
  
            <v-btn
              color="primary"
              text="Build"
              variant="tonal"
              @click="saveBuild"
            ></v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
</template>



<script lang="ts">
//import axios from "axios";
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'BuildsForm',
  params: {
    dialog: Boolean,
  },
  data: () => ({
    dialog: false,
    form: {
      strategy: 'dockerfile',
      reference: '',
    }
  }),
  methods: {
    saveBuild() {
      console.log('Build submitted', this.form)
      this.dialog = false
    }
  }
})
</script>