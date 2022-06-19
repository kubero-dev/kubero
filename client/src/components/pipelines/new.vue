<template>
  <v-form v-model="valid">
    <v-container>
      <v-row>
        <v-col cols="12" sm="12" md="12" lg="12" xl="12">
            <div class="subtitle-1">
                Create a new Pipeline
            </div>
            <p class="text-justify">
                A Pipeline may have several stages with apps
            </p>
        </v-col>
      </v-row>
      <v-row>
        <v-col
          cols="12"
          md="4"
        >
          <v-text-field
            v-model="appname"
            :rules="nameRules"
            :counter="60"
            label="Pipeline name"
            required
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col
          cols="12"
          md="4"
        >
          <v-text-field
            v-model="gitrepo"
            :rules="repositoryRules"
            :counter="60"
            label="Repository"
            required
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col
          cols="12"
          md="4"
        >
          <v-switch
            v-model="reviewapps"
            :label="`Review Apps: ${reviewapps.toString()}`"
          ></v-switch>
        </v-col>
      </v-row>
      <v-row>
        <v-col
          cols="12"
          md="4"
        >
          <v-switch
            v-model="phases.test"
            :label="`Test: ${phases.test.toString()}`"
          ></v-switch>
        </v-col>
      </v-row>
      <v-row>
        <v-col
          cols="12"
          md="4"
        >
          <v-switch
            v-model="phases.stage"
            :label="`Stage: ${phases.stage.toString()}`"
          ></v-switch>
        </v-col>
      </v-row>
      <v-row>
        <v-col
          cols="12"
          md="4"
        >
          <v-switch
            v-model="phases.production"
            :label="`Production: ${phases.production.toString()}`"
            readonly
          ></v-switch>
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
                @click="saveForm()"
                :disabled="!valid"
                >Sumbit</v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script>
import axios from "axios";
export default {
    data: () => ({
      valid: false,
      appname: '',
      reviewapps: true,
      gitrepo: 'https://github.com/kubero-dev/template-nodeapp.git', 
      phases: {
        test: true,
        stage: true,
        production: true
      },
      nameRules: [
        v => !!v || 'Name is required',
        v => v.length <= 60 || 'Name must be less than 10 characters',
        v => /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(v) || 'Allowed characters : [a-zA-Z0-9_-]',
      ],
      repositoryRules: [ 
        v => !!v || 'Repository is required',
        v => v.length <= 60 || 'Repository must be less than 10 characters',
        //    ((git|ssh|http(s)?)|(git@[\w\.]+))(:(//)?)([\w\.@\:/\-~]+)(\.git)(/)?
        v => /((git|ssh|http(s)?)|(git@[\w.]+))(:(\/\/)?)([\w.@:/\-~]+)(\.git)(\/)?/.test(v) || 'Format "owner/repository"',
      ],
    }),
    methods: {
      saveForm() {
        let phasesList = [];
        for (let key in this.phases) {
          phasesList.push({name: key, enabled: this.phases[key]});
        }
        console.log(phasesList);
        axios.post(`/api/pipelines`, {
          appname: this.appname,
          gitrepo: this.gitrepo,
          phases: phasesList,
          reviewapps: this.reviewapps
        })
        .then(response => {
          this.appname = '';
          console.log(response);
          this.$router.push({path: '/'});
        })
        .catch(error => {
          console.log(error);
        });
      }
    },
}
</script>

<style lang="scss">
</style>