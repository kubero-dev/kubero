<template>
  <v-form v-model="valid">
    <v-container>
      <Breadcrumbs :items="breadcrumbItems"></Breadcrumbs>
      <v-row>
        <v-col cols="12" sm="12" md="12" lg="12" xl="12">
            <h2 v-if="app=='new'">
                Create a new App in {{ pipeline }}
            </h2>
            <h2 v-if="app!='new'">
                Edit {{ app }} in {{ pipeline }}
            </h2>
            <p class="text-justify">
                in phase {{ phase }}
            </p>
        </v-col>
      </v-row>

      <v-row
       v-if="app==='new' && $route.query.template != undefined">
        <v-col
          cols="12"
          md="6"
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
          md="7"
        >
          <v-text-field
            v-model="appname"
            :rules="nameRules"
            :counter="60"
            :disabled="app!='new'"
            label="App name"
            v-on:input="changeName(appname)"
            required
          ></v-text-field>
        </v-col>
      </v-row>

      <v-row>
        <v-col
          cols="9"
          md="5"
        >
          <v-text-field
            v-model="domain"
            :rules="domainRules"
            :counter="60"
            label="Domain"
            required
          ></v-text-field>
        </v-col>
        <v-col
          cols="3"
          md="2"
          pullright
        >
          <v-switch
            v-model="ssl"
            label="SSL"
            density="compact"
            color="primary"
          ></v-switch>
        </v-col>
      </v-row>

      <v-row>
        <v-col
          cols="12"
          md="7"
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
                label="GitOps"
                value="git"
              ></v-radio>
              <v-radio
                label="Docker Image"
                value="docker"
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
                  label="Plain images"
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
                  :disabled="!buildPipeline"
                ></v-radio>
                <v-radio
                  key="2"
                  label="Dockerfile"
                  value="dockerfile"
                  :disabled="!buildPipeline"
                ></v-radio>
              </v-radio-group>
            </v-col>
            <v-col
              cols="12"
              md="8"
            >
            
              <v-alert variant="tonal" color="#8560a9" border="start" v-if="buildstrategy == 'plain'">
                <h3>
                  Plain
                </h3>
                <div>This is the default for kubero. Your code is running on official images. The code will be built for every pod. This is the fastes way, to run your code, but becomes more inefficient with every replica.</div>
              </v-alert>

              <v-alert variant="tonal" color="#8560a9" border="start" v-if="buildstrategy == 'nixpacks'">
                <h3>
                  Nixpacks
                </h3>
                <div>The running Images are build with nixpacks. Dockerfile is predicted and generated by the code in your repository.

                  Images are not optimized for size and speed of build.
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

              <v-alert variant="tonal" type="info" border="start" v-if="!buildPipeline" style="margin-top: 20px;">
                <h3>
                  Buildpipeline not configured
                </h3>
                <div>Configure the registry to use Nickspacks and Dockerfile build pipeline</div>
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
                label="Buildpack"
                @change="updateBuildpack(buildpack)"
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
          <v-row
            v-if="deploymentstrategy == 'docker' || (deploymentstrategy == 'git' && buildstrategy == 'external' )">
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
          <v-row
            v-if="deploymentstrategy == 'docker' || (deploymentstrategy == 'git' && buildstrategy == 'external' )">
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
        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- SECURITY -->
      <v-expansion-panel v-if="advanced" bg-color="rgb(var(--v-theme-cardBackground))">
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
                v-model="security.vulnerabilityScans"
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
      <v-expansion-panel v-if="advanced" bg-color="rgb(var(--v-theme-cardBackground))">
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
                :disabled="!ssl"
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
      <v-expansion-panel v-if="advanced" bg-color="rgb(var(--v-theme-cardBackground))">
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
                :disabled="!ingress.annotations['nginx.ingress.kubernetes.io/enable-cors']"
              ></v-text-field>
            </v-col>
            <v-col
              cols="12"
              md="4"
            >
              <v-text-field
                v-model="ingress.annotations['nginx.ingress.kubernetes.io/cors-allow-headers']"
                label="CORS Allow Headers"
                :disabled="!ingress.annotations['nginx.ingress.kubernetes.io/enable-cors']"
              ></v-text-field>
            </v-col>
            <v-col
              cols="12"
              md="4"
            >
              <v-text-field
                v-model="ingress.annotations['nginx.ingress.kubernetes.io/cors-expose-headers']"
                label="CORS Expose Headers"
                :disabled="!ingress.annotations['nginx.ingress.kubernetes.io/enable-cors']"
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
                :disabled="!ingress.annotations['nginx.ingress.kubernetes.io/enable-cors']"
              ></v-switch>
            </v-col>
            <v-col
              cols="12"
              md="4"
            >
              <v-text-field
                v-model="ingress.annotations['nginx.ingress.kubernetes.io/cors-max-age']"
                label="CORS Max Age"
                :disabled="!ingress.annotations['nginx.ingress.kubernetes.io/enable-cors']"
              ></v-text-field>
            </v-col>
            <v-col
              cols="12"
              md="4"
            >
              <v-text-field
                v-model="ingress.annotations['nginx.ingress.kubernetes.io/cors-allow-methods']"
                label="CORS Allow Methods"
                :disabled="!ingress.annotations['nginx.ingress.kubernetes.io/enable-cors']"
              ></v-text-field>
            </v-col>
          </v-row>



        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- ENVIRONMENT VARS -->
      <v-expansion-panel bg-color="rgb(var(--v-theme-cardBackground))">
        <v-expansion-panel-title class="text-uppercase text-caption-2 font-weight-medium" color="cardBackground">Environment Variables</v-expansion-panel-title>
        <v-expansion-panel-text color="cardBackground">
            <v-row v-for="(envvar, index) in envvars" :key="index">
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
                @change="updatePodsize"
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
    </v-expansion-panels>

      <!-- ADDONS -->
      <div class="text-uppercase text-caption-2 font-weight-medium pt-5">Addons</div>
      <Addons :addons="addons" :appname="appname"/>

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
      </v-row>
    </v-container>
  </v-form>
</template>


<script lang="ts">
import axios from "axios";
import Addons from "./addons.vue";
import { defineComponent } from 'vue'
//import { useKuberoStore } from '@/stores/kubero'
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
  tls?: { 
    hosts: string[], 
    secretName: string
  }[],
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

type EnvVar = {
  name: string,
  value: string,
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
      }
    },
    data () {
    return {
      breadcrumbItems: [
          {
              text: 'DASHBOARD',
              disabled: false,
              to: { name: 'Pipelines', params: {}}
          },
          {
              text: 'PIPELINE:'+this.pipeline,
              disabled: false,
              to: { name: 'Pipeline Apps', params: { pipeline: this.pipeline }}
          },
          {
              text: 'PHASE:'+this.phase,
              disabled: false,
              to: this.getAppBreadcrumbLink(),
          },
          {
              text: 'APP:'+this.app,
              disabled: false,
              to: this.getAppBreadcrumbLink(),
          }
      ],
      takenDomains: [] as string[],
      advanced: false,
      panel: [0],
      valid: false,
      buildpacks: [] as { text: string, value: Buildpack }[],
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
      deploymentstrategy: "git",
      buildstrategy: "plain",
      pipelineData: {
        domain: '',
        dockerimage: '',
        buildpack: {} as Buildpack,
        git: {
          provider: '',
          repository: {} as GitRepo,
        },
      },
      appname: '',
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
      },
      autodeploy: true,
      domain: '',
      ssl: false,
      envvars: [
        //{ name: '', value: '' },
      ] as EnvVar[],
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
        vulnerabilityScans: false,
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
      ingress: {
        annotations: {
          'nginx.ingress.kubernetes.io/whitelist-source-range': '',
          'nginx.ingress.kubernetes.io/denylist-source-range': '',
          'nginx.ingress.kubernetes.io/force-ssl-redirect': false,
          'nginx.ingress.kubernetes.io/proxy-buffer-size': '4k',
          'nginx.ingress.kubernetes.io/enable-cors': false,
          'nginx.ingress.kubernetes.io/cors-allow-origin': '*',
          'nginx.ingress.kubernetes.io/cors-allow-headers': 'DNT,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization',
          'nginx.ingress.kubernetes.io/cors-expose-headers': '*',
          'nginx.ingress.kubernetes.io/cors-allow-credentials': true,
          'nginx.ingress.kubernetes.io/cors-max-age': '1728000',
          'nginx.ingress.kubernetes.io/cors-allow-methods': 'GET, PUT, POST, DELETE, PATCH, OPTIONS',
        },
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
      nameRules: [
        (v: any) => !!v || 'Name is required',
        (v: any) => v.length <= 60 || 'Name must be less than 60 characters',
        (v: any) => /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(v) || 'Allowed characters : [a-zA-Z0-9_-]',
      ],
      repositoryRules: [
        //v => !!v || 'Repository is required',
        (v: any) => v.length <= 120 || 'Repository must be less than 120 characters',
        //    ((git|ssh|http(s)?)|(git@[\w\.]+))(:(//)?)([\w\.@\:/\-~]+)(\.git)(/)?
        (v: any) => /((git|ssh|http(s)?)|(git@[\w.]+))(:(\/\/)?)([\w.@:/\-~]+)(\.git)(\/)?/.test(v) || 'Format "owner/repository"',
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
      buildPipeline(){
        const store = useKuberoStore()
        return store.kubero.buildPipeline
      }
    },
    mounted() {
      this.loadPipeline();
      this.loadIngressClasses();
      this.loadStorageClasses();
      this.loadPodsizeList();
      this.loadBuildpacks();
      this.loadClusterIssuers();
      this.getDomains();
      if (this.app != 'new') {
        this.loadApp(); // this may lead into a race condition with the buildpacks loaded in loadPipeline
      }

      if (this.$route.query.template && this.$route.query.catalogId) {
        const catalogId = this.$route.query.catalogId as string;
        const template = this.$route.query.template as string;
        this.loadTemplate(catalogId, template);
      }

      //this.buildPipeline = this.$vuetify.buildPipeline
      //console.log("loadPipeline", this.$vuetify.buildPipeline);
    },
    components: {
        Addons,
        Breadcrumbs,
    },
    methods: {
      whiteListDomains(domainsList: string[]) {
        for (let i = 0; i < domainsList.length; i++) {
            if (domainsList[i] == this.domain) {
              domainsList.splice(i, 1);
            }
          }
        return domainsList;
      },
      getDomains() {
        axios.get('/api/domains').then(response => {
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
        axios.get('/api/config/clusterissuers').then(response => {
          this.letsecryptClusterIssuer = response.data.id;
        });
      },
      loadTemplate(catalogId: string, template: string) {
        axios.get('/api/templates/'+catalogId+'/'+template).then(response => {

          this.appname = response.data.name;
          this.containerPort = response.data.image.containerPort;
          this.deploymentstrategy = response.data.deploymentstrategy;

          this.docker.image = response.data.image.repository;
          this.docker.tag = response.data.image.tag;

          this.envvars = response.data.envVars;
          this.extraVolumes = response.data.extraVolumes;
          this.cronjobs = response.data.cronjobs;
          this.addons = response.data.addons;

          if (response.data.image.build) {
            //console.log("buildpack build", response.data.image.build);
            this.buildpack.build = response.data.image.build;
          } 

          if (response.data.image.run) {
            this.buildpack.run = response.data.image.run;
          }

          // Open Panel if there is some data to show
          if (this.envvars.length > 0) {
            this.panel.push(1)
          }
          if (this.extraVolumes.length > 0) {
            this.panel.push(3)
          }
          if (this.cronjobs.length > 0) {
            this.panel.push(4)
          }

          // Backward compatibility older v1.11.1
          if (this.buildpack && this.buildpack.run && this.buildpack.run.readOnlyAppStorage === undefined) {
            this.buildpack.run.readOnlyAppStorage = true;
          }
        });
      },
      changeName(name: string) {
        this.domain = name+"."+this.pipelineData.domain;
      },
      loadPipeline() {
        axios.get('/api/pipelines/'+this.pipeline).then(response => {
          this.pipelineData = response.data;

          if (this.pipelineData.dockerimage) {
            this.docker.image = this.pipelineData.dockerimage;
          }

          this.loadBranches();
          this.buildpack = this.pipelineData.buildpack;

          if (this.app == 'new') {
            this.domain = this.pipelineData.domain;

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

        });
      },
      loadIngressClasses() {
      axios.get("/api/config/ingressclasses").then((response) => {
        for (let i = 0; i < response.data.length; i++) {
          this.ingressClasses.push(response.data[i].name);
        }
      });
    },
      loadStorageClasses() {
        axios.get('/api/config/storageclasses').then(response => {
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

        axios.get('/api/repo/'+gitprovider+"/"+gitrepoB64+"/branches/list").then(response => {
          for (let i = 0; i < response.data.length; i++) {
            this.branchesList.push(response.data[i]);
          }
        });
      },


      loadPodsizeList() {
        axios.get('/api/config/podsize').then(response => {
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
        axios.get('/api/config/buildpacks').then(response => {
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
        axios.delete(`/api/pipelines/${this.pipeline}/${this.phase}/${this.app}`)
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
          axios.get(`/api/pipelines/${this.pipeline}/${this.phase}/${this.app}`).then(response => {
            this.resourceVersion = response.data.resourceVersion;

            if (response.data.spec.ingress.tls.length > 0) {
              this.ssl = true;
            } else {
              this.ssl = false;
            }

            // Open Panel if there is some data to show
            if (response.data.spec.envVars.length > 0) {
              this.panel.push(1)
            }
            if (response.data.spec.extraVolumes.length > 0) {
              this.panel.push(3)
            }
            if (response.data.spec.cronjobs.length > 0) {
              this.panel.push(4)
            }

            this.security = response.data.spec.image.run.securityContext || {};

            this.deploymentstrategy = response.data.spec.deploymentstrategy;
            this.buildstrategy = response.data.spec.buildstrategy || 'plain';
            this.appname = response.data.spec.name;
            this.buildpack = {
              run: response.data.spec.image.run,
              build: response.data.spec.image.build,
              fetch: response.data.spec.image.fetch,
            }
            this.gitrepo = response.data.spec.gitrepo;
            this.domain = response.data.spec.domain;
            this.branch = response.data.spec.branch;
            this.imageTag = response.data.spec.imageTag;
            this.docker.image = response.data.spec.image.repository || '';
            this.docker.tag = response.data.spec.image.tag || 'latest';
            this.autodeploy = response.data.spec.autodeploy;
            this.envvars = response.data.spec.envVars;
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
            this.security.vulnerabilityScans = response.data.spec.vulnerabilityscan.enabled;
            this.ingress = response.data.spec.ingress || {};

            // Backward compatibility older v1.11.1
            if (this.buildpack && this.buildpack.run && this.buildpack.run.readOnlyAppStorage === undefined) {
              this.buildpack.run.readOnlyAppStorage = true;
            }

            // remove loaded domain from taken domains
            this.takenDomains = this.whiteListDomains(this.takenDomains);
          });
        }
      },
      cleanupIngressAnnotations(){

        if (this.ssl === false) {
          delete this.ingress.annotations['cert-manager.io/cluster-issuer'];
          delete this.ingress.annotations['kubernetes.io/tls-acme'];
          this.ingress.tls = [];
        } else {
          this.ingress.annotations['cert-manager.io/cluster-issuer'] = this.letsecryptClusterIssuer;
          this.ingress.annotations['kubernetes.io/tls-acme'] = 'true';
          this.ingress.tls = [
            {
              hosts: [this.domain],
              secretName: this.appname+'-tls',
            },
          ];
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

        if (this.ingress.annotations['nginx.ingress.kubernetes.io/enable-cors'] == false) {
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

        let postdata = {
          resourceVersion: this.resourceVersion,
          buildpack: this.buildpack,
          appname: this.appname,
          gitrepo: this.gitrepo,
          branch: this.branch,
          deploymentstrategy: this.deploymentstrategy,
          buildstrategy: this.buildstrategy,
          image : {
            containerport: this.containerPort,
            repository: this.docker.image,
            tag: this.docker.tag,
            fetch: this.buildpack?.fetch,
            build: this.buildpack?.build,
            run: this.buildpack?.run,
          },
          autodeploy: this.autodeploy,
          domain: this.domain,
          ssl: this.ssl,
          envvars: this.envvars,
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
        }

        if (typeof postdata.image.run.securityContext.runAsUser === 'string') {
          postdata.image.run.securityContext.runAsUser = parseInt(postdata.image.run.securityContext.runAsUser);
        }
        if (typeof postdata.image.run.securityContext.runAsGroup === 'string') {
          postdata.image.run.securityContext.runAsGroup = parseInt(postdata.image.run.securityContext.runAsGroup);
        }

        axios.put(`/api/pipelines/${this.pipeline}/${this.phase}/${this.app}`, postdata
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

        let postdata = {
          pipeline: this.pipeline,
          buildpack: this.buildpack,
          phase: this.phase,
          appname: this.appname.toLowerCase(),
          gitrepo: this.gitrepo,
          branch: this.branch,
          deploymentstrategy: this.deploymentstrategy,
          buildstrategy: this.buildstrategy,
          image : {
            containerport: this.containerPort,
            repository: this.docker.image,
            tag: this.docker.tag,
            fetch: this.buildpack?.fetch,
            build: this.buildpack?.build,
            run: this.buildpack?.run,
          },
          autodeploy: this.autodeploy,
          domain: this.domain.toLowerCase(),
          ssl: this.ssl,
          envvars: this.envvars,
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
        axios.post(`/api/apps`, postdata)
        // eslint-disable-next-line no-unused-vars
        .then(response => {
          this.appname = '';
          //console.log(response);
          this.$router.push({path: '/pipeline/' + this.pipeline + '/apps'});
        })
        .catch(error => {
          console.log(error);
        });
      },
      addEnvLine() {
        this.envvars.push({
          name: '',
          value: '',
        });
      },
      removeEnvLine(index: string) {
        for (let i = 0; i < this.envvars.length; i++) {
          if (this.envvars[i].name === index) {
            this.envvars.splice(i, 1);
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
