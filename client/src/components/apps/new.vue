<template>
  <v-form v-model="valid">
    <v-container>
      <v-row>
        <v-col
          cols="12"
          md="4"
        >
          <v-text-field
            v-model="appname"
            :rules="nameRules"
            :counter="60"
            label="App name"
            required
          ></v-text-field>
        </v-col>
        
      </v-row>
      <v-row>

        <v-col
          cols="12"
          md="4"
        >
            <v-btn
                color="primary"
                elevation="2"
                >Sumbit</v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script>
export default {
    data: () => ({
      valid: false,
      appname: '',
      nameRules: [
        v => !!v || 'Name is required',
        v => v.length <= 60 || 'Name must be less than 10 characters',
        v => /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(v) || 'Allowed characters : [a-zA-Z0-9_-]',
      ],
    }),
    components: {
    },
    methods: {
    },
}
</script>

<style lang="scss">
</style>