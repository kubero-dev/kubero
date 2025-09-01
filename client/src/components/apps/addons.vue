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

    <v-col
      cols="12"
      md="3">
    <v-dialog
      v-model="dialog"
      persistent
      max-width="600px"
    >
      <template v-slot:activator="{ props }" v-if="showButtons">
        <v-card
          color="cardBackground"
          variant="flat"
          class="d-flex flex-column align-center justify-center add-addon-card"
          style="height: 198.08px; cursor: pointer; border: 2px dashed rgb(var(--v-theme-primary), 0.25); transition: border-color 0.2s;"
          v-bind="props"
          @click="openNewDialog()"
          
        >
          <v-avatar size="57" rounded class="bg-primary-lighten-2 mb-2" style="background-color: rgb(var(--v-theme-secondary));" >
            <v-icon size="36">mdi-plus</v-icon>
          </v-avatar>
          <span class="text-subtitle-1 font-weight-medium mt-2 text-primary">Add Addon</span>
        </v-card>
      </template>
      <v-card>
        <v-card-title v-if="mode==='create'">
          <span class="text-h5">Addon</span>
        </v-card-title>
        <v-card-title v-if="mode==='edit'">
          <v-container class="pb-0">
            <v-avatar
              size="50"
              rounded
              :image="selectedAddon.icon"
              :alt="selectedAddon.displayName"
            ></v-avatar>
            <span class="text-h5 ml-4">{{ selectedAddon.displayName }}</span>
          </v-container>
        </v-card-title>
        <v-card-text>
          <v-container class="pt-0">
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
                >
                  <template #item="{ item, props }">
                    <v-list-item v-bind="props">
                      <template v-slot:prepend>
                        <v-avatar
                          v-if="item.value && item.value.icon"
                          size="24"
                          class="mr-2"
                          :image="item.value.icon"
                          :alt="item.value.displayName"
                        ></v-avatar>
                      </template>
                    </v-list-item>
                  </template>
                  <template #selection="{ item }">
                    <v-avatar
                      v-if="item.value && item.value.icon"
                      size="24"
                      class="mr-2"
                      :image="item.value.icon"
                      :alt="item.value.displayName"
                    ></v-avatar>
                    <span>{{ item.value.displayName }}</span>
                  </template>
                </v-select>
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
                <v-combobox
                    v-if="field.type === 'combobox' && typeof field.default === 'string'"
                    :items="field.options"
                    :label="field.label"
                    item-title="text"
                    item-value="value"
                    dense
                    v-model="field.default"
                ></v-combobox>
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
            @click="dialog = false; selectedAddon = {} as Addon"
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
  </v-col>
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
            Object.entries(this.selectedAddon.formfields as FormField[]).forEach(([field, value]) => {
                const fieldvalue = get(addon.resourceDefinitions, field, value.default)
                //console.log(field, value, fieldvalue);

                if (value.name === 'metadata.name' && typeof value.default === 'string') {
                    if (fieldvalue.startsWith(this.appname)) {
                      // remove appname prefix
                      value.default = fieldvalue.replace(`${this.appname}-`, '');
                    }
                } else {
                   value.default = fieldvalue;
                }
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
            Object.entries(this.selectedAddon.formfields as FormField[]).forEach(([field, value]) => {

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