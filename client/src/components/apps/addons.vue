<template>
  <v-row justify="center">
    <v-dialog
      v-model="dialog"
      persistent
      max-width="600px"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          color="primary"
          dark
          v-bind="attrs"
          v-on="on"
        >
          Open Dialog
        </v-btn>
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
                label="Outlined style"
                outlined
                @change="addonChange($event)"
                ></v-select>
              </v-col>

              <v-col cols="12">
                <v-text-field
                label="Addon Name"
                v-model="selectedAddon.id"
                outlined
                ></v-text-field>
              </v-col>

              <v-col cols="12" v-for="field in formfields" v-bind:key="field.name">
                <v-text-field
                    v-if="field.type === 'text'"
                    v-model="field.default"
                    :label="field.label"
                    :required="field.required"
                    dense
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
            { text: 'Redis', value: { 
                id: '',
                name: 'Redis', 
                version: 'v0.0.1'
            }},
            { text: 'Percona MongoDB', value: { 
                id: '',
                name: 'Mongodb', 
                version: 'v0.0.2'
            }},
            { text: 'PostgreSQL', value: { 
                id: '',
                name: 'Postgresql', 
                version: 'v0.0.3'
            } },
            { text: 'Memcached', value: { 
                id: '',
                name: 'Memcached', 
                version: 'v0.0.4'
            } },
            { text: 'MariaDB', value: { 
                id: '',
                name: 'Mariadb', 
                version: 'v0.0.5'
            } },
        ],
        selectedAddon: { 
            id: '',
            name: '',
            version: ''
        },
        formfields: [
            {
                type: 'text',
                label: 'Clustersize',
                name: 'clusterSize',
                default: '3',
                required: true
            },
            {
                type: 'switch',
                label: 'Exporter enabled',
                name: 'redisExporter.enabled',
                default: true,
                required: true
            },
            {
                type: 'text',
                label: 'CPU Limit',
                name: 'kubernetesConfig.resources.limits.cpu',
                default: '101m',
                required: true
            },
            {
                type: 'text',
                label:'Memory Limit',
                name: 'kubernetesConfig.resources.limits.memory',
                default: '128Mi',
                required: true
            },
            {
                type: 'text',
                label: 'CPU Requests',
                name: 'kubernetesConfig.resources.requests.cpu',
                default: '101m',
                required: true
            },
            {
                type: 'text',
                label: 'Memory Requests',
                name: 'kubernetesConfig.resources.requests.memory',
                default: '128Mi',
                required: true
            },
            {
                type: 'text',
                label: 'Storage Size',
                name: 'storage.volumeClaimTemplate.sepc.resources.requests.storage',
                default: '1Gi',
                required: true
            }
        ]
    }),
    methods: {
        addonChange(event) {
            console.log(event);
            this.selectedAddon = event;
        },
        submitForm() {
            this.dialog = false;
            this.formfields = [];
            this.addons.push(this.selectedAddon);
            console.log(this.addons);
        }
    }
}
</script>