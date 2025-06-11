<template>
  <v-form v-model="valid">
    <v-container>
      <Breadcrumbs :items="breadcrumbItems"></Breadcrumbs>
      <v-row>
        <v-col
          cols="12"
          md="1"
          class="hidden-xs-and-down"
        >
          <v-img
            :src="(deploymentstrategy == 'git') ? '/img/icons/hexagon1.svg' : '/img/icons/hexagon1-empty-bold-tp.svg'"
            max-width="50"
            max-height="50"
            class="mr-2"
          ></v-img>
        </v-col>
        <v-col cols="12" sm="11" md="11" lg="11" xl="11">
            <h1 v-if="app=='new'">
                Create a new App in {{ pipeline }}
            </h1>
            <h1 v-if="app!='new'">
                Edit {{ app }} in {{ pipeline }}
            </h1>
            <p class="text-justify">
                in phase {{ phase }}
            </p>
        </v-col>
      </v-row>

      <v-row
       v-if="app==='new' && $route.query.template != undefined">
        <v-col
          cols="12"
          md="8"
        >
          <v-alert
            outlined
            type="warning"
            prominent
            border="start"
          >
            Please change all passwords, tokens and select the correct storageClass for your cluster.
          </v-alert>
        </v-col>
      </v-row>

      <v-row>
        <v-col
          cols="12"
          md="6"
        >
          <v-text-field
            v-model="name"
            :rules="nameRules"
            :counter="60"
            :disabled="app!='new'"
            label="App name"
            v-on:input="changeName(name)"
            required
          ></v-text-field>
        </v-col>
        <v-col
          cols="12"
          md="2"
        >
        <!--
        <v-switch
            v-model="sleep"
            hint="Sleep after 1 Minutes of inactivity"
            color="primary"
            false-value="disabled"
            true-value="60s"
            true-icon="mdi-sleep"
            false-icon="mdi-sleep-off"
            label="Sleep"
            :disabled="!kuberoConfig.sleepEnabled"
            inset
          ></v-switch>
        -->
        </v-col>
      </v-row>

      <v-row v-for="(host, index) in ingress.hosts" :key="index" :style="index > 0 ? 'margin-top: -20px;' : ''">
        <v-col
          cols="9"
          md="6"
        >
          <v-text-field
            v-model="host.host"
            :rules="domainRules"
            :counter="60"
            label="Domain"
            required
          ></v-text-field>
        </v-col>
        <v-col
          cols="2"
          md="2"
          pullright
        >
          <v-switch
            v-model="sslIndex[index]"
            label="SSL"
            density="compact"
            color="primary"
          ></v-switch>
        </v-col>
        <v-col
          cols="1"
          md="1"
        >
          <v-btn
          v-if="index > 0"
          elevation="2"
          icon
          size="small"
          @click="removeDomainLine(index)"
          >
              <v-icon dark >
                  mdi-minus
              </v-icon>
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col
          cols="12"
          style="margin-top: -20px; padding-top: -0px; padding-bottom: 40px;"
        >
          <v-btn
          elevation="2"
          icon
          size="small"
          @click="addDomainLine()"
          >
              <v-icon dark >
                  mdi-plus
              </v-icon>
          </v-btn>
        </v-col>
      </v-row>

      <v-row>
        <v-col
          cols="12"
          md="6"
        >
            <v-text-field
              v-model="containerPort"
              label="Container Port"
            ></v-text-field>
        </v-col>
      </v-row>

      <v-row>
        <v-col
          cols="12"
          md="7"
        >
        <v-switch
            v-model="advanced"
            label="Advanced App Configuration"
            color="primary"
            inset
          ></v-switch>
        </v-col>
      </v-row>

      <v-expansion-panels
        v-model="panel"
        multiple
      >
      <!-- DEPLOYMENT -->
      <v-expansion-panel bg-color="rgb(var(--v-theme-cardBackground))">
        <v-expansion-panel-title class="text-uppercase text-caption-2 font-weight-medium" color="cardBackground">Deployment</v-expansion-panel-title>
        <v-expansion-panel-text>

          <v-row>
            <v-col
              cols="12"
              md="7"
            >
            <v-radio-group
              v-model="deploymentstrategy"
              row
              label="Strategy"
            >
              <v-radio
                label="Container Image"
                value="docker"
              ></v-radio>
              <v-radio
                label="From Source"
                value="git"
              ></v-radio>
              <!--
              <v-radio
                label="Build"
                value="build"
              ></v-radio>
              -->
            </v-radio-group>
            </v-col>
          </v-row>

          <!-- DEPLOYMENT STRATEGY GIT -->
          <div v-if="deploymentstrategy == 'git'">

         
          <v-row>
            <v-col
              cols="12"
              md="4"
            >
              <v-radio-group v-model="buildstrategy">
                <v-radio
                  key="0"
                  label="Runpacks"
                  value="plain"
                ></v-radio>
                <v-radio
                  key="2"
                  label="External CI/CD"
                  value="external"
                ></v-radio>
                <v-radio
                  key="1"
                  label="Nixpacks"
                  value="nixpacks"
                  :disabled="!kuberoConfig.buildPipeline"
                ></v-radio>
                <v-radio
                  key="1"
                  label="Buildpacks"
                  value="buildpacks"
                  :disabled="!kuberoConfig.buildPipeline"
                ></v-radio>
                <v-radio
                  key="2"
                  label="Dockerfile"
                  value="dockerfile"
                  :disabled="!kuberoConfig.buildPipeline"
                ></v-radio>
              </v-radio-group>
            </v-col>
            <v-col
              cols="12"
              md="8"
            >
            
              <v-alert variant="tonal" color="#8560a9" border="start" v-if="buildstrategy == 'plain'">
                <h3>
                  Runpacks
                </h3>
                <div>Your code is build and running on official images. The code will be built for every pod in a init container. This is the fastes way, to run your code, but becomes more inefficient with every replica.</div>
              </v-alert>

              <v-alert variant="tonal" color="#8560a9" border="start" v-if="buildstrategy == 'nixpacks'">
                <h3>
                  Nixpacks
                </h3>
                <div>
                  <a href="https://nixpacks.com/" target="_blank" style="text-decoration: underline;">Nixpacks</a> is a open source project to build docker images with nix. It is a good way to build images without a Dockerfile, if you want to have a reproducable build process.
                </div>
              </v-alert>

              <v-alert variant="tonal" color="#8560a9" border="start" v-if="buildstrategy == 'buildpacks'">
                <h3>
                  Buildpacks
                </h3>
                <div>
                  <a href="https://buildpacks.io/" target="_blank" style="text-decoration: underline;">Buildpacks</a> are a set of scripts and binaries used to transform application source code into a deployable image, automating the process of compiling, building, and configuring the app for deployment.
                </div>
              </v-alert>

              <v-alert variant="tonal" color="#8560a9" border="start" v-if="buildstrategy == 'dockerfile'">
                <h3>
                  Dockerfile
                </h3>
                <div>Builds the image based on the Dockerfile in your git root directory. This allows for the highest level of customization.</div>
              </v-alert>

              <v-alert variant="tonal" color="#8560a9" border="start" v-if="buildstrategy == 'external'">
                <h3>
                  External CI/CD
                </h3>
                <div>You are building your image on a external CI/CD and deploy it by changing the image tag thrue the API</div>
              </v-alert>

              <v-alert variant="tonal" type="info" border="start" v-if="!kuberoConfig.buildPipeline" style="margin-top: 20px;">
                <h3>
                  Buildpipeline not configured
                </h3>
                <div>Configure the registry to use Buildpacks, Nickspacks and Dockerfile build pipeline</div>
              </v-alert>

            </v-col>
          </v-row>

<!-- TODO : make the dockerfile path configurable
          <div v-if="buildstrategy == 'dockerfile'">
            <v-row>
              <v-col
                cols="12"
                md="6"
              >
                <v-text-field
                  v-model="dockerfilepath"
                  label="Dockerfile"
                ></v-text-field>
              </v-col>
            </v-row>
          </div>
-->
          <div v-if="buildstrategy != 'external'">
          <v-row>
            <v-col
              cols="12"
              md="6"
            >
              <v-text-field
                v-model="gitrepo.ssh_url"
                :rules="repositoryRules"
                label="Repository"
                required
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col
              cols="12"
              md="6"
            >
              <v-combobox
                v-model="branch"
                :items="branchesList"
                label="Branch"
                required
              ></v-combobox>
            </v-col>
          </v-row>
          <v-row>
            <v-col
              cols="12"
              md="6"
            >
              <v-switch
                v-model="autodeploy"
                label="Autodeploy"
                color="primary"
              ></v-switch>
            </v-col>
          </v-row>

          <v-row
            v-if="buildpack == undefined">
            <v-col
              cols="12"
              md="6"
            >
              <v-select
                v-model="buildpack"
                :items="buildpacks"
                label="Runpack"
                @update:modelValue="updateBuildpack(buildpack)"
              ></v-select>
            </v-col>
          </v-row>

          <v-row
            v-if="buildpack != undefined && advanced === true" class="secondary">
            <v-col
              cols="12"
              md="6"
            >
              <v-text-field
                v-model="buildpack.build.command"
                label="Build Command"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row
            v-if="buildpack != undefined && advanced === true" class="secondary">
            <v-col
              cols="12"
              md="6"
            >
              <v-text-field
                v-model="buildpack.run.command"
                label="Run Command"
              ></v-text-field>
            </v-col>
          </v-row>
        </div> <!-- end of buildstrategy != external -->
        </div> <!-- end of deploymentstrategy == git -->

        <!-- DEPLOYMENT STRATEGY CONTAINER -->
        <div v-if="deploymentstrategy == 'docker'">
          <v-row>
            <v-col
              cols="12"
              md="6"
            >
              <v-text-field
                v-model="docker.image"
                :counter="60"
                label="Docker image"
                required
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col
              cols="12"
              md="6"
            >
              <v-text-field
                v-model="docker.tag"
                :counter="60"
                label="Tag"
                required
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row
            v-if="advanced">
            <v-col
              cols="12"
              md="6"
            >
              <v-text-field
                v-model="docker.command"
                :counter="60"
                label="Command"
                required
                bg-color="secondary"
              ></v-text-field>
            </v-col>
          </v-row>
        </div> <!-- end of deploymentstrategy == docker -->
        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- BASIC AUTH -->
      <v-expansion-panel bg-color="rgb(var(--v-theme-on-surface-variant))" :style="advanced ? 'display: block;' : 'display: none;'">
        <v-expansion-panel-title class="text-uppercase text-caption-2 font-weight-medium" color="secondary">Basic Auth</v-expansion-panel-title>
        <v-expansion-panel-text color="secondary">


          <v-row>
            <v-col
              cols="12"
              md="3"
            >
              <v-switch
                v-model="basicAuth.enabled"
                label="Basic Auth Enabled"
                color="primary"
              ></v-switch>
            </v-col>
            <v-col
              cols="12"
              md="3"
            >
                <v-text-field
                  v-model="basicAuth.realm"
                  label="name"
                  :counter="60"
                ></v-text-field>
            </v-col>
          </v-row>


          <v-row v-for="(account, index) in basicAuth.accounts" :key="index">
              <v-col
                cols="12"
                md="5"
              >
                <v-text-field
                  v-model="account.user"
                  label="Username"
                  :counter="60"
                ></v-text-field>
              </v-col>
              <v-col
                cols="12"
                md="6"
              >
                <v-text-field
                  v-model="account.pass"
                  label="Password"
                ></v-text-field>
              </v-col>
              <v-col
                cols="12"
                md="1"
              >
                <v-btn
                elevation="2"
                icon
                small
                @click="removeAuthLine(account.user)"
                >
                    <v-icon dark >
                        mdi-minus
                    </v-icon>
                </v-btn>
              </v-col>
            </v-row>

            <v-row>
              <v-col
                cols="12"
              >
                <v-btn
                elevation="2"
                icon
                small
                @click="addAuthLine()"
                >
                    <v-icon dark >
                        mdi-plus
                    </v-icon>
                </v-btn>
              </v-col>
            </v-row>

        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- SECURITY -->
      <v-expansion-panel bg-color="rgb(var(--v-theme-on-surface-variant))" :style="advanced ? 'display: block;' : 'display: none;'">
        <v-expansion-panel-title class="text-uppercase text-caption-2 font-weight-medium" color="secondary">Security</v-expansion-panel-title>
        <v-expansion-panel-text color="secondary">

          <v-row  v-if="deploymentstrategy == 'git'">
            <v-col
              cols="12"
              md="6"
            >
              <v-switch
                v-model="buildpack.run.readOnlyAppStorage"
                label="Read only app volume"
                color="primary"
            ></v-switch>
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
            </v-col>
          </v-row>

          <v-row>
            <v-col
              cols="12"
              md="6"
            >
              <v-switch
                v-model="buildpack.run.securityContext.readOnlyRootFilesystem"
                label="Read only root filesystem"
                color="primary"
            ></v-switch>
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <v-switch
                v-model="vulnerabilityscan.enabled"
                label="Enable Trivy vulnerabfility scans"
                color="primary"
            ></v-switch>
            </v-col>
          </v-row>

          <v-row>
            <v-col
              cols="12"
              md="6"
            >
              <v-switch
                v-model="buildpack.run.securityContext.allowPrivilegeEscalation"
                label="Allow privilege escalation"
                color="primary"
            ></v-switch>
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <v-switch
                v-model="buildpack.run.securityContext.runAsNonRoot"
                label="Run as non root"
                color="primary"
            ></v-switch>
            </v-col>
          </v-row>

          <v-row>
            <v-col
              cols="12"
              md="6"
            >
              <v-text-field
                v-model="buildpack.run.securityContext.runAsUser"
                :rules="uidRules"
                label="Run as user"
            ></v-text-field>
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <v-text-field
                v-model="buildpack.run.securityContext.runAsGroup"
                :rules="uidRules"
                label="Run as group"
            ></v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col
              cols="12"
              md="6"
            >
            <v-select
              v-model="buildpack.run.securityContext.capabilities.add"
              :items="capabilities"
              :menu-props="{ maxHeight: '400' }"
              label="Capabilities add"
              multiple
              hint="Select one or more"
              persistent-hint
              chips
              class="capability"
            ></v-select>
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
            <v-select
              v-model="buildpack.run.securityContext.capabilities.drop"
              :items="capabilities"
              :menu-props="{ maxHeight: '400' }"
              label="Capabilities drop"
              multiple
              hint="Select one or more"
              persistent-hint
              chips
              class="capability"
            ></v-select>
            </v-col>
          </v-row>

        </v-expansion-panel-text>
      </v-expansion-panel>


      <!-- NETWORKING -->
      <v-expansion-panel bg-color="rgb(var(--v-theme-on-surface-variant))" :style="advanced ? 'display: block;' : 'display: none;'">
        <v-expansion-panel-title class="text-uppercase text-caption-2 font-weight-medium" color="secondary">Networking</v-expansion-panel-title>
        <v-expansion-panel-text color="secondary">

          <v-row>
            <v-col
              cols="12"
              md="6"
            >
              <v-text-field
                v-model="ingress.annotations['nginx.ingress.kubernetes.io/whitelist-source-range']"
                label="Whitelist Source Range"
              ></v-text-field>
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <v-text-field
                v-model="ingress.annotations['nginx.ingress.kubernetes.io/denylist-source-range']"
                label="Denylist Source Range"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col
              cols="12"
              md="6"
            >
              <v-switch
                v-model="ingress.annotations['nginx.ingress.kubernetes.io/force-ssl-redirect']"
                label="Force SSL Redirect"
                color="primary"
                :disabled="ingress.tls && ingress.tls.length > 0"
              ></v-switch>
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <v-text-field
                v-model="ingress.annotations['nginx.ingress.kubernetes.io/proxy-buffer-size']"
                label="Proxy Buffer Size"
              ></v-text-field>
            </v-col>
          </v-row>

          <!-- allow setting of ingressClass -->
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="ingress.className"
                  :items="ingressClasses"
                  label="Ingress Class"
                ></v-select>
              </v-col>
            </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>


      <!-- CORS -->
      <v-expansion-panel bg-color="rgb(var(--v-theme-on-surface-variant))" :style="advanced ? 'display: block;' : 'display: none;'">
        <v-expansion-panel-title class="text-uppercase text-caption-2 font-weight-medium" color="secondary">Cors</v-expansion-panel-title>
        <v-expansion-panel-text color="secondary">

          <v-row>
            <v-col
              cols="12"
              md="12"
            >
              <v-switch
                v-model="ingress.annotations['nginx.ingress.kubernetes.io/enable-cors']"
                label="Enable CORS"
                color="primary"
                false-value="false"
                true-value="true"
                inset
              ></v-switch>
            </v-col>
          </v-row>
          
          <v-row>
            <v-col
              cols="12"
              md="4"
            >
              <v-text-field
                v-model="ingress.annotations['nginx.ingress.kubernetes.io/cors-allow-origin']"
                label="CORS Allow Origin"
                :disabled="ingress.annotations['nginx.ingress.kubernetes.io/enable-cors'] == 'false'"
              ></v-text-field>
            </v-col>
            <v-col
              cols="12"
              md="4"
            >
              <v-text-field
                v-model="ingress.annotations['nginx.ingress.kubernetes.io/cors-allow-headers']"
                label="CORS Allow Headers"
                :disabled="ingress.annotations['nginx.ingress.kubernetes.io/enable-cors'] == 'false'"
              ></v-text-field>
            </v-col>
            <v-col
              cols="12"
              md="4"
            >
              <v-text-field
                v-model="ingress.annotations['nginx.ingress.kubernetes.io/cors-expose-headers']"
                label="CORS Expose Headers"
                :disabled="ingress.annotations['nginx.ingress.kubernetes.io/enable-cors'] == 'false'"
              ></v-text-field>
            </v-col>
          </v-row>
          
          <v-row>
            <v-col
              cols="12"
              md="4"
            >
              <v-switch
                v-model="ingress.annotations['nginx.ingress.kubernetes.io/cors-allow-credentials']"
                label="CORS Allow Credentials"
                color="primary"
                false-value="false"
                true-value="true"
                :disabled="ingress.annotations['nginx.ingress.kubernetes.io/enable-cors'] == 'false'"
              ></v-switch>
            </v-col>
            <v-col
              cols="12"
              md="4"
            >
              <v-text-field
                v-model="ingress.annotations['nginx.ingress.kubernetes.io/cors-max-age']"
                label="CORS Max Age"
                :disabled="ingress.annotations['nginx.ingress.kubernetes.io/enable-cors'] == 'false'"
              ></v-text-field>
            </v-col>
            <v-col
              cols="12"
              md="4"
            >
              <v-text-field
                v-model="ingress.annotations['nginx.ingress.kubernetes.io/cors-allow-methods']"
                label="CORS Allow Methods"
                :disabled="ingress.annotations['nginx.ingress.kubernetes.io/enable-cors'] == 'false'"
              ></v-text-field>
            </v-col>
          </v-row>



        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- KUBERNETES --> 
      <v-expansion-panel bg-color="rgb(var(--v-theme-on-surface-variant))" :style="advanced ? 'display: block;' : 'display: none;'">
        <v-expansion-panel-title class="text-uppercase text-caption-2 font-weight-medium" color="secondary">Kubernetes</v-expansion-panel-title>
        <v-expansion-panel-text color="secondary">

          <h4 class="mb-5">Serviceaccount Annotation</h4>
          <v-row v-for="(annotation, index) in sAAnnotations" :key="index">
            <v-col
              cols="12"
              md="5"
            >
              <v-text-field
                v-model="annotation.annotation"
                label="annotation"
                :counter="120"
              ></v-text-field>
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <v-text-field
                v-model="annotation.value"
                label="value"
              ></v-text-field>
            </v-col>
            <v-col
              cols="12"
              md="1"
            >
              <v-btn
              elevation="2"
              icon
              small
                @click="removeSAAnnotationLine(annotation.annotation)"
              >
                  <v-icon dark >
                      mdi-minus
                  </v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <v-row>
            <v-col
              cols="12"
            >
              <v-btn
              elevation="2"
              icon
              small
              @click="addSAAnnotationLine()"
              >
                  <v-icon dark >
                      mdi-plus
                  </v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- ENVIRONMENT VARS -->
      <v-expansion-panel bg-color="rgb(var(--v-theme-cardBackground))">
        <v-expansion-panel-title class="text-uppercase text-caption-2 font-weight-medium" color="cardBackground">Environment Variables</v-expansion-panel-title>
        <v-expansion-panel-text color="cardBackground">
            <v-row v-for="(envvar, index) in envVars" :key="index">
              <v-col
                cols="12"
                md="5"
              >
                <v-text-field
                  v-model="envvar.name"
                  label="name"
                  :counter="60"
                ></v-text-field>
              </v-col>
              <v-col
                cols="12"
                md="6"
              >
                <v-text-field
                  v-model="envvar.value"
                  label="value"
                ></v-text-field>
              </v-col>
              <v-col
                cols="12"
                md="1"
              >
                <v-btn
                elevation="2"
                icon
                small
                @click="removeEnvLine(envvar.name)"
                >
                    <v-icon dark >
                        mdi-minus
                    </v-icon>
                </v-btn>
              </v-col>
            </v-row>

            <v-row>
              <v-col
                cols="12"
              >
                <v-btn
                elevation="2"
                icon
                small
                @click="addEnvLine()"
                >
                    <v-icon dark >
                        mdi-plus
                    </v-icon>
                </v-btn>
              </v-col>
            </v-row>

          <v-row>
            <v-file-input prepend-icon="mdi-file" label="Drop or select .env file" show-size v-model="envFile" @change="handleFileInput"></v-file-input>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- RESOURCES -->
      <v-expansion-panel bg-color="rgb(var(--v-theme-cardBackground))">
        <v-expansion-panel-title class="text-uppercase text-caption-2 font-weight-medium" color="cardBackground">Resources</v-expansion-panel-title>
        <v-expansion-panel-text color="cardBackground">
          <v-row>
            <v-col
              cols="12"
              md="6"
            >
              <v-select
                v-model="podsize"
                :items="podsizes"
                label="Podsize"
                item-title="text"
                item-value="value"
                @update:modelValue="updatePodsize"
              ></v-select>
            </v-col>
          </v-row>

          <v-row>
            <v-col
              cols="12"
              md="6"
            >
              <v-switch
                v-model="autoscale"
                label="Autoscale"
                hint="Scale pod replicas based on CPU and Memory usage"
                color="primary"
              ></v-switch>
            </v-col>
          </v-row>

          <v-row v-if="!autoscale">
            <v-col
              cols="12"
              md="6"
            >
              <v-slider
                v-model="webreplicas"
                label="Web Pods"
                max="10"
                min="0"
                step="1"
                thumb-label="always"
              ></v-slider>
            </v-col>
          </v-row>
          <v-row v-if="!autoscale">
            <v-col
              cols="12"
              md="6"
            >
              <v-slider
                v-model="workerreplicas"
                label="Worker Pods"
                max="10"
                min="0"
                step="1"
                thumb-label="always"
              ></v-slider>
            </v-col>
          </v-row>

          <v-row v-if="autoscale">
            <v-col
              cols="12"
              md="6"
            >
              <v-range-slider
                v-model="webreplicasrange"
                label="Web Pods"
                max="10"
                min="0"
                step="1"
                hint="pods"
                thumb-label="always"
              ></v-range-slider>
            </v-col>
          </v-row>

          <v-row v-if="autoscale">
            <v-col
              cols="12"
              md="6"
            >
              <v-range-slider
                v-model="workerreplicasrange"
                label="Worker Pods"
                max="10"
                min="0"
                step="1"
                hint="pods"
                thumb-label="always"
              ></v-range-slider>
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- VOLUMES -->
      <v-expansion-panel bg-color="rgb(var(--v-theme-cardBackground))">
        <v-expansion-panel-title class="text-uppercase text-caption-2 font-weight-medium" color="cardBackground">Volumes</v-expansion-panel-title>
        <v-expansion-panel-text color="cardBackground">
          <div v-for="(volume, index) in extraVolumes" :key="index">
            <v-row>
              <v-col
                cols="12"
                md="3"
              >
                <v-text-field
                  v-model="volume.name"
                  label="name"
                ></v-text-field>
              </v-col>
              <v-col
                cols="12"
                md="2"
              >
                <v-text-field
                  v-model="volume.size"
                  label="size"
                ></v-text-field>
              </v-col>
              <v-col
                cols="12"
                md="1"
              >
                <v-btn
                elevation="2"
                icon
                small
                @click="removeVolumeLine(volume.name)"
                >
                    <v-icon dark >
                        mdi-minus
                    </v-icon>
                </v-btn>
              </v-col>
            </v-row>

            <v-row>
              <v-col
                cols="12"
                md="2"
              >
                <v-select
                  v-model="volume.storageClass"
                  :items="storageclasses"
                  label="Storage Class"
                ></v-select>
              </v-col>
              <v-col
                cols="12"
                md="3"
              >
                <v-text-field
                  v-model="volume.mountPath"
                  label="Mount Path"
                ></v-text-field>
              </v-col>
              <v-col
                cols="12"
                md="3"
              >
                <v-select
                  v-model="volume.accessModes[0]"
                  :items="['ReadWriteOnce', 'ReadWriteMany', 'ReadOnlyMany']"
                  label="Access Mode"
                ></v-select>
              </v-col>
            </v-row>
          </div>

          <v-row>
            <v-col
              cols="12"
            >
              <v-btn
              elevation="2"
              icon
              small
              @click="addVolumeLine()"
              >
                  <v-icon dark >
                      mdi-plus
                  </v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- CRONJOBS -->
      <v-expansion-panel bg-color="rgb(var(--v-theme-cardBackground))">
        <v-expansion-panel-title class="text-uppercase text-caption-2 font-weight-medium" color="cardBackground">Cronjobs</v-expansion-panel-title>
        <v-expansion-panel-text color="cardBackground">
          <div v-for="(cronjob, index) in cronjobs" :key="index">
            <v-row>
              <v-col
                cols="12"
                md="3"
              >
                <v-text-field
                  v-model="cronjob.name"
                  label="name"
                  :readonly="app!='new'"
                ></v-text-field>
              </v-col>
              <v-col
                cols="12"
                md="2"
              >
                <v-text-field
                  v-model="cronjob.schedule"
                  label="schedule"
                  :rules="cronjobScheduleRules"
                ></v-text-field>
              </v-col>
              <v-col
                cols="12"
                md="1"
              >
                <v-btn
                elevation="2"
                icon
                small
                @click="removeCronjobLine(cronjob.name)"
                >
                    <v-icon dark >
                        mdi-minus
                    </v-icon>
                </v-btn>
              </v-col>
            </v-row>

            <v-row>
              <v-col
                cols="12"
                md="3"
              >
                <v-text-field
                  v-model="cronjob.image"
                  label="image"
                ></v-text-field>
              </v-col>
              <v-col
                cols="12"
                md="3"
              >
                <v-text-field
                  v-model="cronjob.command"
                  label="command"
                ></v-text-field>
              </v-col>
            </v-row>
          </div>

          <v-row>
            <v-col
              cols="12"
            >
              <v-btn
              elevation="2"
              icon
              small
              @click="addCronjobLine()"
              >
                  <v-icon dark >
                      mdi-plus
                  </v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- HEALTHCHECK --> 
      <v-expansion-panel bg-color="rgb(var(--v-theme-on-surface-variant))" :style="advanced ? 'display: block;' : 'display: none;'">
        <v-expansion-panel-title class="text-uppercase text-caption-2 font-weight-medium" color="secondary">Health check</v-expansion-panel-title>
        <v-expansion-panel-text color="secondary">

          <v-row>
            <v-col
              cols="12"
              md="3"
            >
              <v-switch
                v-model="healthcheck.enabled"
                label="Health Check Enabled"
                color="primary"
              ></v-switch>
            </v-col>
          </v-row>
          <v-row>
            <v-col
              cols="12"
              md="3"
            >
                <v-text-field
                  v-model="healthcheck.path"
                  label="Path"
                  :counter="60"
                ></v-text-field>
            </v-col>
            <v-col
              cols="12"
              md="3"
            >
                <v-text-field
                  v-model="healthcheck.startupSeconds"
                  label="Startup Seconds"
                  :counter="60"
                ></v-text-field>
            </v-col>
            <v-col
              cols="12"
              md="3"
            >
                <v-text-field
                  v-model="healthcheck.timeoutSeconds"
                  label="Timeout Seconds"
                  :counter="60"
                ></v-text-field>
            </v-col>
            <v-col
              cols="12"
              md="3"
            >
                <v-text-field
                  v-model="healthcheck.periodSeconds"
                  label="Interval Seconds"
                  :counter="60"
                ></v-text-field>
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

      <!-- ADDONS -->
      <div class="text-uppercase text-caption-2 font-weight-medium pt-5">Addons</div>
      <Addons :addons="addons" :appname="name"/>

      <!-- SUBMIT -->
      <v-row class="pt-5">
        <v-col
          cols="12"
          md="4"
        >
            <v-btn
                color="primary"
                v-if="app=='new'"
                elevation="2"
                @click="createApp()"
                :disabled="!valid"
                >Create</v-btn>
            <v-btn
                color="primary"
                v-if="app!='new'"
                elevation="2"
                @click="updateApp()"
                :disabled="!valid"
                >Update</v-btn>
        </v-col>
        <!--
        <v-col
          cols="12"
          md="4"
        >
            <v-btn
                color="error"
                v-if="app!='new'"
                elevation="2"
                @click="deleteApp()"
                >Delete</v-btn>
        </v-col>
        -->
      </v-row>
    </v-container>
  </v-form>
</template>


<script lang="ts">
import axios from "axios";
import Addons from "./addons.vue";
import { defineComponent } from 'vue'
import { useKuberoStore } from '../../stores/kubero'
import { mapState } from 'pinia'
import Breadcrumbs from "../breadcrumbs.vue";

type App = {
    name: string,
    git: {
        repository: GitRepo,
    },
    phases: {
        name: string,
        enabled: boolean,
    }[]
}

type AppList = {
    items: App[]
}

type Cronjob = {
  name: string,
  schedule: string,
  image: string,
  command: any,
  restartPolicy: string,
}

type Podsize = {
  text: string,
  value: string,
}

type Volume = {
  name: string,
  emptyDir: boolean,
  storageClass: string,
  size: string,
  accessMode: string,
  accessModes: string[],
  mountPath: string,
}

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

type Ingress = {
  annotations: any,
  className: string,
  hosts: {
    host: string,
    paths: {
      path: '/',
      pathType: 'ImplementationSpecific' | 'Prefix' | 'Exact',
    }[],
  }[],
  tls: {
    hosts: string[], 
    secretName: string
  }[],
}

type ServiceAccount = {
  annotations: any,
}

type Buildpack = {
  name?: string,
  run: BuildpackStepConfig,
  build: {
    command: string,
  },
  fetch: BuildpackStepConfig,
}

type BuildpackStepConfig = {
  readOnlyAppStorage: boolean,
  command: string,
  securityContext: {
    readOnlyRootFilesystem: boolean,
    allowPrivilegeEscalation: boolean,
    runAsNonRoot: boolean,
    runAsUser: number,
    runAsGroup: number,
    capabilities: {
      add: string[],
      drop: string[],
    },
  },
}

type GitRepo = {
  admin: boolean,
  clone_url: string,
  default_branch: string,
  description: string,
  homepage: string,
  id: number,
  language: string,
  name: string,
  node_id: string,
  owner: string,
  private: boolean,
  push: boolean,
  ssh_url: string,
  visibility: string,
}

export type EnvVar = {
  name: string,
  value: string,
}

type SAAnnotations = {
  annotation: string,
  value: string,
}

type Phase = {
  name: string;
  enabled: boolean;
  context: string;
  domain: string;
  defaultTTL?: number;
  defaultEnvvars: EnvVar[];
}

export default defineComponent({
    props: {
      pipeline: {
        type: String,
        default: "MISSING"
      },
      phase: {
        type: String,
        default: "MISSING"
      },
      app: {
        type: String,
        default: "new"
      },
    },
    data () {
    return {
      breadcrumbItems: [
          {
              title: 'dashboard.pipelines',
              disabled: false,
              to: { name: 'Pipelines', params: {}}
          },
          {
              title: 'Pipeline.'+this.pipeline,
              text: this.pipeline,
              disabled: false,
              to: { name: 'Pipeline Apps', params: { pipeline: this.pipeline }}
          },
          {
              title: 'Phase.'+this.phase,
              disabled: false,
              to: this.getAppBreadcrumbLink(),
          },
          {
              title: 'App.'+this.app,
              disabled: false,
              to: this.getAppBreadcrumbLink(),
          }
      ],
      takenDomains: [] as string[],
      advanced: false,
      panel: [0],
      valid: false,
      sleep: 'disabled',
      sleepEnabled: false,
      envFile: [],
      buildpacks: [] as { text: string, value: Buildpack }[],
      basicAuth: {
        enabled: false,
        realm: 'Authentication required',
        accounts: [] as { user: string, pass: string }[],
      },
      buildpack: {
        run: {
          readOnlyAppStorage: true,
          command: '',
          securityContext: {
            readOnlyRootFilesystem: true,
            allowPrivilegeEscalation: false,
            runAsNonRoot: false,
            runAsUser: 0,
            runAsGroup: 0,
            capabilities: {
              add: [],
              drop: [],
            },
          },
        },
        build: {
          command: '',
        },
        fetch: {
          readOnlyAppStorage: true,
          command: '',
          securityContext: {
            readOnlyRootFilesystem: true,
            allowPrivilegeEscalation: false,
            runAsNonRoot: false,
            runAsUser: 0,
            runAsGroup: 0,
            capabilities: {
              add: [],
              drop: [],
            },
          },
        },
      } as Buildpack,
      image: {
        run: {
          readOnlyAppStorage: true,
          command: '',
          securityContext: {
            readOnlyRootFilesystem: true,
            allowPrivilegeEscalation: false,
            runAsNonRoot: false,
            runAsUser: 0,
            runAsGroup: 0,
            capabilities: {
              add: [],
              drop: [],
            },
          },
        },
        build: {
          command: '',
        },
        fetch: {
          readOnlyAppStorage: true,
          command: '',
          securityContext: {
            readOnlyRootFilesystem: true,
            allowPrivilegeEscalation: false,
            runAsNonRoot: false,
            runAsUser: 0,
            runAsGroup: 0,
            capabilities: {
              add: [],
              drop: [],
            },
          },
        },
      } as Buildpack,
      imageTag: '',
      deploymentstrategy: "docker",
      buildstrategy: "plain",
      pipelineData: {
        domain: '',
        dockerimage: '',
        buildpack: {} as Buildpack,
        git: {
          provider: '',
          repository: {} as GitRepo,
        },
        buildstrategy: 'plain',
        deploymentstrategy: 'docker',
        phases: [] as Phase[],
      },
      name: '',
      resourceVersion: '',
      /*
      phases: [
        { text: 'Production', value: 'production' },
        { text: 'Staging', value: 'stage' },
        { text: 'Testing', value: 'test' },
      ],
      */
      gitrepo: {
        admin: false,
        clone_url: '',
        default_branch: 'main',
        description: "",
        homepage: "",
        id: 0,
        language: "",
        name: "",
        node_id: "",
        owner: "",
        private: false,
        push: true,
        ssh_url: "",
        visibility: "public",
      } as GitRepo,
      branch: 'main',
      branchesList: [] as string[],
      docker: {
        image: 'ghcr.io/kubero-dev/idler',
        tag: 'latest',
        command: '',
      },
      autodeploy: true,
      sslIndex: [] as (boolean|undefined)[],
      envVars: [
        //{ name: '', value: '' },
      ] as EnvVar[],
      sAAnnotations: [
        //{ annotation: '', value: '' },
      ] as SAAnnotations[],
      containerPort: 8080,
      podsize: '',
      podsizes: [
        /*
        { text: 'Small (0.2m cpu, 0.5g ram)', value: 'small' },
        { text: 'Medium (0.5m cpu, 1g ram)', value: 'medium' },
        { text: 'Large (1m cpu, 1.5g ram)', value: 'large' },
        { text: 'XLarge (2m cpu, 2.5g ram)', value: 'xlarge' },
        */
      ] as Podsize[],
      autoscale: false,
      webreplicas: 1,
      workerreplicas: 0,
      webreplicasrange: [1,3],
      workerreplicasrange: [0,0],
      cronjobs: [
        /*
        {
          name: '',
          schedule: '',
          image: '',
          command: '',
          restartPolicy: 'OnFailure',
        },
        */
      ] as Cronjob[],
      ingressClasses: [
        /*
        'nginx',
        */
      ] as string[],
      storageclasses : [
/*
        'standard',
        'standard-fast',
*/
      ] as string[],
      extraVolumes: [
        /*
        {
          name: 'example-volume',
          emptyDir: false,
          storageClass: 'standard',
          size: '1Gi',
          accessMode: ['ReadWriteOnce']
          mountPath: '/example/path',
        },
        */
      ] as Volume[],
      addons: [
        /*
        {
          id: "redis",
          name: 'Redis',
          version: 'v0.0.1'
        },
        */

      ] as Addon[],
      letsecryptClusterIssuer: 'letsencrypt-prod',
      // deprecated in version 1.11.0
      security: {
        allowPrivilegeEscalation: false,
        runAsNonRoot: false,
        readOnlyRootFilesystem: true,
        runAsUser: 0,
        runAsGroup: 0,
        capabilities: {
          add: [],
          drop: [],
        }
      },
      serviceAccount: {
        annotations: {} as any,
      } as ServiceAccount,
      ingress: {
        annotations: {
          'nginx.ingress.kubernetes.io/whitelist-source-range': '',
          'nginx.ingress.kubernetes.io/denylist-source-range': '',
          'nginx.ingress.kubernetes.io/force-ssl-redirect': 'false',
          'nginx.ingress.kubernetes.io/proxy-buffer-size': '4k',
          'nginx.ingress.kubernetes.io/enable-cors': 'false',
          'nginx.ingress.kubernetes.io/cors-allow-origin': '*',
          'nginx.ingress.kubernetes.io/cors-allow-headers': 'DNT,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization',
          'nginx.ingress.kubernetes.io/cors-expose-headers': '*',
          'nginx.ingress.kubernetes.io/cors-allow-credentials': 'true',
          'nginx.ingress.kubernetes.io/cors-max-age': '1728000',
          'nginx.ingress.kubernetes.io/cors-allow-methods': 'GET, PUT, POST, DELETE, PATCH, OPTIONS',
        },
        hosts: [
          {
            host: '',
            paths: [
              { path: '/', pathType: 'ImplementationSpecific' },
            ],
          },
        ],
        tls: [] as { hosts: string[], secretName: string }[],
      } as Ingress,
      capabilities: [
        'AUDIT_CONTROL',
        'AUDIT_READ',
        'AUDIT_WRITE',
        'BLOCK_SUSPEND',
        'CHOWN',
        'DAC_OVERRIDE',
        'DAC_READ_SEARCH',
        'FOWNER',
        'FSETID',
        'IPC_LOCK',
        'IPC_OWNER',
        'KILL',
        'LEASE',
        'LINUX_IMMUTABLE',
        'MAC_ADMIN',
        'MAC_OVERRIDE',
        'MKNOD',
        'NET_ADMIN',
        'NET_BIND_SERVICE',
        'NET_BROADCAST',
        'NET_RAW',
        'SETFCAP',
        'SETGID',
        'SETPCAP',
        'SETUID',
        'SYS_ADMIN',
        'SYS_BOOT',
        'SYS_CHROOT',
        'SYS_MODULE',
        'SYS_NICE',
        'SYS_PACCT',
        'SYS_PTRACE',
        'SYS_RAWIO',
        'SYS_RESOURCE',
        'SYS_TIME',
        'SYS_TTY_CONFIG',
        'SYSLOG',
        'WAKE_ALARM',
      ],
      vulnerabilityscan: {
        enabled: false,
        schedule: "0 0 * * *",
        image: {
          repository: 'aquasec/trivy',
          tag: 'latest',
        },
      },
      healthcheck: {
        enabled: true,
        path: '/',
        startupSeconds: 90,
        timeoutSeconds: 3,
        periodSeconds: 10,
      },
      nameRules: [
        (v: any) => !!v || 'Name is required',
        (v: any) => v.length <= 60 || 'Name must be less than 60 characters',
        (v: any) => /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(v) || 'Allowed characters : [a-zA-Z0-9_-]',
      ],
      repositoryRules: [
        //(v: any) => !!v || 'Repository is required',
        //(v: any) => v.length <= 120 || 'Repository must be less than 120 characters',
        //    ((git|ssh|http(s)?)|(git@[\w\.]+))(:(//)?)([\w\.@\:/\-~]+)(\.git)(/)?
        //    ((git|ssh|http(s)?)|(git@[\w.]+))(:(\/\/)?)([\w.@:\/\-~]+)(\.git)
        //    (git@[\w.]+:\/\/)([\w.\/\-~]+)(\.git) // not working
        //    ((git|ssh|http(s)?)|(git@[\w\.-]+))(:(//)?)([\w\.@\:/\-~]+)(\.git)(/)?
        (v: any) => /^((git|ssh|http(s)?)|(git@[\w\.-]+))(:(\/\/)?)([\w\.@\:\/\-~]+)(\.git)(\/)?/.test(v) || 'Format "git@github.com:organisation/repository.git"',
      ],
      domainRules: [
        (v: any) => !!v || 'Domain is required',
        (v: any) => v.length <= 253 || 'Name must be less than 253 characters',
        (v: any) => /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/.test(v) || 'Not a domain',
        (v: any) => this.checkDomainAvailability(v) || 'Domain already taken',
      ],
      cronjobScheduleRules: [
        (v: any) => !!v || 'Schedule is required',
        (v: any) => /(((\d+,)+\d+|(\d+(\/|-)\d+)|\d+|\*) ?){5,7}/.test(v) || 'Not a valid crontab format',
      ],
      uidRules: [
        //v => !!v || 'UID is required',
        (v: any) => /^\d+$/.test(v) || 'Not a number',
      ],
/*
      buildpackRules: [
        v => !!v || 'Buildpack is required',
        v => /(NodeJS|Docker)$/.test(v) || 'select a valid buildpack',
      ],
*/
    }},
    computed: {
      kuberoConfig() {
        const store = useKuberoStore()
        return store.kubero
      },
    },
    mounted() {
      this.loadPipelineAndApp();
      this.loadStorageClasses();
      this.loadPodsizeList();
      this.loadBuildpacks();
      this.loadClusterIssuers();
      this.getDomains();

      if (this.$route.query.template) {
        const template = this.$route.query.template as string;
        this.loadTemplate(template);
      }

      //this.buildPipeline = this.$vuetify.buildPipeline
      //console.log("loadPipeline", this.$vuetify.buildPipeline);
    },
    components: {
        Addons,
        Breadcrumbs,
    },
    methods: {
      addDomainLine() {
        this.ingress.hosts.push({ host: '', paths: [{ path: '/', pathType: 'ImplementationSpecific' }] });
        this.sslIndex.push(false);
      },
      removeDomainLine(index: number) {
        this.ingress.hosts.splice(index, 1);
        this.sslIndex.splice(index, 1);
      },
      whiteListDomains(domainsList: string[]) {
        for (let i = 0; i < domainsList.length; i++) {
          this.ingress.hosts.forEach((host) => {
            if (host.host == domainsList[i]) {
              domainsList.splice(i, 1);
            }
          });
        }
        return domainsList;
      },
      getDomains() {
        axios.get('/api/kubernetes/domains').then(response => {
          this.takenDomains = this.whiteListDomains(response.data);
        });
      },
      checkDomainAvailability(domain: string) {
        if (this.takenDomains.includes(domain)) {
          return false;
        } else {
          return true;
        }
      },
      getAppBreadcrumbLink() {
        if (this.app == 'new') {
          return { name: 'Pipeline Apps', params: { pipeline: this.pipeline }};
        } else {
          return { name: 'App Dashboard', params: { pipeline: this.pipeline, phase: this.phase, app: this.app }};
        }
      },
      loadClusterIssuers(){
        axios.get('/api/config/clusterissuer').then(response => {
          this.letsecryptClusterIssuer = response.data.clusterissuer;
        });
      },
      loadTemplate(template: string) {
        axios.get('/api/templates/'+template).then(response => {

          this.name = response.data.name;
          this.containerPort = response.data.image.containerPort;
          this.deploymentstrategy = response.data.deploymentstrategy;

          this.docker.image = response.data.image.repository;
          this.docker.tag = response.data.image.tag;

          this.envVars = response.data.envVars;
          if (response.data.serviceAccount && response.data.serviceAccount.annotations) {
            this.sAAnnotations = Object.entries(response.data.serviceAccount.annotations).map(([key, value]) => ({annotation: key, value: value as string}));
          }
          this.extraVolumes = response.data.extraVolumes;
          this.cronjobs = response.data.cronjobs;
          this.addons = response.data.addons;

          if (this.healthcheck) {
            this.healthcheck = response.data.healthcheck;
          }

          if (response.data.image.build) {
            //console.log("buildpack build", response.data.image.build);
            this.buildpack.build = response.data.image.build;
          } 

          if (response.data.image.run) {
            this.buildpack.run = response.data.image.run;
          }

          // Open Panel if there is some data to show
          if (this.envVars.length > 0) {
            this.panel.push(6)
          }
          if (Object.keys(this.sAAnnotations).length > 0) {
            this.panel.push(5)
          }
          if (this.extraVolumes.length > 0) {
            this.panel.push(8)
          }
          if (this.cronjobs.length > 0) {
            this.panel.push(9)
          }

          // Backward compatibility older v1.11.1
          if (this.buildpack && this.buildpack.run && this.buildpack.run.readOnlyAppStorage === undefined) {
            this.buildpack.run.readOnlyAppStorage = true;
          }
        });
      },
      changeName(name: string) {
        this.ingress.hosts[0].host = name+"."+this.pipelineData.domain;
      },
      loadPipelineAndApp() {
        axios.get('/api/pipelines/'+this.pipeline).then(response => {
          this.pipelineData = response.data;

          if (this.pipelineData.dockerimage) {
            this.docker.image = this.pipelineData.dockerimage;
          }

          this.loadBranches();
          this.buildpack = this.pipelineData.buildpack;
          this.buildstrategy = this.pipelineData.buildstrategy;
          //this.deploymentstrategy = this.pipelineData.deploymentstrategy;

          if (this.app == 'new') {

            if (this.pipelineData.git.repository.clone_url == '') {
              this.deploymentstrategy = 'docker';
            } else {
              this.deploymentstrategy = 'git';
            }

            // extract domain from pipeline phase
            for (let i = 0; i < this.pipelineData.phases.length; i++) {
              if (this.pipelineData.phases[i].name == this.phase) {
                if (this.pipelineData.phases[i].domain && this.pipelineData.phases[i].domain != '') {
                  this.ingress.hosts[0].host = this.pipelineData.phases[i].domain;
                } else {
                  this.ingress.hosts[0].host = this.pipelineData.domain;
                }
              }
            }

            // extract defaultEnvvars from pipeline phase
            for (let i = 0; i < this.pipelineData.phases.length; i++) {
              if (this.pipelineData.phases[i].name == this.phase) {
                this.envVars = this.pipelineData.phases[i].defaultEnvvars;
              }
            }

            // Open Panel if there is some data to show
            if (this.envVars.length > 0) {
              this.panel.push(6)
            }


            if (this.pipelineData.git.repository.admin == true) {
              this.gitrepo = this.pipelineData.git.repository;
            }

            /* TODO: auto select/sugest buildpack based on language
            switch (this.pipelineData.github.repository.language) {
              case "JavaScript":
                this.buildpack = 'NodeJS';
                break;
              case "Python":
                this.buildpack = 'Python';
                break;
              default:
                this.buildpackDisabled = false;
                //this.buildpack = "";
                break;
            }
            */
          }

          // Backward compatibility older v1.11.1
          if (this.buildpack && this.buildpack.run && this.buildpack.run.readOnlyAppStorage === undefined) {
            this.buildpack.run.readOnlyAppStorage = true;
          }

          if (this.app != 'new') {
            this.loadApp();
          }


        });
      },
      loadStorageClasses() {
        axios.get('/api/kubernetes/storageclasses').then(response => {
          for (let i = 0; i < response.data.length; i++) {
            this.storageclasses.push(response.data[i].name);
          }
        });
      },
      loadBranches() {

        // empty if not connected
        if (!this.pipelineData.git.provider ) {
          return;
        }

        // encode string to base64 (for ssh url)
        const gitrepoB64 = btoa(this.pipelineData.git.repository.ssh_url);
        const gitprovider = this.pipelineData.git.provider;

        axios.get('/api/repo/'+gitprovider+"/"+gitrepoB64+"/branches").then(response => {
          if (response.data.length === 0) {
            return;
          }

          for (let i = 0; i < response.data.length; i++) {
            this.branchesList.push(response.data[i]);
          }
         
          // set default branch based on te repository's default branch
          let defaultBranch = this.pipelineData.git.repository.default_branch;
          if (this.branchesList.includes(defaultBranch)) {
            this.branch = defaultBranch;
          } else {
            this.branch = this.branchesList[0];
          }          
        });
      },


      loadPodsizeList() {
        axios.get('/api/config/podsizes').then(response => {
          if (response.data.length > 0 && this.app == 'new') {
            this.podsize = response.data[0];
          }
          for (let i = 0; i < response.data.length; i++) {
            this.podsizes.push({
              text: response.data[i].description,
              value: response.data[i],
            });
          }
        });
      },
      // eslint-disable-next-line no-unused-vars
      updatePodsize(podsize: any) {
        //console.log(podsize);
        //this.podsize = podsize;
      },

      loadBuildpacks() {
        axios.get('/api/config/runpacks').then(response => {
          for (let i = 0; i < response.data.length; i++) {
            this.buildpacks.push({
              text: response.data[i].name,
              value: response.data[i] as Buildpack,
            });
          }
        });
      },
      updateBuildpack(buildpack: Buildpack) {
        //console.log(buildpack);
        this.buildpack = buildpack;
      },

      deleteApp() {
        axios.delete(`/api/apps/${this.pipeline}/${this.phase}/${this.app}`)
          .then(() => {
            // wait for 1 second and redirect to apps page
            // this avoids a race condition with the backend
            setTimeout(() => {
              this.$router.push(`/pipeline/${this.pipeline}/apps`);
            }, 1000);
          })
          .catch(error => {
            console.log(error);
          });
      },
      loadApp() {
        if (this.app !== 'new') {
          axios.get(`/api/apps/${this.pipeline}/${this.phase}/${this.app}`).then(response => {
            this.resourceVersion = response.data.metadata.resourceVersion;

            // Open Panel if there is some data to show
            if (response.data.spec.envVars.length > 0) {
              this.panel.push(6)
            }
            if (response.data.spec.serviceAccount && Object.entries(response.data.spec.serviceAccount?.annotations).length > 0) {
              this.panel.push(5)
            }
            if (response.data.spec.extraVolumes.length > 0) {
              this.panel.push(8)
            }
            if (response.data.spec.cronjobs.length > 0) {
              this.panel.push(9)
            }

            let command = '';
            if (response.data.spec.image.command) {
              command = response.data.spec.image.command.join(' ');
            }

            this.security = response.data.spec.image.run.securityContext || {};

            this.deploymentstrategy = response.data.spec.deploymentstrategy;
            this.buildstrategy = response.data.spec.buildstrategy || 'plain';
            this.name = response.data.spec.name;
            this.sleep = response.data.spec.sleep;
            this.basicAuth = response.data.spec.basicAuth || { enabled: false, realm: 'Authentication required', accounts: [] };
            this.buildpack = {
              run: response.data.spec.image.run,
              build: response.data.spec.image.build,
              fetch: response.data.spec.image.fetch,
            }
            this.gitrepo = response.data.spec.gitrepo;
            this.branch = response.data.spec.branch;
            this.imageTag = response.data.spec.imageTag;
            this.docker.image = response.data.spec.image.repository || '';
            this.docker.tag = response.data.spec.image.tag || 'latest';
            this.docker.command = command;
            this.autodeploy = response.data.spec.autodeploy;
            this.envVars = response.data.spec.envVars;
            this.serviceAccount = response.data.spec.serviceAccount;
            if (response.data.spec.serviceAccount && response.data.spec.serviceAccount.annotations) {
              this.sAAnnotations = Object.entries(response.data.spec.serviceAccount.annotations).map(([key, value]) => ({annotation: key, value: value as string}));
            }
            this.extraVolumes = response.data.spec.extraVolumes;
            this.containerPort = response.data.spec.image.containerPort;
            this.podsize = response.data.spec.podsize;
            this.autoscale = response.data.spec.autoscale;
            this.webreplicas = response.data.spec.web.replicaCount;
            this.workerreplicas = response.data.spec.worker.replicaCount;
            this.webreplicasrange = [response.data.spec.web.autoscaling.minReplicas, response.data.spec.web.autoscaling.maxReplicas];
            this.workerreplicasrange = [response.data.spec.worker.autoscaling.minReplicas, response.data.spec.worker.autoscaling.maxReplicas];
            this.cronjobs = this.cronjobUnformat(response.data.spec.cronjobs) || [];
            this.addons= response.data.spec.addons || [];
            this.vulnerabilityscan = response.data.spec.vulnerabilityscan;
            this.ingress = response.data.spec.ingress || {};
            this.healthcheck = response.data.spec.healthcheck || { enabled: true, path: '/', startupSeconds: 90, timeoutSeconds: 30, periodSeconds: 10 };

            // iterate over ingress hosts and fill sslIndex
            for (let i = 0; i < this.ingress.hosts.length; i++) {
              this.sslIndex.push(this.ingress.tls[0].hosts.includes(this.ingress.hosts[i].host));
            }

            // Backward compatibility older v1.11.1
            if (this.buildpack && this.buildpack.run && this.buildpack.run.readOnlyAppStorage === undefined) {
              this.buildpack.run.readOnlyAppStorage = true;
            }

            // remove loaded domain from taken domains
            this.takenDomains = this.whiteListDomains(this.takenDomains);
          });
        }
      },
      setSSL() {
        if (this.ingress.tls?.length == 0) {
          this.ingress.tls = [{ hosts: [], secretName: this.name+'-tls' }];
        }
        this.ingress.tls[0].hosts = [];
        this.ingress.tls[0].secretName = this.name+'-tls';
        this.ingress.hosts.forEach((host, index) => {
          if (this.sslIndex[index]) {
            this.ingress.tls[0].hosts.push(host.host);
          }
        });
      },
      cleanupIngressAnnotations(){

        if (this.ingress.tls?.length == 0) {
          delete this.ingress.annotations['cert-manager.io/cluster-issuer'];
          delete this.ingress.annotations['kubernetes.io/tls-acme'];
        } else {
          this.ingress.annotations['cert-manager.io/cluster-issuer'] = this.letsecryptClusterIssuer;
          this.ingress.annotations['kubernetes.io/tls-acme'] = 'true';
        }

        if (this.ingress.annotations['nginx.ingress.kubernetes.io/whitelist-source-range'] == '') {
          delete this.ingress.annotations['nginx.ingress.kubernetes.io/whitelist-source-range'];
        }

        if (this.ingress.annotations['nginx.ingress.kubernetes.io/denylist-source-range'] == '') {
          delete this.ingress.annotations['nginx.ingress.kubernetes.io/denylist-source-range'];
        }

        if (this.ingress.annotations['nginx.ingress.kubernetes.io/force-ssl-redirect'] == false) {
          delete this.ingress.annotations['nginx.ingress.kubernetes.io/force-ssl-redirect'];
        }

        if (this.ingress.annotations['nginx.ingress.kubernetes.io/proxy-buffer-size'] == '4k') {
          delete this.ingress.annotations['nginx.ingress.kubernetes.io/proxy-buffer-size'];
        }

        if (this.ingress.annotations['nginx.ingress.kubernetes.io/enable-cors'] == 'false') {
          delete this.ingress.annotations['nginx.ingress.kubernetes.io/enable-cors'];
          delete this.ingress.annotations['nginx.ingress.kubernetes.io/cors-allow-origin'];
          delete this.ingress.annotations['nginx.ingress.kubernetes.io/cors-allow-headers'];
          delete this.ingress.annotations['nginx.ingress.kubernetes.io/cors-expose-headers'];
          delete this.ingress.annotations['nginx.ingress.kubernetes.io/cors-allow-credentials'];
          delete this.ingress.annotations['nginx.ingress.kubernetes.io/cors-max-age'];
          delete this.ingress.annotations['nginx.ingress.kubernetes.io/cors-allow-methods'];
        }

      },
      updateApp() {

        if (this.gitrepo.ssh_url == this.pipelineData.git.repository.ssh_url) {
            this.gitrepo = this.pipelineData.git.repository;
        }

        if (this.gitrepo.admin == false) {
          //this.gitrepo.clone_url = this.gitrepo.ssh_url.replace(':', '/').replace('git@', 'https://');
          // eslint-disable-next-line no-useless-escape
          const regex = /(git@|ssh:|http[s]?:\/\/)([\w\.]+)(:|\/)([\w\/\-~]+)(\.git)?/;
          this.gitrepo.clone_url = this.gitrepo.ssh_url.replace(regex, "https://$2/$4$5");
        }

        this.cleanupIngressAnnotations();
        this.setSSL();

        let command = [] as string[];
        if (this.docker.command.length > 0) {
          command = this.docker.command.split(' ');
        } else {
          command = [];
        }

        let postdata = {
          pipeline: this.pipeline,
          phase: this.phase,
          resourceVersion: this.resourceVersion,
          buildpack: this.buildpack,
          name: this.name,
          sleep: this.sleep,
          basicAuth: this.basicAuth,
          gitrepo: this.gitrepo,
          branch: this.branch,
          deploymentstrategy: this.deploymentstrategy,
          buildstrategy: this.buildstrategy,
          image : {
            containerPort: this.containerPort,
            repository: this.docker.image,
            tag: this.docker.tag,
            command: command,
            fetch: this.buildpack?.fetch,
            build: this.buildpack?.build,
            run: this.buildpack?.run,
          },
          autodeploy: this.autodeploy,
          envVars: this.envVars,
          // loop through serviceaccount annotations and convert to object
          serviceAccount: {
            annotations: this.sAAnnotations.reduce((acc, cur) => {
              acc[cur.annotation] = cur.value;
              return acc;
            }, {} as any),
          },
          podsize: this.podsize,
          autoscale: this.autoscale,
          web: {
            replicaCount: this.webreplicas || 0,
            autoscaling: {
              minReplicas: this.webreplicasrange[0] || 0,
              maxReplicas: this.webreplicasrange[1] || 0,
              targetCPUUtilizationPercentage : 80,
              targetMemoryUtilizationPercentage : 80,
            },
          },
          worker: {
            replicaCount: this.workerreplicas || 0,
            autoscaling: {
              minReplicas: this.workerreplicasrange[0] || 0,
              maxReplicas: this.workerreplicasrange[1] || 0,
              targetCPUUtilizationPercentage : 80,
              targetMemoryUtilizationPercentage : 80,
            },
          },
          extraVolumes: this.extraVolumes,
          cronjobs: this.cronjobFormat(this.cronjobs),
          addons: this.addons,
          security: this.security,
          ingress: this.ingress,
          vulnerabilityscan: this.vulnerabilityscan,
          healthcheck: this.healthcheck,
        }

        if (typeof postdata.image.run.securityContext.runAsUser === 'string') {
          postdata.image.run.securityContext.runAsUser = parseInt(postdata.image.run.securityContext.runAsUser);
        }
        if (typeof postdata.image.run.securityContext.runAsGroup === 'string') {
          postdata.image.run.securityContext.runAsGroup = parseInt(postdata.image.run.securityContext.runAsGroup);
        }

        axios.put(`/api/apps/${this.pipeline}/${this.phase}/${this.app}/${this.resourceVersion}`, postdata
          // eslint-disable-next-line no-unused-vars
        ).then(response => {
          this.$router.push(`/pipeline/${this.pipeline}/apps`);
          //console.log(response);
        }).catch(error => {
          console.log(error);
        });
      },
      createApp() {
        if (this.pipelineData.buildpack !== undefined) {
          if (
            (this.buildpack.build.command !== this.pipelineData.buildpack.build.command) ||
            (this.buildpack.run.command !== this.pipelineData.buildpack.run.command)
          ){
            this.buildpack.name = "custom";
          }
        }

        if (this.gitrepo.ssh_url == this.pipelineData.git.repository.ssh_url) {
            this.gitrepo = this.pipelineData.git.repository;
        }

        if (this.gitrepo.admin == false) {
          // eslint-disable-next-line no-useless-escape
          const regex = /(git@|ssh:|http[s]?:\/\/)([\w\.]+)(:|\/)([\w\/\-~]+)(\.git)?/;
          this.gitrepo.clone_url = this.gitrepo.ssh_url.replace(regex, "https://$2/$4$5");
        }

        if (this.deploymentstrategy == "git" && this.buildstrategy != "plain" ) {
          this.docker.image = "ghcr.io/kubero-dev/idler"
          this.docker.tag = "v1"
        }

        this.cleanupIngressAnnotations();
        this.setSSL();

        let postdata = {
          pipeline: this.pipeline,
          buildpack: this.buildpack,
          phase: this.phase,
          name: this.name.toLowerCase(),
          sleep: this.sleep,
          basicAuth: this.basicAuth,
          gitrepo: this.gitrepo,
          branch: this.branch,
          deploymentstrategy: this.deploymentstrategy,
          buildstrategy: this.buildstrategy,
          image : {
            containerPort: this.containerPort,
            repository: this.docker.image,
            tag: this.docker.tag,
            fetch: this.buildpack?.fetch,
            build: this.buildpack?.build,
            run: this.buildpack?.run,
          },
          autodeploy: this.autodeploy,
          envVars: this.envVars,
          serviceAccount: {
            annotations: this.sAAnnotations.reduce((acc, cur) => {
              acc[cur.annotation] = cur.value;
              return acc;
            }, {} as any),
          },
          podsize: this.podsize,
          autoscale: this.autoscale,
          web: {
            replicaCount: this.webreplicas || 0,
            autoscaling: {
              minReplicas: this.webreplicasrange[0] || 0,
              maxReplicas: this.webreplicasrange[1] || 0,
              targetCPUUtilizationPercentage : 80,
              targetMemoryUtilizationPercentage : 80,
            },
          },
          worker: {
            replicaCount: this.workerreplicas || 0,
            autoscaling: {
              minReplicas: this.workerreplicasrange[0] || 0,
              maxReplicas: this.workerreplicasrange[1] || 0,
              targetCPUUtilizationPercentage : 80,
              targetMemoryUtilizationPercentage : 80,
            },
          },
          extraVolumes: this.extraVolumes,
          cronjobs: this.cronjobFormat(this.cronjobs),
          addons: this.addons,
          security: this.security,
          ingress: this.ingress,
          vulnerabilityscan: this.vulnerabilityscan,
          healthcheck: this.healthcheck,
        }

        if (postdata.image.run == undefined) {
          postdata.image.run = {} as BuildpackStepConfig;
        }

        if (typeof postdata.image.run.securityContext.runAsUser === 'string') {
          postdata.image.run.securityContext.runAsUser = parseInt(postdata.image.run.securityContext.runAsUser);
        }
        if (typeof postdata.image.run.securityContext.runAsGroup === 'string') {
          postdata.image.run.securityContext.runAsGroup = parseInt(postdata.image.run.securityContext.runAsGroup);
        }
/*
        postdata.image.run.securityContext = {
            readOnlyRootFilesystem: this.security.readOnlyRootFilesystem,
            runAsNonRoot: this.security.runAsNonRoot,
            runAsUser: parseInt(this.security.runAsUser),
            runAsGroup: parseInt(this.security.runAsGroup),
            capabilities: {
              add: this.security.capabilities.add,
              drop: this.security.capabilities.drop,
            },
        }
*/
        axios.post(`/api/apps/${this.pipeline}/${this.phase}/${this.app}`, postdata)
        // eslint-disable-next-line no-unused-vars
        .then(response => {
          this.name = '';
          //console.log(response);
          this.$router.push({path: '/pipeline/' + this.pipeline + '/apps'});
        })
        .catch(error => {
          console.log(error);
        });
      },
      addAuthLine() {
        this.basicAuth.accounts.push({
          user: '',
          pass: '',
        });
      },
      removeAuthLine(index: string) {
        for (let i = 0; i < this.basicAuth.accounts.length; i++) {
          if (this.basicAuth.accounts[i].user === index) {
            this.basicAuth.accounts.splice(i, 1);
          }
        }
      },
      addEnvLine() {
        this.envVars.push({
          name: '',
          value: '',
        });
      },
      removeEnvLine(index: string) {
        for (let i = 0; i < this.envVars.length; i++) {
          if (this.envVars[i].name === index) {
            this.envVars.splice(i, 1);
          }
        }
      },
      addSAAnnotationLine() {
        this.sAAnnotations.push({
          annotation: '', 
          value: '',
        });
      },
      removeSAAnnotationLine(index: string) {
        for (let i = 0; i < this.sAAnnotations.length; i++) {
          if (this.sAAnnotations[i].annotation === index) {
            this.sAAnnotations.splice(i, 1);
          }
        }
      },
      handleFileInput() {
        for (let i = 0; i < this.envFile.length; i++) {
          const file = this.envFile[i];
          const reader = new FileReader();
          reader.onload = () => {
            const text = reader.result;
            this.parseEnvFile(text);
          };
          reader.readAsText(file);
        }

        // clear file input
        this.envFile = [];
      },
      parseEnvFile(text: any) {
        const lines = text.split('\n');
        for (const line of lines) {
          const [name, value] = line.split('=');
          // check if name isn't commented out
          if (name && !name.startsWith('#') && value) {
            if (!this.envVars.some(envVars => envVars.name === name.trim())) {
              this.envVars.push({ name: name.trim(), value: value.trim() });
            }
          }
        }
      },
      addVolumeLine() {
        this.extraVolumes.push({
          name: 'example-volume',
          emptyDir: false,
          storageClass: 'standard',
          size: '1Gi',
          accessMode: 'ReadWriteOnce',
          accessModes: [
            'ReadWriteMany',
          ],
          mountPath: '/example/path',
        });
      },
      removeVolumeLine(index: string) {
        for (let i = 0; i < this.extraVolumes.length; i++) {
          if (this.extraVolumes[i].name === index) {
            this.extraVolumes.splice(i, 1);
          }
        }
      },
      addCronjobLine() {
        this.cronjobs.push({
          name: 'hello world',
          schedule: '* * * * *',
          image: 'busybox:1.28',
          command: '/bin/sh -c echo hello world',
          restartPolicy: 'OnFailure',
        });
      },
      removeCronjobLine(index: string) {
        for (let i = 0; i < this.cronjobs.length; i++) {
          if (this.cronjobs[i].name === index) {
            this.cronjobs.splice(i, 1);
          }
        }
      },
      cronjobFormat(cronjobs: Cronjob[]) {
        cronjobs.map(cronjob => {
          // TODO make sure cronjob has a valid structure
          cronjob.name = cronjob.name.replace(/\s/g, '-');
          cronjob.restartPolicy = 'OnFailure';

          //cronjob.command = cronjob.command.replace(/\s/g, '');
          //cronjob.command = cronjob.command.replace(/\//g, '-');
          //cronjob.command = cronjob.command.replace(/\*/g, '*');
          //cronjob.command = cronjob.command.split(" ");
          cronjob.command = cronjob.command.match(/(?:[^\s"]+|"[^"]*")+/g)
        });
        return cronjobs;
      },
      cronjobUnformat(cronjobs: Cronjob[]) {
        cronjobs.map(cronjob => {
          cronjob.command = cronjob.command.join(" ");
        });
        return cronjobs;
      },
    },
});
</script>

<style lang="scss">
.v-expansion-panel-text {
    background: cardBackground;
}
.v-expansion-panel-title {
    background: cardBackground;
}

.capability .theme--light.v-chip:not(.v-chip--active) {
    background: #BBB;
}

</style>
