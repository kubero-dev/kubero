export let pipeline = {
    apiVersion: "keroku.dev/v1alpha1",
    kind: "Pipeline",
    metadata: {
        name: 'REPLACED_BY_PIPELINE_NAME',
        labels: {
            manager: 'keroku'
        }
    },
    spec: {
        appName: "my-awesome-app",
        gitrepo: "example-org/my-awesome-app",
        reviewapps: true,
        phases: [
            { 
                name: "production",
                branch: "master"
            }
        ]
    }
}
