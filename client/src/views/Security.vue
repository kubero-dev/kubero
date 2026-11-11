<template>
    <v-container fluid>
        <v-card elevation="2" outlined color="cardBackground">
            <v-card-title>
                <h3 class="headline mb-0">{{ $t('app.vulnerabilities.fleet.title') }}</h3>
            </v-card-title>
            <v-card-text>
                <v-progress-linear v-if="loading" indeterminate></v-progress-linear>
                <v-alert v-else-if="rows.length === 0" type="info" variant="tonal" border="start">
                    {{ $t('app.vulnerabilities.fleet.empty') }}
                </v-alert>
                <v-table v-else density="compact">
                    <thead>
                        <tr>
                            <th>{{ $t('app.vulnerabilities.fleet.app') }}</th>
                            <th>{{ $t('app.vulnerabilities.fleet.scanned') }}</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="row in rows" :key="row.pipeline + row.phase + row.app">
                            <td style="white-space: nowrap;">
                                <router-link :to="`/pipeline/${row.pipeline}/${row.phase}/apps/${row.app}`">
                                    {{ row.pipeline }} / {{ row.phase }} / {{ row.app }}
                                </router-link>
                            </td>
                            <td style="white-space: nowrap;">{{ new Date(row.scannedAt).toLocaleString() }}</td>
                            <td style="white-space: nowrap;">
                                <v-chip label size="x-small" class="ma-1 severity-critical">C {{ row.summary.critical }}</v-chip>
                                <v-chip label size="x-small" class="ma-1 severity-high">H {{ row.summary.high }}</v-chip>
                                <v-chip label size="x-small" class="ma-1" color="success">{{ row.summary.fixable }} {{ $t('app.vulnerabilities.fix.fixable') }}</v-chip>
                                <v-chip label size="x-small" class="ma-1" color="warning">{{ row.summary.nofix }} {{ $t('app.vulnerabilities.fix.waiting') }}</v-chip>
                            </td>
                        </tr>
                    </tbody>
                </v-table>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script lang="ts" setup>
import axios from 'axios'
import { onMounted, ref } from 'vue'

type Row = {
    pipeline: string;
    phase: string;
    app: string;
    scannedAt: string;
    summary: { critical: number; high: number; fixable: number; nofix: number };
}

const rows = ref<Row[]>([])
const loading = ref(true)

onMounted(() => {
    axios.get('/api/security/overview')
        .then(response => { rows.value = response.data })
        .catch(error => { console.log(error) })
        .finally(() => { loading.value = false })
})
</script>
