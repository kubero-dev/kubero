import { defineStore } from 'pinia'

export const useKuberoStore = defineStore('kubero', {
    state: () => ({
        kubero: {
            version: "dev",
            operatorVersion: "unknown",
            session: false,
            kubernetesVersion: "",
            isAuthenticated: false,
            socket: null as any,
            nextGenSession: {
                username: "",
                token: "",
            },
            auditEnabled: false,
            adminDisabled: false,
            templatesEnabled: true,
            buildPipeline: false,
            consoleEnabled: false,
            metricsEnabled: false,
            sleepEnabled: false,
        },
        buildPipeline: false,
    }),
    /*
    getters: {
        getKubero() {
            return this.kubero
        },
    },
    actions: {
        setKubero(kubero) {
            this.kubero = kubero
        },
    },
    */
})