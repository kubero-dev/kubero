import { defineStore } from 'pinia'

export const useKuberoStore = defineStore('kubero', {
    state: () => ({
        kubero: {
            version: "dev",
            templatesEnabled: true,
            session: false,
            kubernetesVersion: "",
            isAuthenticated: false,
            buildPipeline: false,
            nextGenSession: {
                username: "",
                token: "",
            },
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