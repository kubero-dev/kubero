import { defineStore } from 'pinia'

export const useKuberoStore = defineStore('kubero', {
    state: () => ({
        kubero: {
            name: "kubero",
            version: "0.0.1",
            description: "Kubero is a Kubernetes dashboard",
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