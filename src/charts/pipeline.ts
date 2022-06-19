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
        gitrepo: "REPLACED_BY_GITREPO",
        reviewapps: true,
        phases: [{}
        ]
    }
}
