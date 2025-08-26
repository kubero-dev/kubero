<template>
  <v-form v-model="valid">
    <v-overlay v-model="loading" class="align-center justify-center">
      <v-progress-circular
        color="primary"
        indeterminate
        size="64"
      ></v-progress-circular>
    </v-overlay>
    <v-container>
      <Breadcrumbs :items="breadcrumbItems"></Breadcrumbs>
      <v-row>
        <v-col cols="12" md="1" class="hidden-xs-and-down">
          <v-img
            :src="
              deploymentstrategy == 'git'
                ? '/img/icons/hexagon1.svg'
                : '/img/icons/hexagon1-empty-bold-tp.svg'
            "
            max-width="50"
            max-height="50"
            class="mr-2"
          ></v-img>
        </v-col>
        <v-col cols="12" sm="11" md="11" lg="11" xl="11">
          <h1 v-if="app == 'new'">
            {{ $t("app.form.createNewApp", { pipeline: pipeline }) }}
          </h1>
          <h1 v-if="app != 'new'">
            {{ $t("app.form.editApp", { app: app, pipeline: pipeline }) }}
          </h1>
          <p class="text-justify">
            {{ phase }}
          </p>
        </v-col>
      </v-row>

      <v-row v-if="app === 'new' && $route.query.template != undefined">
        <v-col cols="12" md="8">
          <v-alert outlined type="warning" prominent border="start">
            {{ $t("app.form.warning") }}
          </v-alert>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="name"
            :rules="nameRules"
            :counter="60"
            :disabled="app != 'new'"
            :label="$t('app.form.appName')"
            v-on:input="changeName(name)"
            required
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="2">
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

      <v-row
        v-for="(host, index) in ingress.hosts"
        :key="index"
        :style="index > 0 ? 'margin-top: -20px;' : ''"
      >
        <v-col cols="9" md="6">
          <v-text-field
            v-model="host.host"
            :rules="domainRules"
            :counter="60"
            :label="$t('app.form.domain')"
            required
          ></v-text-field>
        </v-col>
        <v-col cols="2" md="2" pullright>
          <v-switch
            v-model="sslIndex[index]"
            label="SSL"
            density="compact"
            color="primary"
          ></v-switch>
        </v-col>
        <v-col cols="1" md="1">
          <v-btn
            v-if="index > 0"
            elevation="2"
            icon
            size="small"
            @click="removeDomainLine(index)"
          >
            <v-icon dark> mdi-minus </v-icon>
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col
          cols="12"
          style="margin-top: -20px; padding-top: -0px; padding-bottom: 40px"
        >
          <v-btn elevation="2" icon size="small" @click="addDomainLine()">
            <v-icon dark> mdi-plus </v-icon>
          </v-btn>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="containerPort"
            :label="$t('app.form.containerPort')"
          ></v-text-field>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="7">
          <v-switch
            v-model="advanced"
            :label="$t('app.form.advancedAppConfig')"
            color="primary"
            inset
          ></v-switch>
        </v-col>
      </v-row>

      <v-expansion-panels v-model="panel" multiple>
        <!-- DEPLOYMENT -->
        <v-expansion-panel bg-color="rgb(var(--v-theme-cardBackground))">
          <v-expansion-panel-title
            class="text-uppercase text-caption-2 font-weight-medium"
            color="cardBackground"
            >{{ $t("app.titles.deployment") }}</v-expansion-panel-title
          >
          <v-expansion-panel-text>
            <v-row>
              <v-col cols="12" md="7">
                <v-radio-group
                  v-model="deploymentstrategy"
                  row
                  :label="$t('app.strategy.name')"
                >
                  <v-radio
                    :label="$t('app.strategy.containerImage')"
                    value="docker"
                  ></v-radio>
                  <v-radio
                    :label="$t('app.strategy.fromSource')"
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
                <v-col cols="12" md="4">
                  <v-radio-group v-model="buildstrategy">
                    <v-radio
                      key="0"
                      :label="$t('app.strategy.runpacks')"
                      value="plain"
                    ></v-radio>
                    <v-radio
                      key="2"
                      :label="$t('app.strategy.externalCICD')"
                      value="external"
                    ></v-radio>
                    <v-radio
                      key="1"
                      :label="$t('app.strategy.nixpacks')"
                      value="nixpacks"
                      :disabled="!kuberoConfig.buildPipeline"
                    ></v-radio>
                    <v-radio
                      key="1"
                      :label="$t('app.strategy.buildpacks')"
                      value="buildpacks"
                      :disabled="!kuberoConfig.buildPipeline"
                    ></v-radio>
                    <v-radio
                      key="2"
                      :label="$t('app.strategy.dockerfile')"
                      value="dockerfile"
                      :disabled="!kuberoConfig.buildPipeline"
                    ></v-radio>
                  </v-radio-group>
                </v-col>
                <v-col cols="12" md="8">
                  <v-alert
                    variant="tonal"
                    color="#8560a9"
                    border="start"
                    v-if="buildstrategy == 'plain'"
                  >
                    <h3>
                      {{ $t("app.strategy.runpacks") }}
                    </h3>
                    <div>{{ $t("app.strategy.runpackExplanation") }}</div>
                  </v-alert>

                  <v-alert
                    variant="tonal"
                    color="#8560a9"
                    border="start"
                    v-if="buildstrategy == 'nixpacks'"
                  >
                    <h3>
                      {{ $t("app.strategy.nixpacks") }}
                    </h3>
                    <div v-html="$t('app.strategy.nixpacksExplanation')"></div>
                  </v-alert>

                  <v-alert
                    variant="tonal"
                    color="#8560a9"
                    border="start"
                    v-if="buildstrategy == 'buildpacks'"
                  >
                    <h3>
                      {{ $t("app.strategy.buildpacks") }}
                    </h3>
                    <div
                      v-html="$t('app.strategy.buildpacksExplanation')"
                    ></div>
                  </v-alert>

                  <v-alert
                    variant="tonal"
                    color="#8560a9"
                    border="start"
                    v-if="buildstrategy == 'dockerfile'"
                  >
                    <h3>
                      {{ $t("app.strategy.dockerfile") }}
                    </h3>
                    <div>{{ $t("app.strategy.dockerfileExplanation") }}</div>
                  </v-alert>

                  <v-alert
                    variant="tonal"
                    color="#8560a9"
                    border="start"
                    v-if="buildstrategy == 'external'"
                  >
                    <h3>
                      {{ $t("app.strategy.externalCICD") }}
                    </h3>
                    <div>{{ $t("app.strategy.externalCICDExplanation") }}</div>
                  </v-alert>

                  <v-alert
                    variant="tonal"
                    type="info"
                    border="start"
                    v-if="!kuberoConfig.buildPipeline"
                    style="margin-top: 20px"
                  >
                    <h3>
                      {{ $t("app.strategy.noBuildPipeline") }}
                    </h3>
                    <div>
                      {{ $t("app.strategy.noBuildPipelineExplanation") }}
                    </div>
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
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="gitrepo.ssh_url"
                      :rules="repositoryRules"
                      :label="$t('app.form.repository')"
                      required
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-combobox
                      v-model="branch"
                      :items="branchesList"
                      :label="$t('app.form.branch')"
                      required
                    ></v-combobox>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-switch
                      v-model="autodeploy"
                      :label="$t('app.form.autodeploy')"
                      color="primary"
                    ></v-switch>
                  </v-col>
                </v-row>

                <v-row v-if="buildpack == undefined">
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="buildpack"
                      :items="buildpacks"
                      :label="$t('app.form.runpack')"
                      @update:modelValue="updateBuildpack(buildpack)"
                    ></v-select>
                  </v-col>
                </v-row>

                <v-row
                  v-if="buildpack != undefined && advanced === true"
                  class="secondary"
                >
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="buildpack.build.command"
                      :label="$t('app.form.buildCommand')"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row
                  v-if="buildpack != undefined && advanced === true"
                  class="secondary"
                >
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="buildpack.run.command"
                      :label="$t('app.form.runCommand')"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </div>
              <!-- end of buildstrategy != external -->
            </div>
            <!-- end of deploymentstrategy == git -->

            <!-- DEPLOYMENT STRATEGY CONTAINER -->
            <div v-if="deploymentstrategy == 'docker'">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="docker.image"
                    :counter="60"
                    :label="$t('app.form.containerImage')"
                    required
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="docker.tag"
                    :counter="60"
                    :label="$t('app.form.tag')"
                    required
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row v-if="advanced">
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="docker.command"
                    :counter="60"
                    :label="$t('app.form.command')"
                    required
                    bg-color="secondary"
                  ></v-text-field>
                </v-col>
              </v-row>
            </div>
            <!-- end of deploymentstrategy == docker -->
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- BASIC AUTH -->
        <v-expansion-panel
          bg-color="rgb(var(--v-theme-on-surface-variant))"
          :style="advanced ? 'display: block;' : 'display: none;'"
        >
          <v-expansion-panel-title
            class="text-uppercase text-caption-2 font-weight-medium"
            color="secondary"
            >{{ $t("app.titles.basicAuth") }}</v-expansion-panel-title
          >
          <v-expansion-panel-text color="secondary">
            <v-row>
              <v-col cols="12" md="3">
                <v-switch
                  v-model="basicAuth.enabled"
                  :label="$t('app.form.basicAuthEnabled')"
                  color="primary"
                ></v-switch>
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="basicAuth.realm"
                  :label="$t('app.form.basicAuthRealm')"
                  :counter="60"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row v-for="(account, index) in basicAuth.accounts" :key="index">
              <v-col cols="12" md="5">
                <v-text-field
                  v-model="account.user"
                  :label="$t('app.form.basicAuthUser')"
                  :counter="60"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="account.pass"
                  :label="$t('app.form.basicAuthPass')"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="1">
                <v-btn
                  elevation="2"
                  icon
                  small
                  @click="removeAuthLine(account.user)"
                >
                  <v-icon dark> mdi-minus </v-icon>
                </v-btn>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-btn elevation="2" icon small @click="addAuthLine()">
                  <v-icon dark> mdi-plus </v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- SECURITY -->
        <v-expansion-panel
          bg-color="rgb(var(--v-theme-on-surface-variant))"
          :style="advanced ? 'display: block;' : 'display: none;'"
        >
          <v-expansion-panel-title
            class="text-uppercase text-caption-2 font-weight-medium"
            color="secondary"
            >{{ $t("app.titles.security") }}</v-expansion-panel-title
          >
          <v-expansion-panel-text color="secondary">
            <v-row v-if="deploymentstrategy == 'git'">
              <v-col cols="12" md="6">
                <v-switch
                  v-model="buildpack.run.readOnlyAppStorage"
                  :label="$t('app.form.readOnlyAppStorage')"
                  color="primary"
                ></v-switch>
              </v-col>
              <v-col cols="12" md="6"> </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-switch
                  v-model="buildpack.run.securityContext.readOnlyRootFilesystem"
                  :label="$t('app.form.readOnlyRootFilesystem')"
                  color="primary"
                ></v-switch>
              </v-col>
              <v-col cols="12" md="6">
                <v-switch
                  v-model="vulnerabilityscan.enabled"
                  :label="$t('app.form.vulnerabililityScan')"
                  color="primary"
                ></v-switch>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-switch
                  v-model="
                    buildpack.run.securityContext.allowPrivilegeEscalation
                  "
                  :label="$t('app.form.privilegeEscalation')"
                  color="primary"
                ></v-switch>
              </v-col>
              <v-col cols="12" md="6">
                <v-switch
                  v-model="buildpack.run.securityContext.runAsNonRoot"
                  :label="$t('app.form.runAsNonRoot')"
                  color="primary"
                ></v-switch>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="buildpack.run.securityContext.runAsUser"
                  :rules="uidRules"
                  :label="$t('app.form.runAsUser')"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="buildpack.run.securityContext.runAsGroup"
                  :rules="uidRules"
                  :label="$t('app.form.runAsGroup')"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="buildpack.run.securityContext.capabilities.add"
                  :items="capabilities"
                  :menu-props="{ maxHeight: '400' }"
                  :label="$t('app.form.capabilitiesAdd')"
                  multiple
                  hint="Select one or more"
                  persistent-hint
                  chips
                  class="capability"
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="buildpack.run.securityContext.capabilities.drop"
                  :items="capabilities"
                  :menu-props="{ maxHeight: '400' }"
                  :label="$t('app.form.capabilitiesDrop')"
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
        <v-expansion-panel
          bg-color="rgb(var(--v-theme-on-surface-variant))"
          :style="advanced ? 'display: block;' : 'display: none;'"
        >
          <v-expansion-panel-title
            class="text-uppercase text-caption-2 font-weight-medium"
            color="secondary"
            >{{ $t("app.titles.networking") }}</v-expansion-panel-title
          >
          <v-expansion-panel-text color="secondary">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="
                    ingress.annotations[
                      'nginx.ingress.kubernetes.io/whitelist-source-range'
                    ]
                  "
                  :label="$t('app.form.whitelistSourceRange')"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="
                    ingress.annotations[
                      'nginx.ingress.kubernetes.io/denylist-source-range'
                    ]
                  "
                  :label="$t('app.form.denylistSourceRange')"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-switch
                  v-model="
                    ingress.annotations[
                      'nginx.ingress.kubernetes.io/force-ssl-redirect'
                    ]
                  "
                  :label="$t('app.form.forceSSLRedirect')"
                  color="primary"
                  :disabled="ingress.tls && ingress.tls.length > 0"
                ></v-switch>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="
                    ingress.annotations[
                      'nginx.ingress.kubernetes.io/proxy-buffer-size'
                    ]
                  "
                  :label="$t('app.form.proxyBufferSize')"
                ></v-text-field>
              </v-col>
            </v-row>

            <!-- allow setting of ingressClass -->
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="ingress.className"
                  :items="ingressClasses"
                  :label="$t('app.form.ingressClassName')"
                ></v-select>
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- CORS -->
        <v-expansion-panel
          bg-color="rgb(var(--v-theme-on-surface-variant))"
          :style="advanced ? 'display: block;' : 'display: none;'"
        >
          <v-expansion-panel-title
            class="text-uppercase text-caption-2 font-weight-medium"
            color="secondary"
            >Cors</v-expansion-panel-title
          >
          <v-expansion-panel-text color="secondary">
            <v-row>
              <v-col cols="12" md="12">
                <v-switch
                  v-model="
                    ingress.annotations[
                      'nginx.ingress.kubernetes.io/enable-cors'
                    ]
                  "
                  :label="$t('app.form.corsEnable')"
                  color="primary"
                  false-value="false"
                  true-value="true"
                  inset
                ></v-switch>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="
                    ingress.annotations[
                      'nginx.ingress.kubernetes.io/cors-allow-origin'
                    ]
                  "
                  :label="$t('app.form.corsAllowOrigin')"
                  :disabled="
                    ingress.annotations[
                      'nginx.ingress.kubernetes.io/enable-cors'
                    ] == 'false'
                  "
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="
                    ingress.annotations[
                      'nginx.ingress.kubernetes.io/cors-allow-headers'
                    ]
                  "
                  :label="$t('app.form.corsAllowHeaders')"
                  :disabled="
                    ingress.annotations[
                      'nginx.ingress.kubernetes.io/enable-cors'
                    ] == 'false'
                  "
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="
                    ingress.annotations[
                      'nginx.ingress.kubernetes.io/cors-expose-headers'
                    ]
                  "
                  :label="$t('app.form.corsExposeHeaders')"
                  :disabled="
                    ingress.annotations[
                      'nginx.ingress.kubernetes.io/enable-cors'
                    ] == 'false'
                  "
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="4">
                <v-switch
                  v-model="
                    ingress.annotations[
                      'nginx.ingress.kubernetes.io/cors-allow-credentials'
                    ]
                  "
                  :label="$t('app.form.corsAllowCredentials')"
                  color="primary"
                  false-value="false"
                  true-value="true"
                  :disabled="
                    ingress.annotations[
                      'nginx.ingress.kubernetes.io/enable-cors'
                    ] == 'false'
                  "
                ></v-switch>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="
                    ingress.annotations[
                      'nginx.ingress.kubernetes.io/cors-max-age'
                    ]
                  "
                  :label="$t('app.form.corsMaxAge')"
                  :disabled="
                    ingress.annotations[
                      'nginx.ingress.kubernetes.io/enable-cors'
                    ] == 'false'
                  "
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="
                    ingress.annotations[
                      'nginx.ingress.kubernetes.io/cors-allow-methods'
                    ]
                  "
                  :label="$t('app.form.corsAllowMethods')"
                  :disabled="
                    ingress.annotations[
                      'nginx.ingress.kubernetes.io/enable-cors'
                    ] == 'false'
                  "
                ></v-text-field>
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- KUBERNETES -->
        <v-expansion-panel
          bg-color="rgb(var(--v-theme-on-surface-variant))"
          :style="advanced ? 'display: block;' : 'display: none;'"
        >
          <v-expansion-panel-title
            class="text-uppercase text-caption-2 font-weight-medium"
            color="secondary"
            >{{ $t("app.titles.kubernetes") }}</v-expansion-panel-title
          >
          <v-expansion-panel-text color="secondary">
            <h4 class="mb-5">
              {{ $t("app.titles.serviceAccountAnnotations") }}
            </h4>
            <v-row v-for="(annotation, index) in sAAnnotations" :key="index">
              <v-col cols="12" md="5">
                <v-text-field
                  v-model="annotation.annotation"
                  :label="$t('global.annotation')"
                  :counter="120"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="annotation.value"
                  :label="$t('global.value')"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="1">
                <v-btn
                  elevation="2"
                  icon
                  small
                  @click="removeSAAnnotationLine(annotation.annotation)"
                >
                  <v-icon dark> mdi-minus </v-icon>
                </v-btn>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-btn elevation="2" icon small @click="addSAAnnotationLine()">
                  <v-icon dark> mdi-plus </v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- ENVIRONMENT VARS -->
        <v-expansion-panel bg-color="rgb(var(--v-theme-cardBackground))">
          <v-expansion-panel-title
            class="text-uppercase text-caption-2 font-weight-medium"
            color="cardBackground"
            >{{
              $t("app.titles.environmentVariables")
            }}</v-expansion-panel-title
          >
          <v-expansion-panel-text color="cardBackground">
            <v-row v-for="(envvar, index) in envVars" :key="index">
              <v-col cols="12" md="5">
                <v-text-field
                  v-model="envvar.name"
                  :label="$t('global.name')"
                  :counter="60"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="envvar.value"
                  :label="$t('global.value')"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="1">
                <v-btn
                  elevation="2"
                  icon
                  small
                  @click="removeEnvLine(envvar.name)"
                >
                  <v-icon dark> mdi-minus </v-icon>
                </v-btn>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-btn elevation="2" icon small @click="addEnvLine()">
                  <v-icon dark> mdi-plus </v-icon>
                </v-btn>
              </v-col>
            </v-row>

            <v-row>
              <v-file-input
                prepend-icon="mdi-file"
                label="Drop or select .env file"
                show-size
                v-model="envFile"
                @change="handleFileInput"
              ></v-file-input>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- RESOURCES -->
        <v-expansion-panel bg-color="rgb(var(--v-theme-cardBackground))">
          <v-expansion-panel-title
            class="text-uppercase text-caption-2 font-weight-medium"
            color="cardBackground"
            >{{ $t("app.titles.resources") }}</v-expansion-panel-title
          >
          <v-expansion-panel-text color="cardBackground">
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="podsize"
                  :items="podsizes"
                  :label="$t('app.podSize')"
                  item-title="text"
                  item-value="value"
                  @update:modelValue="updatePodsize"
                ></v-select>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-switch
                  v-model="autoscale"
                  :label="$t('app.autoscale')"
                  hint="Scale pod replicas based on CPU and Memory usage"
                  color="primary"
                ></v-switch>
              </v-col>
            </v-row>

            <v-row v-if="!autoscale">
              <v-col cols="12" md="6">
                <v-slider
                  v-model="webreplicas"
                  :label="$t('app.webReplicas')"
                  max="10"
                  min="0"
                  step="1"
                  thumb-label="always"
                ></v-slider>
              </v-col>
            </v-row>
            <v-row v-if="!autoscale">
              <v-col cols="12" md="6">
                <v-slider
                  v-model="workerreplicas"
                  :label="$t('app.workerReplicas')"
                  max="10"
                  min="0"
                  step="1"
                  thumb-label="always"
                ></v-slider>
              </v-col>
            </v-row>

            <v-row v-if="autoscale">
              <v-col cols="12" md="6">
                <v-range-slider
                  v-model="webreplicasrange"
                  :label="$t('app.webReplicas')"
                  max="10"
                  min="0"
                  step="1"
                  hint="pods"
                  thumb-label="always"
                ></v-range-slider>
              </v-col>
            </v-row>

            <v-row v-if="autoscale">
              <v-col cols="12" md="6">
                <v-range-slider
                  v-model="workerreplicasrange"
                  :label="$t('app.workerReplicas')"
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
          <v-expansion-panel-title
            class="text-uppercase text-caption-2 font-weight-medium"
            color="cardBackground"
            >Volumes</v-expansion-panel-title
          >
          <v-expansion-panel-text color="cardBackground">
            <div v-for="(volume, index) in extraVolumes" :key="index">
              <v-row>
                <v-col cols="12" md="3">
                  <v-text-field
                    v-model="volume.name"
                    :label="$t('global.name')"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="2">
                  <v-text-field
                    v-model="volume.size"
                    :label="$t('global.size')"
                    placeholder="1G"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="1">
                  <v-btn
                    elevation="2"
                    icon
                    small
                    @click="removeVolumeLine(volume.name)"
                  >
                    <v-icon dark> mdi-minus </v-icon>
                  </v-btn>
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12" md="2">
                  <v-select
                    v-model="volume.storageClass"
                    :items="storageclasses"
                    :label="$t('app.form.storageClass')"
                  ></v-select>
                </v-col>
                <v-col cols="12" md="3">
                  <v-text-field
                    v-model="volume.mountPath"
                    :label="$t('app.form.mountPath')"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="volume.accessModes[0]"
                    :items="['ReadWriteOnce', 'ReadWriteMany', 'ReadOnlyMany']"
                    :label="$t('app.form.accessMode')"
                  ></v-select>
                </v-col>
              </v-row>
            </div>

            <v-row>
              <v-col cols="12">
                <v-btn elevation="2" icon small @click="addVolumeLine()">
                  <v-icon dark> mdi-plus </v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- CRONJOBS -->
        <v-expansion-panel bg-color="rgb(var(--v-theme-cardBackground))">
          <v-expansion-panel-title
            class="text-uppercase text-caption-2 font-weight-medium"
            color="cardBackground"
            >{{ $t("app.titles.cronjobs") }}</v-expansion-panel-title
          >
          <v-expansion-panel-text color="cardBackground">
            <div v-for="(cronjob, index) in cronjobs" :key="index">
              <v-row>
                <v-col cols="12" md="3">
                  <v-text-field
                    v-model="cronjob.name"
                    :label="$t('global.name')"
                    :readonly="app != 'new'"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="2">
                  <v-text-field
                    v-model="cronjob.schedule"
                    :label="$t('app.cronjobs.schedule')"
                    placeholder="* * * * *"
                    :rules="cronjobScheduleRules"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="1">
                  <v-btn
                    elevation="2"
                    icon
                    small
                    @click="removeCronjobLine(cronjob.name)"
                  >
                    <v-icon dark> mdi-minus </v-icon>
                  </v-btn>
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12" md="3">
                  <v-text-field
                    v-model="cronjob.image"
                    :label="$t('app.cronjobs.image')"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="3">
                  <v-text-field
                    v-model="cronjob.command"
                    :label="$t('app.cronjobs.command')"
                  ></v-text-field>
                </v-col>
              </v-row>
            </div>

            <v-row>
              <v-col cols="12">
                <v-btn elevation="2" icon small @click="addCronjobLine()">
                  <v-icon dark> mdi-plus </v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- HEALTHCHECK -->
        <v-expansion-panel
          bg-color="rgb(var(--v-theme-on-surface-variant))"
          :style="advanced ? 'display: block;' : 'display: none;'"
        >
          <v-expansion-panel-title
            class="text-uppercase text-caption-2 font-weight-medium"
            color="secondary"
            >{{ $t("app.titles.healthChecks") }}</v-expansion-panel-title
          >
          <v-expansion-panel-text color="secondary">
            <v-row>
              <v-col cols="12" md="3">
                <v-switch
                  v-model="healthcheck.enabled"
                  :label="$t('app.form.healthCheckEnabled')"
                  color="primary"
                ></v-switch>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="healthcheck.path"
                  :label="$t('app.form.healthCheckPath')"
                  :counter="60"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="healthcheck.startupSeconds"
                  :label="$t('app.form.healthCheckStartupSeconds')"
                  :counter="60"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="healthcheck.timeoutSeconds"
                  :label="$t('app.form.healthcheckTimeoutSeconds')"
                  :counter="60"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="healthcheck.periodSeconds"
                  :label="$t('app.form.healthCheckIntervalSeconds')"
                  :counter="60"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <!-- ADDONS -->
      <div class="text-uppercase text-caption-2 font-weight-medium pt-5">
        {{ $t("app.titles.addOns") }}
      </div>
      <Addons :addons="addons" :appname="name" />

      <!-- ENV VAR OVERLAP DIALOG -->
      <v-dialog v-model="envOverlapDialog" max-width="800px" persistent>
        <v-card>
          <v-card-title class="headline">
            {{ $t("app.form.envVarConflicts") }}
          </v-card-title>
          <v-card-text>
            <p class="mb-4">
              {{ $t("app.form.envVarConflictsDescription") }}
            </p>
            <v-data-table
              v-model="selectedOverlaps"
              :headers="overlapHeaders"
              :items="envOverlaps"
              item-value="name"
              show-select
            >
              <template v-slot:item.oldValue="{ item }">
                <code class="text-caption">{{ item.oldValue }}</code>
              </template>
              <template v-slot:item.newValue="{ item }">
                <code class="text-caption">{{ item.newValue }}</code>
              </template>
            </v-data-table>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="text" @click="cancelOverlapDialog">
              {{ $t("global.cancel") }}
            </v-btn>
            <v-btn color="primary" @click="applyOverlapChanges">
              {{ $t("global.applyChanges") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- SUBMIT -->
      <v-row class="pt-5">
        <v-col cols="12" md="4">
          <v-btn
            color="primary"
            v-if="app == 'new'"
            elevation="2"
            @click="createApp()"
            :disabled="!valid"
            >{{ $t("global.create") }}</v-btn
          >
          <v-btn
            color="primary"
            v-if="app != 'new'"
            elevation="2"
            @click="updateApp()"
            :disabled="!valid"
            >{{ $t("global.update") }}</v-btn
          >
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script lang="ts">
import axios from "axios";
import Addons from "./addons.vue";
import { defineComponent } from "vue";
import { useKuberoStore } from "../../stores/kubero";
import Breadcrumbs from "../breadcrumbs.vue";
import Swal from "sweetalert2";

type App = {
  name: string;
  git: {
    repository: GitRepo;
  };
  phases: {
    name: string;
    enabled: boolean;
  }[];
};

type AppList = {
  items: App[];
};

type Cronjob = {
  name: string;
  schedule: string;
  image: string;
  command: any;
  restartPolicy: string;
};

type Podsize = {
  text: string;
  value: string;
};

type Volume = {
  name: string;
  emptyDir: boolean;
  storageClass: string;
  size: string;
  accessMode: string;
  accessModes: string[];
  mountPath: string;
};

type Addon = {
  id: string;
  kind: string;
  version: string;
  env: string[];
  icon: string;
  displayName: string;
  resourceDefinitions: any;
  formfields: FormField[];
};

type FormField = {
  name: string;
  label: string;
  type: string;
  default: string | number | boolean;
  required: boolean;
  options: string[];
};

type Ingress = {
  annotations: any;
  className: string;
  hosts: {
    host: string;
    paths: {
      path: "/";
      pathType: "ImplementationSpecific" | "Prefix" | "Exact";
    }[];
  }[];
  tls: {
    hosts: string[];
    secretName: string;
  }[];
};

type ServiceAccount = {
  annotations: any;
};

type Buildpack = {
  name?: string;
  run: BuildpackStepConfig;
  build: {
    command: string;
  };
  fetch: BuildpackStepConfig;
};

type BuildpackStepConfig = {
  readOnlyAppStorage: boolean;
  command: string;
  securityContext: {
    readOnlyRootFilesystem: boolean;
    allowPrivilegeEscalation: boolean;
    runAsNonRoot: boolean;
    runAsUser: number;
    runAsGroup: number;
    capabilities: {
      add: string[];
      drop: string[];
    };
  };
};

type GitRepo = {
  admin: boolean;
  clone_url: string;
  default_branch: string;
  description: string;
  homepage: string;
  id: number;
  language: string;
  name: string;
  node_id: string;
  owner: string;
  private: boolean;
  push: boolean;
  ssh_url: string;
  visibility: string;
};

export type EnvVar = {
  name: string;
  value: string;
};

type SAAnnotations = {
  annotation: string;
  value: string;
};

type Phase = {
  name: string;
  enabled: boolean;
  context: string;
  domain: string;
  defaultTTL?: number;
  defaultEnvvars: EnvVar[];
};

export default defineComponent({
  props: {
    pipeline: {
      type: String,
      default: "MISSING",
    },
    phase: {
      type: String,
      default: "MISSING",
    },
    app: {
      type: String,
      default: "new",
    },
  },
  data() {
    return {
      loading: false,
      breadcrumbItems: [
        {
          title: "dashboard.pipelines",
          disabled: false,
          to: { name: "Pipelines", params: {} },
        },
        {
          title: "Pipeline." + this.pipeline,
          text: this.pipeline,
          disabled: false,
          to: { name: "Pipeline Apps", params: { pipeline: this.pipeline } },
        },
        {
          title: "Phase." + this.phase,
          disabled: false,
          to: this.getAppBreadcrumbLink(),
        },
        {
          title: "App." + this.app,
          disabled: false,
          to: this.getAppBreadcrumbLink(),
        },
      ],
      takenDomains: [] as string[],
      advanced: localStorage.getItem("kubero-advanced-app-config") === "true",
      panel: [0],
      valid: false,
      sleep: "disabled",
      sleepEnabled: false,
      envFile: null as File | null,
      buildpacks: [] as { text: string; value: Buildpack }[],
      basicAuth: {
        enabled: false,
        realm: "Authentication required",
        accounts: [] as { user: string; pass: string }[],
      },
      buildpack: {
        run: {
          readOnlyAppStorage: true,
          command: "",
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
          command: "",
        },
        fetch: {
          readOnlyAppStorage: true,
          command: "",
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
          command: "",
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
          command: "",
        },
        fetch: {
          readOnlyAppStorage: true,
          command: "",
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
      imageTag: "",
      deploymentstrategy: "docker",
      buildstrategy: "plain",
      pipelineData: {
        domain: "",
        dockerimage: "",
        buildpack: {} as Buildpack,
        git: {
          provider: "",
          repository: {} as GitRepo,
        },
        buildstrategy: "plain",
        deploymentstrategy: "docker",
        phases: [] as Phase[],
      },
      name: "",
      resourceVersion: "",
      /*
      phases: [
        { text: 'Production', value: 'production' },
        { text: 'Staging', value: 'stage' },
        { text: 'Testing', value: 'test' },
      ],
      */
      gitrepo: {
        admin: false,
        clone_url: "",
        default_branch: "main",
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
      branch: "main",
      branchesList: [] as string[],
      docker: {
        image: "ghcr.io/kubero-dev/idler",
        tag: "latest",
        command: "",
      },
      autodeploy: true,
      sslIndex: [] as (boolean | undefined)[],
      envVars: [
        //{ name: '', value: '' },
      ] as EnvVar[],
      sAAnnotations: [
        //{ annotation: '', value: '' },
      ] as SAAnnotations[],
      containerPort: 8080,
      podsize: "",
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
      webreplicasrange: [1, 3],
      workerreplicasrange: [0, 0],
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
      storageclasses: [
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
      letsecryptClusterIssuer: "letsencrypt-prod",
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
        },
      },
      serviceAccount: {
        annotations: {} as any,
      } as ServiceAccount,
      ingress: {
        annotations: {
          "nginx.ingress.kubernetes.io/whitelist-source-range": "",
          "nginx.ingress.kubernetes.io/denylist-source-range": "",
          "nginx.ingress.kubernetes.io/force-ssl-redirect": "false",
          "nginx.ingress.kubernetes.io/proxy-buffer-size": "4k",
          "nginx.ingress.kubernetes.io/enable-cors": "false",
          "nginx.ingress.kubernetes.io/cors-allow-origin": "*",
          "nginx.ingress.kubernetes.io/cors-allow-headers":
            "DNT,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization",
          "nginx.ingress.kubernetes.io/cors-expose-headers": "*",
          "nginx.ingress.kubernetes.io/cors-allow-credentials": "true",
          "nginx.ingress.kubernetes.io/cors-max-age": "1728000",
          "nginx.ingress.kubernetes.io/cors-allow-methods":
            "GET, PUT, POST, DELETE, PATCH, OPTIONS",
        },
        hosts: [
          {
            host: "",
            paths: [{ path: "/", pathType: "ImplementationSpecific" }],
          },
        ],
        tls: [] as { hosts: string[]; secretName: string }[],
      } as Ingress,
      capabilities: [
        "AUDIT_CONTROL",
        "AUDIT_READ",
        "AUDIT_WRITE",
        "BLOCK_SUSPEND",
        "CHOWN",
        "DAC_OVERRIDE",
        "DAC_READ_SEARCH",
        "FOWNER",
        "FSETID",
        "IPC_LOCK",
        "IPC_OWNER",
        "KILL",
        "LEASE",
        "LINUX_IMMUTABLE",
        "MAC_ADMIN",
        "MAC_OVERRIDE",
        "MKNOD",
        "NET_ADMIN",
        "NET_BIND_SERVICE",
        "NET_BROADCAST",
        "NET_RAW",
        "SETFCAP",
        "SETGID",
        "SETPCAP",
        "SETUID",
        "SYS_ADMIN",
        "SYS_BOOT",
        "SYS_CHROOT",
        "SYS_MODULE",
        "SYS_NICE",
        "SYS_PACCT",
        "SYS_PTRACE",
        "SYS_RAWIO",
        "SYS_RESOURCE",
        "SYS_TIME",
        "SYS_TTY_CONFIG",
        "SYSLOG",
        "WAKE_ALARM",
      ],
      vulnerabilityscan: {
        enabled: false,
        schedule: "0 0 * * *",
        image: {
          repository: "aquasec/trivy",
          tag: "latest",
        },
      },
      healthcheck: {
        enabled: true,
        path: "/",
        startupSeconds: 90,
        timeoutSeconds: 3,
        periodSeconds: 10,
      },
      // Environment variable overlap dialog state
      envOverlapDialog: false,
      envOverlaps: [] as { name: string; oldValue: string; newValue: string }[],
      selectedOverlaps: [] as string[],
      pendingEnvVars: [] as EnvVar[],
      nameRules: [
        (v: any) => !!v || "Name is required",
        (v: any) => v.length <= 60 || "Name must be less than 60 characters",
        (v: any) =>
          /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(v) ||
          "Allowed characters : [a-zA-Z0-9_-]",
      ],
      repositoryRules: [
        //(v: any) => !!v || 'Repository is required',
        //(v: any) => v.length <= 120 || 'Repository must be less than 120 characters',
        //    ((git|ssh|http(s)?)|(git@[\w\.]+))(:(//)?)([\w\.@\:/\-~]+)(\.git)(/)?
        //    ((git|ssh|http(s)?)|(git@[\w.]+))(:(\/\/)?)([\w.@:\/\-~]+)(\.git)
        //    (git@[\w.]+:\/\/)([\w.\/\-~]+)(\.git) // not working
        //    ((git|ssh|http(s)?)|(git@[\w\.-]+))(:(//)?)([\w\.@\:/\-~]+)(\.git)(/)?
        (v: any) =>
          /^((git|ssh|http(s)?)|(git@[\w.-]+))(:(\/\/)?)([\w.@:/\-~]+)(\.git)(\/)?/.test(
            v
          ) || 'Format "git@github.com:organisation/repository.git"',
      ],
      domainRules: [
        (v: any) => !!v || "Domain is required",
        (v: any) => v.length <= 253 || "Name must be less than 253 characters",
        (v: any) =>
          /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/.test(
            v
          ) ||
          v === "localhost" ||
          "Not a domain",
        (v: any) => this.checkDomainAvailability(v) || "Domain already taken",
      ],
      cronjobScheduleRules: [
        (v: any) => !!v || "Schedule is required",
        (v: any) =>
          /(((\d+,)+\d+|(\d+(\/|-)\d+)|\d+|\*) ?){5,7}/.test(v) ||
          "Not a valid crontab format",
      ],
      uidRules: [
        //v => !!v || 'UID is required',
        (v: any) => /^\d+$/.test(v) || "Not a number",
      ],
      /*
      buildpackRules: [
        v => !!v || 'Buildpack is required',
        v => /(NodeJS|Docker)$/.test(v) || 'select a valid buildpack',
      ],
*/
    };
  },
  computed: {
    kuberoConfig() {
      const store = useKuberoStore();
      return store.kubero;
    },
    overlapHeaders() {
      return [
        { title: this.$t('app.form.variableName'), key: 'name' },
        { title: this.$t('app.form.currentValue'), key: 'oldValue' },
        { title: this.$t('app.form.newValue'), key: 'newValue' },
      ];
    },
  },
  watch: {
    advanced(newValue) {
      localStorage.setItem("kubero-advanced-app-config", newValue.toString());
    },
  },
  async mounted() {
    this.loading = true;
    try {
      await Promise.all([
        this.loadPipelineAndApp(),
        this.loadStorageClasses(),
        this.loadPodsizeList(),
        this.loadBuildpacks(),
        this.loadClusterIssuers(),
        this.getDomains(),
      ]);

      if (this.$route.query.template) {
        const template = this.$route.query.template as string;
        await this.loadTemplate(template);
      }
    } finally {
      this.loading = false;
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
      this.ingress.hosts.push({
        host: "",
        paths: [{ path: "/", pathType: "ImplementationSpecific" }],
      });
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
    async getDomains() {
      return axios.get("/api/kubernetes/domains").then((response) => {
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
      if (this.app == "new") {
        return { name: "Pipeline Apps", params: { pipeline: this.pipeline } };
      } else {
        return {
          name: "App Dashboard",
          params: { pipeline: this.pipeline, phase: this.phase, app: this.app },
        };
      }
    },
    async loadClusterIssuers() {
      return axios.get("/api/config/clusterissuer").then((response) => {
        this.letsecryptClusterIssuer = response.data.clusterissuer;
      });
    },
    async loadTemplate(template: string) {
      return axios.get("/api/templates/" + template).then((response) => {
        this.name = response.data.name;
        this.containerPort = response.data.image.containerPort;
        this.deploymentstrategy = response.data.deploymentstrategy;

        this.docker.image = response.data.image.repository;
        this.docker.tag = response.data.image.tag;

        this.envVars = response.data.envVars;
        if (
          response.data.serviceAccount &&
          response.data.serviceAccount.annotations
        ) {
          this.sAAnnotations = Object.entries(
            response.data.serviceAccount.annotations
          ).map(([key, value]) => ({
            annotation: key,
            value: value as string,
          }));
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
          this.panel.push(6);
        }
        if (Object.keys(this.sAAnnotations).length > 0) {
          this.panel.push(5);
        }
        if (this.extraVolumes.length > 0) {
          this.panel.push(8);
        }
        if (this.cronjobs.length > 0) {
          this.panel.push(9);
        }

        // Backward compatibility older v1.11.1
        if (
          this.buildpack &&
          this.buildpack.run &&
          this.buildpack.run.readOnlyAppStorage === undefined
        ) {
          this.buildpack.run.readOnlyAppStorage = true;
        }
      });
    },
    changeName(name: string) {
      this.ingress.hosts[0].host = name + "." + this.pipelineData.domain;
    },
    async loadPipelineAndApp() {
      return axios.get("/api/pipelines/" + this.pipeline).then((response) => {
        this.pipelineData = response.data;

        if (this.pipelineData.dockerimage) {
          this.docker.image = this.pipelineData.dockerimage;
        }

        this.loadBranches();
        this.buildpack = this.pipelineData.buildpack;
        this.buildstrategy = this.pipelineData.buildstrategy;
        //this.deploymentstrategy = this.pipelineData.deploymentstrategy;

        if (this.app == "new") {
          if (this.pipelineData.git.repository.clone_url == "") {
            this.deploymentstrategy = "docker";
          } else {
            this.deploymentstrategy = "git";
          }

          // extract domain from pipeline phase
          for (let i = 0; i < this.pipelineData.phases.length; i++) {
            if (this.pipelineData.phases[i].name == this.phase) {
              if (
                this.pipelineData.phases[i].domain &&
                this.pipelineData.phases[i].domain != ""
              ) {
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
            this.panel.push(6);
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
        if (
          this.buildpack &&
          this.buildpack.run &&
          this.buildpack.run.readOnlyAppStorage === undefined
        ) {
          this.buildpack.run.readOnlyAppStorage = true;
        }

        if (this.app != "new") {
          this.loadApp();
        }
      });
    },
    async loadStorageClasses() {
      return axios.get("/api/kubernetes/storageclasses").then((response) => {
        for (let i = 0; i < response.data.length; i++) {
          this.storageclasses.push(response.data[i].name);
        }
      });
    },
    loadBranches() {
      // empty if not connected
      if (!this.pipelineData.git.provider) {
        return;
      }

      // encode string to base64 (for ssh url)
      const gitrepoB64 = btoa(this.pipelineData.git.repository.ssh_url);
      const gitprovider = this.pipelineData.git.provider;

      axios
        .get("/api/repo/" + gitprovider + "/" + gitrepoB64 + "/branches")
        .then((response) => {
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

    async loadPodsizeList() {
      return axios.get("/api/config/podsizes").then((response) => {
        if (response.data.length > 0 && this.app == "new") {
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

    async loadBuildpacks() {
      return axios.get("/api/config/runpacks").then((response) => {
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
      axios
        .delete(`/api/apps/${this.pipeline}/${this.phase}/${this.app}`)
        .then(() => {
          // wait for 1 second and redirect to apps page
          // this avoids a race condition with the backend
          setTimeout(() => {
            this.$router.push(`/pipeline/${this.pipeline}/apps`);
          }, 1000);
        })
        .catch((error) => {
          console.log(error);
        });
    },
    loadApp() {
      if (this.app !== "new") {
        axios
          .get(`/api/apps/${this.pipeline}/${this.phase}/${this.app}`)
          .then((response) => {
            this.resourceVersion = response.data.metadata.resourceVersion;

            // Open Panel if there is some data to show
            if (response.data.spec.envVars.length > 0) {
              this.panel.push(6);
            }
            if (
              response.data.spec.serviceAccount &&
              Object.entries(response.data.spec.serviceAccount?.annotations)
                .length > 0
            ) {
              this.panel.push(5);
            }
            if (response.data.spec.extraVolumes.length > 0) {
              this.panel.push(8);
            }
            if (response.data.spec.cronjobs.length > 0) {
              this.panel.push(9);
            }

            let command = "";
            if (response.data.spec.image.command) {
              command = response.data.spec.image.command.join(" ");
            }

            this.security = response.data.spec.image.run.securityContext || {};

            this.deploymentstrategy = response.data.spec.deploymentstrategy;
            this.buildstrategy = response.data.spec.buildstrategy || "plain";
            this.name = response.data.spec.name;
            this.sleep = response.data.spec.sleep;
            this.basicAuth = response.data.spec.basicAuth || {
              enabled: false,
              realm: "Authentication required",
              accounts: [],
            };
            this.buildpack = {
              run: response.data.spec.image.run,
              build: response.data.spec.image.build,
              fetch: response.data.spec.image.fetch,
            };
            this.gitrepo = response.data.spec.gitrepo;
            this.branch = response.data.spec.branch;
            this.imageTag = response.data.spec.imageTag;
            this.docker.image = response.data.spec.image.repository || "";
            this.docker.tag = response.data.spec.image.tag || "latest";
            this.docker.command = command;
            this.autodeploy = response.data.spec.autodeploy;
            this.envVars = response.data.spec.envVars;
            this.serviceAccount = response.data.spec.serviceAccount;
            if (
              response.data.spec.serviceAccount &&
              response.data.spec.serviceAccount.annotations
            ) {
              this.sAAnnotations = Object.entries(
                response.data.spec.serviceAccount.annotations
              ).map(([key, value]) => ({
                annotation: key,
                value: value as string,
              }));
            }
            this.extraVolumes = response.data.spec.extraVolumes;
            this.containerPort = response.data.spec.image.containerPort;
            this.podsize = response.data.spec.podsize;
            this.autoscale = response.data.spec.autoscale;
            this.webreplicas = response.data.spec.web.replicaCount;
            this.workerreplicas = response.data.spec.worker.replicaCount;
            this.webreplicasrange = [
              response.data.spec.web.autoscaling.minReplicas,
              response.data.spec.web.autoscaling.maxReplicas,
            ];
            this.workerreplicasrange = [
              response.data.spec.worker.autoscaling.minReplicas,
              response.data.spec.worker.autoscaling.maxReplicas,
            ];
            this.cronjobs =
              this.cronjobUnformat(response.data.spec.cronjobs) || [];
            this.addons = response.data.spec.addons || [];
            this.vulnerabilityscan = response.data.spec.vulnerabilityscan;
            this.ingress = response.data.spec.ingress || {};
            this.healthcheck = response.data.spec.healthcheck || {
              enabled: true,
              path: "/",
              startupSeconds: 90,
              timeoutSeconds: 30,
              periodSeconds: 10,
            };

            // iterate over ingress hosts and fill sslIndex
            for (let i = 0; i < this.ingress.hosts.length; i++) {
              this.sslIndex.push(
                this.ingress.tls[0].hosts.includes(this.ingress.hosts[i].host)
              );
            }

            // Backward compatibility older v1.11.1
            if (
              this.buildpack &&
              this.buildpack.run &&
              this.buildpack.run.readOnlyAppStorage === undefined
            ) {
              this.buildpack.run.readOnlyAppStorage = true;
            }

            // remove loaded domain from taken domains
            this.takenDomains = this.whiteListDomains(this.takenDomains);
          });
      }
    },
    setSSL() {
      if (this.ingress.tls?.length == 0) {
        this.ingress.tls = [{ hosts: [], secretName: this.name + "-tls" }];
      }
      this.ingress.tls[0].hosts = [];
      this.ingress.tls[0].secretName = this.name + "-tls";
      this.ingress.hosts.forEach((host, index) => {
        if (this.sslIndex[index]) {
          this.ingress.tls[0].hosts.push(host.host);
        }
      });
    },
    cleanupIngressAnnotations() {
      if (this.ingress.tls[0].hosts.length == 0) {
        delete this.ingress.annotations["cert-manager.io/cluster-issuer"];
        delete this.ingress.annotations["kubernetes.io/tls-acme"];
      } else {
        this.ingress.annotations["cert-manager.io/cluster-issuer"] =
          this.letsecryptClusterIssuer;
        this.ingress.annotations["kubernetes.io/tls-acme"] = "true";
      }

      if (
        this.ingress.annotations[
          "nginx.ingress.kubernetes.io/whitelist-source-range"
        ] == ""
      ) {
        delete this.ingress.annotations[
          "nginx.ingress.kubernetes.io/whitelist-source-range"
        ];
      }

      if (
        this.ingress.annotations[
          "nginx.ingress.kubernetes.io/denylist-source-range"
        ] == ""
      ) {
        delete this.ingress.annotations[
          "nginx.ingress.kubernetes.io/denylist-source-range"
        ];
      }

      if (
        this.ingress.annotations[
          "nginx.ingress.kubernetes.io/force-ssl-redirect"
        ] == false
      ) {
        delete this.ingress.annotations[
          "nginx.ingress.kubernetes.io/force-ssl-redirect"
        ];
      }

      if (
        this.ingress.annotations[
          "nginx.ingress.kubernetes.io/proxy-buffer-size"
        ] == "4k"
      ) {
        delete this.ingress.annotations[
          "nginx.ingress.kubernetes.io/proxy-buffer-size"
        ];
      }

      if (
        this.ingress.annotations["nginx.ingress.kubernetes.io/enable-cors"] ==
        "false"
      ) {
        delete this.ingress.annotations[
          "nginx.ingress.kubernetes.io/enable-cors"
        ];
        delete this.ingress.annotations[
          "nginx.ingress.kubernetes.io/cors-allow-origin"
        ];
        delete this.ingress.annotations[
          "nginx.ingress.kubernetes.io/cors-allow-headers"
        ];
        delete this.ingress.annotations[
          "nginx.ingress.kubernetes.io/cors-expose-headers"
        ];
        delete this.ingress.annotations[
          "nginx.ingress.kubernetes.io/cors-allow-credentials"
        ];
        delete this.ingress.annotations[
          "nginx.ingress.kubernetes.io/cors-max-age"
        ];
        delete this.ingress.annotations[
          "nginx.ingress.kubernetes.io/cors-allow-methods"
        ];
      }
    },
    async updateApp() {
      this.loading = true;
      try {
        if (this.gitrepo.ssh_url == this.pipelineData.git.repository.ssh_url) {
          this.gitrepo = this.pipelineData.git.repository;
        }

        if (this.gitrepo.admin == false) {
          //this.gitrepo.clone_url = this.gitrepo.ssh_url.replace(':', '/').replace('git@', 'https://');
          // eslint-disable-next-line no-useless-escape
          const regex =
            /(git@|ssh:|http[s]?:\/\/)([\w.]+)(:|\/)([\w/\-~]+)(\.git)?/;
          this.gitrepo.clone_url = this.gitrepo.ssh_url.replace(
            regex,
            "https://$2/$4$5"
          );
        }

        this.setSSL();
        this.cleanupIngressAnnotations();

        let command = [] as string[];
        if (this.docker.command.length > 0) {
          command = this.docker.command.split(" ");
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
          image: {
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
              targetCPUUtilizationPercentage: 80,
              targetMemoryUtilizationPercentage: 80,
            },
          },
          worker: {
            replicaCount: this.workerreplicas || 0,
            autoscaling: {
              minReplicas: this.workerreplicasrange[0] || 0,
              maxReplicas: this.workerreplicasrange[1] || 0,
              targetCPUUtilizationPercentage: 80,
              targetMemoryUtilizationPercentage: 80,
            },
          },
          extraVolumes: this.extraVolumes,
          cronjobs: this.cronjobFormat(this.cronjobs),
          addons: this.addons,
          security: this.security,
          ingress: this.ingress,
          vulnerabilityscan: this.vulnerabilityscan,
          healthcheck: this.healthcheck,
        };

        if (typeof postdata.image.run.securityContext.runAsUser === "string") {
          postdata.image.run.securityContext.runAsUser = parseInt(
            postdata.image.run.securityContext.runAsUser
          );
        }
        if (typeof postdata.image.run.securityContext.runAsGroup === "string") {
          postdata.image.run.securityContext.runAsGroup = parseInt(
            postdata.image.run.securityContext.runAsGroup
          );
        }

        await axios.put(
          `/api/apps/${this.pipeline}/${this.phase}/${this.app}/${this.resourceVersion}`,
          postdata
        );
        this.$router.push(`/pipeline/${this.pipeline}/apps`);
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
    },
    async createApp() {
      this.loading = true;
      try {
        if (this.pipelineData.buildpack !== undefined) {
          if (
            this.buildpack.build.command !==
              this.pipelineData.buildpack.build.command ||
            this.buildpack.run.command !==
              this.pipelineData.buildpack.run.command
          ) {
            this.buildpack.name = "custom";
          }
        }

        if (this.gitrepo.ssh_url == this.pipelineData.git.repository.ssh_url) {
          this.gitrepo = this.pipelineData.git.repository;
        }

        if (this.gitrepo.admin == false) {
          // eslint-disable-next-line no-useless-escape
          const regex =
            /(git@|ssh:|http[s]?:\/\/)([\w.]+)(:|\/)([\w/\-~]+)(\.git)?/;
          this.gitrepo.clone_url = this.gitrepo.ssh_url.replace(
            regex,
            "https://$2/$4$5"
          );
        }

        if (this.deploymentstrategy == "git" && this.buildstrategy != "plain") {
          this.docker.image = "ghcr.io/kubero-dev/idler";
          this.docker.tag = "v1";
        }

        this.setSSL();
        this.cleanupIngressAnnotations();

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
          image: {
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
              targetCPUUtilizationPercentage: 80,
              targetMemoryUtilizationPercentage: 80,
            },
          },
          worker: {
            replicaCount: this.workerreplicas || 0,
            autoscaling: {
              minReplicas: this.workerreplicasrange[0] || 0,
              maxReplicas: this.workerreplicasrange[1] || 0,
              targetCPUUtilizationPercentage: 80,
              targetMemoryUtilizationPercentage: 80,
            },
          },
          extraVolumes: this.extraVolumes,
          cronjobs: this.cronjobFormat(this.cronjobs),
          addons: this.addons,
          security: this.security,
          ingress: this.ingress,
          vulnerabilityscan: this.vulnerabilityscan,
          healthcheck: this.healthcheck,
        };

        if (postdata.image.run == undefined) {
          postdata.image.run = {} as BuildpackStepConfig;
        }

        if (typeof postdata.image.run.securityContext.runAsUser === "string") {
          postdata.image.run.securityContext.runAsUser = parseInt(
            postdata.image.run.securityContext.runAsUser
          );
        }
        if (typeof postdata.image.run.securityContext.runAsGroup === "string") {
          postdata.image.run.securityContext.runAsGroup = parseInt(
            postdata.image.run.securityContext.runAsGroup
          );
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
        await axios.post(
          `/api/apps/${this.pipeline}/${this.phase}/${this.app}`,
          postdata
        );
        this.name = "";
        this.$router.push({ path: "/pipeline/" + this.pipeline + "/apps" });
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
    },
    addAuthLine() {
      this.basicAuth.accounts.push({
        user: "",
        pass: "",
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
        name: "",
        value: "",
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
        annotation: "",
        value: "",
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
      // check if the file is an array or not
      let envFiles = [] as File[];
      if (!Array.isArray(this.envFile) && this.envFile) {
        envFiles = [this.envFile];
      }

      for (let i = 0; i < envFiles.length; i++) {
        const file = envFiles[i];

        // Validate file type
        if (!file.name?.endsWith(".env") && !file.name.endsWith(".txt")) {
          console.warn(
            `Skipping file ${file.name}: Expected .env or .txt file`
          );
          continue;
        }

        const reader = new FileReader();
        reader.onload = () => {
          try {
            const text = reader.result as string;
            this.parseEnvFile(text);
          } catch (error) {
            console.error("Error parsing env file:", error);
          }
        };

        reader.onerror = () => {
          console.error(`Error reading file ${file.name}`);
        };

        reader.readAsText(file);
      }

      // clear file input
      this.envFile = null;
    },
    parseEnvFile(text: any) {
      const lines = text.split("\n");
      const newEnvVars: EnvVar[] = [];
      const overlaps: { name: string; oldValue: string; newValue: string }[] =
        [];

      for (const line of lines) {
        const trimmedLine = line.trim();
        // Skip empty lines and comments
        if (!trimmedLine || trimmedLine.startsWith("#")) {
          continue;
        }

        const equalIndex = trimmedLine.indexOf("=");
        if (equalIndex === -1) {
          continue; // Skip lines without =
        }

        const name = trimmedLine.substring(0, equalIndex).trim();
        const value = trimmedLine.substring(equalIndex + 1).trim();

        // Remove quotes if present
        const cleanValue = value.replace(/^["']|["']$/g, "");

        if (name) {
          const existingVar = this.envVars.find(
            (envVar) => envVar.name === name
          );
          if (existingVar) {
            // skip if value is the same
            if (existingVar.value === cleanValue) {
              continue;
            }

            // Found overlap - add to overlaps list
            overlaps.push({
              name,
              oldValue: existingVar.value,
              newValue: cleanValue,
            });
          } else {
            // No overlap - can add directly
            newEnvVars.push({ name, value: cleanValue });
          }
        }
      }

      // Add non-overlapping variables immediately
      this.envVars.push(...newEnvVars);

      // If there are overlaps, show dialog
      if (overlaps.length > 0) {
        this.envOverlaps = overlaps;
        this.selectedOverlaps = overlaps.map((overlap) => overlap.name); // Default all selected
        this.envOverlapDialog = true;
      } else if (newEnvVars.length === 0) {
        // Show notification if no new environment variables were found
        Swal.fire({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          icon: 'info',
          title: this.$t('app.form.noNewEnvVarsFound'),
          background: "rgb(var(--v-theme-cardBackground))",
          color: "rgba(var(--v-theme-on-background),var(--v-high-emphasis-opacity))",
        });
      }
    },
    addVolumeLine() {
      this.extraVolumes.push({
        name: "example-volume",
        emptyDir: false,
        storageClass: "standard",
        size: "1Gi",
        accessMode: "ReadWriteOnce",
        accessModes: ["ReadWriteMany"],
        mountPath: "/example/path",
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
        name: "hello world",
        schedule: "* * * * *",
        image: "busybox:1.28",
        command: "/bin/sh -c echo hello world",
        restartPolicy: "OnFailure",
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
      cronjobs.map((cronjob) => {
        // TODO make sure cronjob has a valid structure
        cronjob.name = cronjob.name.replace(/\s/g, "-");
        cronjob.restartPolicy = "OnFailure";

        //cronjob.command = cronjob.command.replace(/\s/g, '');
        //cronjob.command = cronjob.command.replace(/\//g, '-');
        //cronjob.command = cronjob.command.replace(/\*/g, '*');
        //cronjob.command = cronjob.command.split(" ");
        cronjob.command = cronjob.command.match(/(?:[^\s"]+|"[^"]*")+/g);
      });
      return cronjobs;
    },
    cronjobUnformat(cronjobs: Cronjob[]) {
      cronjobs.map((cronjob) => {
        cronjob.command = cronjob.command.join(" ");
      });
      return cronjobs;
    },
    // Environment variable overlap dialog methods
    cancelOverlapDialog() {
      this.envOverlapDialog = false;
      this.envOverlaps = [];
      this.selectedOverlaps = [];
    },
    applyOverlapChanges() {
      // Update existing environment variables with selected new values
      for (const overlap of this.envOverlaps) {
        if (this.selectedOverlaps.includes(overlap.name)) {
          const existingVar = this.envVars.find(
            (envVar) => envVar.name === overlap.name
          );
          if (existingVar) {
            existingVar.value = overlap.newValue;
          }
        }
      }

      // Close dialog and reset state
      this.envOverlapDialog = false;
      this.envOverlaps = [];
      this.selectedOverlaps = [];
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
  background: #bbb;
}
</style>
