export let application = {
    apiVersion: "kubero.dev/v1alpha1",
    kind: "Application",
    metadata: {
        name: 'REPLACED_BY_APP_NAME',
        labels: {
            manager: 'kubero'
        }
    },
    spec: {
        name: 'REPLACED_BY_APP_NAME',
        pipline: 'my-new-pipeline-example',
        phase: 'production',
        gitrepo: 'example-org/my-awesome-app',
        branch: 'master',
        autodeploy: true,
        domain: 'example.com',
        podsize: 'large',
        webreplicas: 3,
        workerreplicas: 3,
    }
}
