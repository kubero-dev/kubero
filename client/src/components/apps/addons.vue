<template>
  <v-form v-model="valid">
  <v-row>
    <v-dialog
      v-model="dialog"
      persistent
      max-width="600px"
    >
      <template v-slot:activator="{ on, attrs }">

        <v-col cols="12">
            <v-btn
            elevation="2"
            icon
            small
            v-bind="attrs"
            v-on="on"
            >
                <v-icon dark >
                    mdi-plus
                </v-icon>
            </v-btn>
        </v-col>
      </template>
      <v-card>
        <v-card-title>
          <span class="text-h5">Addon</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-select
                :items="availableAddons"
                label="Addon"
                outlined
                @change="addonChange($event)"
                ></v-select>
              </v-col>

              <v-col cols="12">
                <v-text-field
                label="Instance Name"
                :rules="baseRule"
                v-model="selectedAddon.id"
                outlined
                ></v-text-field>
              </v-col>

              <v-col cols="12" v-for="field in selectedAddon.formfields" v-bind:key="field.name">
                <v-select
                    v-if="field.type === 'select-storageclass'"
                    :items="availableStorageClasses"
                    :label="field.label"
                    dense
                    v-model="field.default"
                ></v-select>
                <v-select
                    v-if="field.type === 'select'"
                    :items="field.options"
                    :label="field.label"
                    dense
                    v-model="field.default"
                ></v-select>
                <v-text-field
                    v-if="field.type === 'text'"
                    v-model="field.default"
                    :label="field.label"
                    :rules="field.required ? baseRule : []"
                    :required="field.required"
                    dense
                ></v-text-field>
                <v-text-field
                    v-if="field.type === 'number'"
                    v-model="field.default"
                    :label="field.label"
                    :rules="field.required ? baseRule : []"
                    :required="field.required"
                    dense
                    type="number"
                ></v-text-field>
                <v-switch
                    v-model="field.default"
                    :rules="field.required ? baseRule : []"
                    v-if="field.type === 'switch'"
                    :label="field.label"
                    :required="field.required"
                    dense
                ></v-switch>
              </v-col>

            </v-row>
          </v-container>
          <small>*indicates required field</small>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="dialog = false"
          >
            Close
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            :disabled="!valid"
            @click="submitForm"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
  </v-form>
</template>


<script>
import axios from "axios";
import set from 'lodash.set';
export default {
    props: {
        addons: {
            type: Array,
            default: () => []
        }
    },
    data: () => ({
        valid: false,
        dialog: false,
        availableStorageClasses: [],
        availableAddons: [],
        selectedAddon: {
            id: '',
            kind: '',
            version: '',
            env: [],
            formfields: {},
            resourceDefinitions: {}
        },
        baseRule: [
          v => !!v || 'Name is required',
        ],
    }),
    mounted() {
        this.loadStorageClasses();
        this.loadAddons();
    },
    methods: {
        loadStorageClasses() {
            axios.get(`/api/config/storageclasses`)
            .then(response => {
                for (let storageClass of response.data) {
                    this.availableStorageClasses.push({
                        text: storageClass.name,
                        value: storageClass.name
                    });
                }
                console.log(this.availableStorageClasses);
            })
            .catch(error => {
                console.log(error);
            });
        },
        loadAddons() {
            axios.get(`/api/addons`)
            .then(response => {
                for (let addon of response.data) {
                    this.availableAddons.push({
                        text: addon.displayName,
                        value: addon
                    });
                }
            })
            .catch(error => {
                console.log(error);
            });
        },
        addonChange(event) {
            this.selectedAddon = event;
        },
        submitForm() {
            this.dialog = false;
            const appName = this.$route.params.app;

            // replace the formfields with the form value
            Object.entries(this.selectedAddon.formfields).forEach(([field, value]) => {

                // make sure every addon starts with the appname
                if (value.name === 'metadata.name') {
                    if (!value.default.startsWith(appName)) {
                        value.default = appName+"-"+value.default
                    }
                }

                set(this.selectedAddon.resourceDefinitions, field, value.default);
            });

            const addon = {
                id: this.selectedAddon.id,
                kind: this.selectedAddon.kind,
                version: this.selectedAddon.version,
                env: this.selectedAddon.env,
                icon: this.selectedAddon.icon,
                displayName: this.selectedAddon.displayName,
                resourceDefinitions: this.selectedAddon.resourceDefinitions,
            };
            this.$emit('addon-added', addon);

            console.log(addon);

            this.addons.push(addon);
        }
    }
}
</script>