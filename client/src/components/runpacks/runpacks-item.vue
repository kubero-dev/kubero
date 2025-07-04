<template>
    <div>
        <v-row>
            <v-col
                cols="12"
                md="4"
            >
                <v-text-field
                v-model="buildpackStage.repository"
                :label="title + ' Repository'"
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
                label="Tag"
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
                    label="Run as user"
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
                    label="Run as group"
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
                    label="Read only app volume"
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
                    label="Read only root filesystem"
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
                    label="Allow privilege escalation"
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
                    label="Run as non root"
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
                    v-model="buildpackStage.securityContext.capabilities.drop"
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
    </div>
</template>


<script lang="ts">
import { defineComponent } from 'vue'


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
        console.log('RunpacksItem props:', props.buildpackStage)
        return {
            buildpackStage: props.buildpackStage,
            title: props.title,
            advanced: props.advanced
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
            ],
            uidRules: [
                (v: string) => !!v || 'Required',
                (v: string) => /^\d+$/.test(v) || 'Must be a number'
            ]
        }
    }
})
</script>