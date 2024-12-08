<template>
  <v-row
      align="center"
      justify="space-around"
  >
        <v-stepper 
          v-model="step"
          elevation="10"
          class="ma-10"
          width="800px">


          <template v-slot:default="{ prev, next }" >

            <v-stepper-header>
                <v-stepper-item
                  title="Connect"
                  value="1"
                ></v-stepper-item>

                <v-divider></v-divider>
                <v-stepper-item
                  title="Save"
                  value="2"
                ></v-stepper-item>

                <v-divider></v-divider>
                <v-stepper-item
                  title="Check"
                  value="3"
                ></v-stepper-item>

                <v-divider></v-divider>
                <v-stepper-item
                  title="Download"
                  value="4"
                ></v-stepper-item>
            </v-stepper-header>

            <v-stepper-window>
              <v-stepper-window-item>
                <v-card color="grey-lighten-1" height="200"></v-card>
              </v-stepper-window-item>
              <v-stepper-window-item>
                <v-card flat>
                  <v-row>
                    <v-col cols="12">
                      <v-alert
                        text="Kubero usually runs within a Kubernetes cluster. This setup wizard will help you generate a configuration file that you can use on this running instance."
                        title="Setup"
                        type="info"
                        variant="tonal"
                      ></v-alert>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12">
                      <v-textarea 
                      rows=30 
                      label="kubeconfig" 
                      hint="kubectl config view --raw --minify --flatten"
                      v-model="kubeConfig" 
                      @input="updateContextItems()" 
                      :placeholder="kubeconfigPlaceholder" 
                      wrap="off"
                      style="white-space: nowrap; overflow-x: auto;">
                    </v-textarea>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12">
                      <v-combobox
                        label="context"
                        hint="This value is derived from the kubeconfig file `current-context` or the first context in the list"
                        v-model="kubeContext"
                        :items="kubeContextItems"
                      ></v-combobox>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12">
                      <v-alert
                        v-if="kubeconfigValid"
                        text="Your kubeconfig file is valid and your cluster is reachable."
                        title="Success"
                        type="success"
                        prominent
                      ></v-alert>
                      <v-alert
                        v-if="kubeconfigError"
                        :text="`The kubeconfig file is invalid: ${kubeconfigError }`"
                        title="Error"
                        type="error"
                        prominent
                      ></v-alert>
                    </v-col>
                  </v-row>
                </v-card>
              </v-stepper-window-item>
              <v-stepper-window-item>
                <v-card flat>
                  <v-row>
                    <v-col cols="12">
                      <v-text-field label="kubeconfig base64 encoded" readonly v-model="dotenv.KUBECONFIG_BASE64"></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12">
                      <v-text-field label="kubeconfig context" readonly v-model="dotenv.KUBERO_CONTEXT"></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12">
                      <v-text-field label="kubero namespace" v-model="dotenv.KUBERO_NAMESPACE"></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12">
                      <v-text-field label="kubero session key" v-model="dotenv.KUBERO_SESSION_KEY"></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12">
                      <v-text-field label="kubero webhook secret" v-model="dotenv.KUBERO_WEBHOOK_SECRET"></v-text-field>
                    </v-col>
                  </v-row>
                  <!-- SAVE Button -->
                  <v-row>
                    <v-col cols="12">
                      <v-btn
                        :disabled="saveSuccess === 'ok'"
                        color="primary"
                        @click="save(dotenv)"
                      >
                        Save as Running Config to this Kubero UI instance
                      </v-btn>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12">
                      <v-alert
                        v-if="saveSuccess === 'error'"
                        :text="`Failed to save configuration: ${saveErrorMessage}`"
                        title="Error"
                        type="error"
                        prominent
                      ></v-alert>
                    </v-col>
                  </v-row>
                </v-card>
              </v-stepper-window-item>
              <v-stepper-window-item>
                <v-card flat>
                  <v-row>
                    <v-col cols="12">
                      <v-alert
                        title="Kubero Operator"
                        :type="installedComponents.operator ? 'success' : 'error'"
                        variant="tonal"
                      >
                        <v-row>
                          <v-col cols="8">
                            Check if the Kubero operator is installed in your cluster. The operator is responsible for managing the Kubero application.
                          </v-col>
                          <v-col cols="4" class="d-flex justify-end">
                            <v-btn
                              color="primary"
                              v-if="!installedComponents.operator"
                              @click="checkInstalled('operator')"
                            >
                              Recheck
                            </v-btn>
                          </v-col>
                        </v-row>
                        <v-row v-if="!installedComponents.operator">
                          <v-col cols="12">
                            <p>Install the operator by running the following command: </p>
                            <VCodeBlock
                              code="kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml"
                              highlightjs
                              copy-tab
                              tabs
                              :floating-tabs="false"
                              :run-tab="false"
                              codeBlockRadius="0.25rem"
                              lang="javascript"
                              theme="rainbow"
                            />
                          </v-col>
                        </v-row>
                      </v-alert>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12">
                      <v-alert
                        title="Nginx Ingress"
                        :type="installedComponents.ingress ? 'success' : 'error'"
                        variant="tonal"
                      >
                        <v-row>
                          <v-col cols="8">
                            Check if the Nginx Ingress controller is installed in your cluster. The Ingress controller is responsible for routing traffic to the Kubero application.
                          </v-col>
                          <v-col cols="4" class="d-flex justify-end">
                            <v-btn
                              color="primary"
                              v-if="!installedComponents.ingress"
                              @click="checkInstalled('ingress')"
                            >
                              Recheck
                            </v-btn>
                          </v-col>
                        </v-row>
                        <v-row v-if="!installedComponents.ingress">
                          <v-col cols="12">
                            <p>Install the Ingress controller by running the following command: </p>
                            <VCodeBlock
                              code="kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml"
                              highlightjs
                              copy-tab
                              tabs
                              :floating-tabs="false"
                              :run-tab="false"
                              codeBlockRadius="0.25rem"
                              lang="javascript"
                              theme="rainbow"
                            />
                          </v-col>
                        </v-row>
                      </v-alert>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12">
                      <v-alert
                        title="Metrics (optional)"
                        :type="installedComponents.metrics ? 'success' : 'warning'"
                        variant="tonal"
                      >
                        <v-row>
                          <v-col cols="8">
                            Check if the metrics server is installed in your cluster. The metrics server is responsible for collecting metrics from the cluster.
                          </v-col>
                          <v-col cols="4" class="d-flex justify-end">
                            <v-btn
                              color="primary"
                              v-if="!installedComponents.metrics"
                              @click="checkInstalled('metrics')"
                            >
                              Recheck
                            </v-btn>
                          </v-col>
                        </v-row>
                        <v-row v-if="!installedComponents.metrics">
                          <v-col cols="12">
                            <p>Install the metrics server by running the following command: </p>
                            <VCodeBlock
                              code="kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml"
                              highlightjs
                              copy-tab
                              tabs
                              :floating-tabs="false"
                              :run-tab="false"
                              codeBlockRadius="0.25rem"
                              lang="javascript"
                              theme="rainbow"
                            />
                          </v-col>
                        </v-row>
                      </v-alert>
                    </v-col>
                  </v-row>
                </v-card>
              </v-stepper-window-item>
              <v-stepper-window-item>
                <v-card flat>
                  <v-row>
                    <v-col cols="12">
                      <v-textarea 
                      rows=30 
                      label=".env file" 
                      readonly 
                      v-model="toDotenv" 
                      wrap="off"
                      style="white-space: nowrap; overflow-x: auto;"></v-textarea>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="6">
                      <v-btn
                        color="primary"
                        @click="download(toDotenv, '.env')"
                      >
                        Download ENV file
                      </v-btn>
                    </v-col>
                    <v-col cols="6" class="d-flex justify-end">
                      <v-btn
                        color="success"
                        @click="reload()"
                      >
                        Back to Home
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-card>
              </v-stepper-window-item>
            </v-stepper-window>

            <v-stepper-actions
              @click:next="customNext(next)"
              @click:prev="prev"
              :disabled=actionValidation
            ></v-stepper-actions>
          </template>

        </v-stepper>
  </v-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import axios from "axios"
import YAML from 'yaml'
//import { Buffer } from 'buffer'

export default defineComponent({
  data() {
    return {
      step: '1',
      saveSuccess: '',
      saveErrorMessage: '',
      kubeConfig: '',
      kubeContext: '',
      kubeContextItems: [],
      kubeconfigError: '',
      kubeconfigPlaceholder: `apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: LS0tLS1CRUdJTiBDRVJUSUZJQ...
    server: https://127.0.0.1:55687
  name: example
contexts:
- context:
    cluster: example
    namespace: dev-test
    user: example
  name: example
current-context: example
kind: Config
preferences: {}
users:
- name: example
  user:
    client-certificate-data: LS0tLS1CRUdJTiBDRVJU...
    client-key-data: LS0tLS1CRUdJTiBSU0EgU...
`,
      dotenv: {
        KUBECONFIG_BASE64: '',
        KUBERO_CONTEXT: '',
        KUBERO_NAMESPACE: 'kubero',
        KUBERO_SESSION_KEY: '',
        KUBERO_WEBHOOK_SECRET: ''
      } as Record<string, string>,
      kubeconfigValid: false,
      installedComponents: {
        operator: false,
        ingress: false,
        metrics: false
      },
    }
  },
  computed: {
    componentsInstalled() {
      return this.installedComponents.operator && this.installedComponents.ingress
    },
    toDotenv() {
      let dotenvFile = ''
      for (const key in this.dotenv) {
        if (this.dotenv[key] === '') {
          //dotenvFile += `${key}=\n`
          continue
        } else {
          dotenvFile += `${key}=${this.dotenv[key]}\n`
        }
      }
      return dotenvFile
    },
    actionValidation(): boolean | 'next' | 'prev' {
      if (this.kubeconfigValid && this.step === '1') {
        return 'prev'
      } else if (this.saveSuccess != 'ok' && this.step === '2') {
        return 'next'
      }else if (this.saveSuccess == 'ok' && this.step === '2') {
        return false
      } else if (!this.componentsInstalled && this.step === '3') {
        return 'next'
      } else if (this.componentsInstalled && this.step === '3') {
        return false
      } else if (this.step === '4') {
        return 'next'
      } else {
        return true
      }

    }
  },
  methods: {
    checkInstalled(component: 'operator' | 'ingress' | 'metrics') {
      axios.get(`/api/config/setup/check/${component}`)
      .then((response) => {
        if (response.status === 200 && response.data.status === 'ok') {
          this.installedComponents[component] = true
        }
      })
    },
    reload() {
      // perform a full page reload
      window.location.href = '/'
    },
    save(obj: any) {
      axios.post('/api/config/setup/save', obj)
      .then((response) => {
        if (response.status === 200 && response.data.status === 'ok') {
          this.saveSuccess = 'ok'
          this.saveErrorMessage = ''
          this.checkInstalled('operator')
          this.checkInstalled('ingress')
          this.checkInstalled('metrics')
        } else {
          this.saveSuccess = 'error'
          this.saveErrorMessage = response.data.error
        }
      })
      .catch((error) => {
        this.saveSuccess = 'error'
        this.saveErrorMessage = error.message
      })
    },
    download(content: string, filename: string) {
      const element = document.createElement('a')
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content))
      element.setAttribute('download', filename)
      element.style.display = 'none'
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
    },
    async updateContextItems() {
      this.kubeconfigError = ''
      this.kubeconfigValid = true

      // try to parse the kubeconfig
      try {
        const kc = YAML.parse(this.kubeConfig)
        this.kubeContextItems = kc.contexts.map((c: any) => c.name)
        if (this.kubeContextItems.length > 0) {
          this.kubeContext = this.kubeContextItems[0]
        }
        if (kc['current-context']) {
          this.kubeContext = kc['current-context']
        }
      } catch (error) {
        this.kubeContextItems = []
        this.kubeconfigError = 'Invalid kubeconfig'
        this.kubeconfigValid = false
      }

      // test if the backend is able to validate the kubeconfig
      try {
        this.kubeconfigValid = await this.validateKubeconfig()
        if (!this.kubeconfigValid) {
          return
        }
      } catch (error) {
        this.kubeconfigError = 'Invalid kubeconfig'
        this.kubeconfigValid = false
        return
      }
    },
    async customNext(next: () => void) {
      if (this.step === '1') {
        this.kubeconfigValid = await this.validateKubeconfig()
        if (!this.kubeconfigValid) {
          return
        }
        this.generateConfig()
      }
      if (this.step === '2') {
        this.generateConfig()
      }
      next()
    },
    async validateKubeconfig(): Promise<boolean> {
      if (this.kubeConfig === '') {
        //this.kubeconfigError = 'kubeconfig is empty'
        this.kubeconfigError = ''
        return false
      }
      if (this.kubeContext === '') {
        this.kubeconfigError = 'context is not selected'
        return false
      }

      const response = await axios.post('/api/config/k8s/kubeconfig/validate', {
        kubeconfig: this.kubeConfig,
        context: this.kubeContext
      })

      if (response.status === 200) {
        if (response.data.valid) {
          this.kubeconfigError = ''
          this.kubeconfigValid = true
          return true
        } else {
          this.kubeconfigError = response.data.error
          this.kubeconfigValid = false
          return false
        }
      } else {
        this.kubeconfigError = response.data.error
        this.kubeconfigValid = false
        return false
      }
    }, 
    generateConfig() {
      this.dotenv.KUBECONFIG_BASE64 = btoa(this.kubeConfig)
      //this.dotenv.KUBECONFIG_BASE64 = Buffer.from(this.kubeConfig).toString('base64')
      this.dotenv.KUBERO_CONTEXT = this.kubeContext
      this.dotenv.KUBERO_SESSION_KEY = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      this.dotenv.KUBERO_WEBHOOK_SECRET = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    }
  },
})
</script>

<style lang="scss">

.v-textarea .v-field__input {
  font-family: Consolas, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
  font-size: small;
  font: 12px monospace;
}
</style>