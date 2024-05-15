<template>
    <div>
        <v-alert 
            v-for="rule in rules" :key="rule.name"
            :text="rule.alert?.annotations.description"
            :title="rule.name"
            :type="rule.alerting ? 'error' : 'success'"
            variant="tonal"
            density="compact"
            style="transform: scale(0.7); transform-origin: left; margin-bottom: -8px; min-width: 400px;"
        ></v-alert>
    </div>
</template>

<script lang="ts">
import axios from 'axios'


export interface Rule {
  duration: number
  health: string
  labels: Object
  name: string
  query: string
  alerting: boolean
  alert?: Alert
}


export interface Alert {
  activeAt: string
  annotations: {
    description: string
    summary: string
  }
  labels: Object
  state: string
  value: number
}

export default {
    data() {
        return {
            rules: [] as Rule[],
            timer: null as any
        }
    },
    props: {
        pipeline: {
            type: String,
            required: true
        },
        phase: {
            type: String,
            required: true
        },
        app: {
            type: String,
            required: true
        }
    },
    computed: {
        alertstate(rule: Rule) {
            if (rule.alerting ) {
                return 'error'
            } else {
                return 'info'
            }
        }
    },
    created() {
        this.loadRules()
    },
    mounted() {
        this.startTimer();
    },
    unmounted() {
        clearInterval(this.timer);
    },
    methods: {
        startTimer() {
            this.timer = setInterval(() => {
                this.loadRules()
            }, 10000);
        },
        loadRules() {
            axios.get(`/api/rules/${this.pipeline}/${this.phase}/${this.app}`)
            .then(response => {
                this.rules = response.data
            })
        }
    }
}
</script>