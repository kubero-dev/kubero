<template>
    <div>
        <v-row>
            <v-col
                cols="12"
                md="4"
            >
                <v-text-field
                v-model="buildpackStage.repository"
                :label="$t('runpacks.details.repository')"
                required
                density="compact"
                ></v-text-field>
            </v-col>
            <v-col
                cols="12"
                md="2"
            >
                <v-text-field
                v-model="buildpackStage.tag"
                :label="$t('runpacks.form.tag')"
                required
                density="compact"
                ></v-text-field>
            </v-col>
            <v-col
                cols="12"
                md="3"
                v-if="advanced"
            >
                <v-text-field
                    v-model="buildpackStage.securityContext.runAsUser"
                    :rules="uidRules"
                    density="compact"
                    :label="$t('runpacks.form.runAsUser')"
                ></v-text-field>
            </v-col>
            <v-col
                cols="12"
                md="3"
                v-if="advanced"
            >
                <v-text-field
                    v-model="buildpackStage.securityContext.runAsGroup"
                    :rules="uidRules"
                    density="compact"
                    :label="$t('runpacks.form.runAsGroup')"
                ></v-text-field>
            </v-col>
        </v-row>

        <v-row v-if="advanced">
            <v-col
                cols="12"
                md="3"
            >
                <v-switch
                    v-model="buildpackStage.readOnlyAppStorage"
                    :label="$t('runpacks.form.readOnlyAppVolume')"
                    density="compact"
                    color="primary"
                ></v-switch>
            </v-col>
            <v-col
                cols="12"
                md="3"
            >
                <v-switch
                    v-model="buildpackStage.securityContext.readOnlyRootFilesystem"
                    :label="$t('runpacks.form.readOnlyRootFilesystem')"
                    density="compact"
                    color="primary"
                ></v-switch>
            </v-col>
            <v-col
                cols="12"
                md="3"
            >
                <v-switch
                    v-model="buildpackStage.securityContext.allowPrivilegeEscalation"
                    :label="$t('runpacks.form.allowPrivilegeEscalation')"
                    density="compact"
                    color="primary"
                ></v-switch>
            </v-col>
            <v-col
                cols="12"
                md="3"
            >
                <v-switch
                    v-model="buildpackStage.securityContext.runAsNonRoot"
                    :label="$t('runpacks.form.runAsNonRoot')"
                    density="compact"
                    color="primary"
                ></v-switch>
            </v-col>
        </v-row>

        <v-row v-if="advanced">
            <v-col
                cols="12"
                md="6"
            >
                <v-select
                    v-model="buildpackStage.securityContext.capabilities.add"
                    :items="capabilities"
                    :menu-props="{ maxHeight: '400' }"
                    :label="$t('runpacks.form.capabilitiesAdd')"
                    multiple
                    :hint="$t('runpacks.form.selectOneOrMore')"
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
                    v-model="buildpackStage.securityContext.capabilities.drop"
                    :items="capabilities"
                    :menu-props="{ maxHeight: '400' }"
                    :label="$t('runpacks.form.capabilitiesDrop')"
                    multiple
                    :hint="$t('runpacks.form.selectOneOrMore')"
                    persistent-hint
                    chips
                    class="capability"
                ></v-select>
            </v-col>
        </v-row>
    </div>
</template>


<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
    name: 'RunpacksItem',
    props: {
        title: {
            type: String,
            required: true
        },
        buildpackStage: {
            type: Object as () => any,
            required: true
        },
        advanced: {
            type: Boolean,
            default: false
        }
    },
    setup(props) {
        const { t } = useI18n()
        
        const uidRules = computed(() => [
            (v: string) => !!v || t('runpacks.form.required'),
            (v: string) => /^\d+$/.test(v) || t('runpacks.form.mustBeNumber')
        ])
        
        console.log('RunpacksItem props:', props.buildpackStage)
        return {
            buildpackStage: props.buildpackStage,
            title: props.title,
            advanced: props.advanced,
            uidRules
        }
    },
    data () {
        return {
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
            ]
        }
    }
})
</script>