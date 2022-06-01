export let pipeline = {
    apiVersion: "kubero.dev/v1alpha1",
    kind: "Pipeline",
    metadata: {
        name: 'REPLACED_BY_PIPELINE_NAME',
        labels: {
            manager: 'kubero'
        }
    },
    spec: {
        name: "REPLACED_BY_PIPELINE_NAME",
        reviewapps: true,
        phases: [
            { 
                name: "test",
                enabled: false
            },
            { 
                name: "stage",
                enabled: false
            },
            { 
                name: "production",
                enabled: true
            }
        ]
    }
}
