<template>
  <v-form v-model="valid">

  <v-row class="pt-5">
    <v-col v-for="addon in addons" v-bind:key="addon.kind"
      cols="12"
      md="3"
    >

      <v-card color="cardBackground">
        <v-list-item class="justify-center">
          <div class="mx-auto text-center">
            <v-avatar
              size="57"
              rounded
              style="margin-top: 20px;"
              :image="addon.icon"
              :alt="addon.displayName"
            >
            </v-avatar>
            <h3>{{ addon.displayName }}</h3>
            <p class="text-caption mt-1">
              {{ addon.id }}
            </p>
            <div v-if="showButtons">
              <v-divider class="my-3"></v-divider>
              <v-btn
                depressed
                variant="text"
                color="primary"
                @click="editAddon(addon)"
              >
                edit
              </v-btn>
              <v-btn
                depressed
                variant="text"
                color="red"
                @click="deleteAddon(addon)"
              >
                delete
              </v-btn>
            </div>
          </div>
        </v-list-item>
      </v-card>


    </v-col>
  </v-row>

  <v-row>
    <v-dialog
      v-model="dialog"
      persistent
      max-width="600px"
    >
      <template v-slot:activator="{ props }" v-if="showButtons">

        <v-col cols="12">
            <v-btn
            elevation="2"
            icon
            small
            v-bind="props"
            @click="openNewDialog()"
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
                item-title="text"
                item-value="value"
                v-if="mode==='create'"
                v-model="selectedAddon"
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
                    :rules="baseSelectRule"
                    item-title="text"
                    item-value="value"
                    dense
                    v-model="field.default"
                ></v-select>
                <v-select
                    v-if="field.type === 'select' && typeof field.default === 'object'"
                    :items="field.options"
                    :label="field.label"
                    item-title="text"
                    item-value="value"
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
                    color="primary"
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
            variant="text"
            @click="dialog = false"
          >
            Close
          </v-btn>
          <v-btn
            color="blue darken-1"
            variant="text"
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


<script lang="ts">
import axios from "axios";
import set from 'lodash/set';
import get from 'lodash/get';
import { defineComponent } from 'vue'

type Addon = {
    id: string,
    kind: string,
    version: string,
    env: string[],
    icon: string,
    displayName: string,
    resourceDefinitions: any,
    formfields: FormField[],
}

type FormField = {
    name: string,
    label: string,
    type: string,
    default: string | number | boolean,
    required: boolean,
    options: string[],
}

type AddonOption = {
    text: string,
    value: Addon,
}

type StorageClass = {
    text: string,
    value: string,
}


type AddonFormOption = {
    text: string,
    value: Addon,
}

type Event = {
    id: string,
    kind: string,
    version: string,
    env: string[],
    icon: string,
    displayName: string,
    resourceDefinitions: any,
}

export default defineComponent({
    props: {
        addons: {
            type: Array<Addon>,
            default: () => [] as Addon[],
        },
        appname: {
            type: String,
            default: ''
        },
        showButtons: {
            type: Boolean,
            default: true
        },
    },
    data: () => ({
        valid: false,
        dialog: false,
        mode: 'create',
        availableStorageClasses: [] as StorageClass[],
        availableAddons: [
            {
                text: '',
                value: {} as Addon,
            },
        ] as AddonOption[],
        selectedAddon: {} as Addon,
        baseRule: [
          (v: any) => !!v || 'Field is required',
        ],
        baseSelectRule: [
          (v: any) => v!=='default' || 'Select a value',
        ],
    }),
    mounted() {
        this.loadStorageClasses();
        this.loadAddons();
    },
    methods: {
        openNewDialog() {
            this.mode = 'create';
            this.dialog = true;
        },
        loadStorageClasses() {
            axios.get(`/api/kubernetes/storageclasses`)
            .then(response => {
                for (let storageClass of response.data) {
                    this.availableStorageClasses.push({
                        text: storageClass.name,
                        value: storageClass.name
                    });
                }
                //console.log(this.availableStorageClasses);
            })
            .catch(error => {
                console.log(error);
            });
        },
        deleteAddon(addon: Addon) {
            // remove addon from local view and kuberoapp yaml
            for (let i = 0; i < this.addons.length; i++) {
              if (this.addons[i].kind == addon.kind) {
                this.addons.splice(i, 1);
                break;
              }
            }
        },
        editAddon(addon: Addon) {
            //console.log(addon);
            this.mode = 'edit';

            // search in available addons for the selected addon
            for (let i = 0; i < this.availableAddons.length; i++) {
              if (this.availableAddons[i].value.kind == addon.kind) {
                this.selectedAddon = this.availableAddons[i].value;
                break;
              }
            }

            // set the formfields to the values from the yaml
            //console.log(this.selectedAddon.formfields);
            Object.entries(this.selectedAddon.formfields).forEach(([field, value]) => {
                const fieldvalue = get(addon.resourceDefinitions, field, value.default)
                //console.log(field, value, fieldvalue);
                value.default = fieldvalue;
            });
            //console.log(this.selectedAddon.formfields);

            this.dialog = true;
        },
        loadAddons() {
            axios.get(`/api/addons`)
            .then(response => {
                for (let addon of response.data) {
                    if (addon.enabled) {
                        this.availableAddons.push({
                            text: addon.displayName,
                            value: addon
                        });
                    }
                }
            })
            .catch(error => {
                console.log(error);
            });
        },
        submitForm() {
            this.dialog = false;

            // replace the formfields with the form value
            Object.entries(this.selectedAddon.formfields).forEach(([field, value]) => {

                // Cast number fields to int
                if (value.type === 'number' && typeof value.default === 'string') {
                    value.default = parseInt(value.default);
                }

                if (value.name === 'metadata.name' && typeof value.default === 'string') {
                    if (!value.default.startsWith(this.appname)) {
                        value.default = this.appname+"-"+value.default
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
            } as Addon;

            //console.log(addon);

            if (this.mode === 'create') {
                this.addAddon(addon);
            } else {
                this.updateAddon(addon);
            }

        },
        addAddon(addon: Addon) {
            this.addons.push(addon);
            this.$emit('addon-added', addon);
        },
        updateAddon(addon: Addon) {
            for (let i = 0; i < this.addons.length; i++) {
              if (this.addons[i].kind == addon.kind) {
                this.addons[i] = addon;
                break;
              }
            }
            this.$emit('addon-updated', addon);
        },
    }
})
</script>