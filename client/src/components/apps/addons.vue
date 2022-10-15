<template>
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
                v-model="selectedAddon.id"
                outlined
                ></v-text-field>
              </v-col>

              <v-col cols="12" v-for="field in selectedAddon.formfields" v-bind:key="field.name">
                <v-text-field
                    v-if="field.type === 'text'"
                    v-model="field.default"
                    :label="field.label"
                    :required="field.required"
                    dense
                ></v-text-field>
                <v-text-field
                    v-if="field.type === 'number'"
                    v-model="field.default"
                    :label="field.label"
                    :required="field.required"
                    dense
                    type="number"
                ></v-text-field>
                <v-switch
                    v-model="field.default"
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
            @click="submitForm"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
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
        dialog: false,
        availableAddons: [
          /*
            { text: 'Redis', value: { 
                id: 'redis',
                name: 'Redis', 
                version: 'v0.0.1'
            }},
            { text: 'Percona MongoDB', value: { 
                id: 'mongodb',
                name: 'Mongodb', 
                version: 'v0.0.2'
            }},
            { text: 'PostgreSQL', value: { 
                id: 'postgresql',
                name: 'Postgresql', 
                version: 'v0.0.3'
            } },
            { text: 'Memcached', value: { 
                id: 'memcached',
                name: 'Memcached', 
                version: 'v0.0.4'
            } },
            { text: 'MariaDB', value: { 
                id: 'mariadb',
                name: 'Mariadb', 
                version: 'v0.0.5'
            } },
          */
        ],
        selectedAddon: { 
            id: '',
            kind: '',
            version: '',
            env: [],
            crd: {},
            formfields: {}
        },
    }),
    mounted() {
        this.loadAddons();
    },
    methods: {
        loadAddons() {
            axios.get(`/api/addons`)
            .then(response => {
                for (let addon of response.data) {
                    this.availableAddons.push({
                        text: addon.kind,
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

            // replace the formfields with the form value
            Object.entries(this.selectedAddon.formfields).forEach(([field, value]) => {
                set(this.selectedAddon.crd, field, value.default);
            });

            const addon = {
                id: this.selectedAddon.id,
                kind: this.selectedAddon.kind,
                version: this.selectedAddon.version,
                env: this.selectedAddon.env,
                crd: this.selectedAddon.crd,
            };
            this.$emit('addon-added', addon);

            console.log(addon);

            this.addons.push(addon);
        }
    }
}
</script>