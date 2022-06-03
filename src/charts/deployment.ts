export let deployment = {
    "apiVersion": "apps/v1",
    "kind": "Deployment",
    "metadata": {
        "labels": {
            "app.kubernetes.io/name": "keroku-deployment",
            "app.kubernetes.io/part-of": "keroku",
            "app.kubernetes.io/managed-by": "keroku",
            "component": "REPLACED_BY_TYPE",
            "instance": "REPLACED_BY_INSTANCE_NAME"
        },
        "name": "REPLACED_BY_DEPLOYMENT_NAME",
    },
    "spec": {
        "progressDeadlineSeconds": 600,
        "replicas": 1,
        "revisionHistoryLimit": 10,
        "selector": {
            "matchLabels": {
                "app.kubernetes.io/name": "keroku-deployment",
                "app.kubernetes.io/part-of": "keroku",
                "app.kubernetes.io/managed-by": "keroku",
                "component": "worker",
            }
        },
        "strategy": {
            "rollingUpdate": {
                "maxSurge": "25%",
                "maxUnavailable": "25%"
            },
            "type": "RollingUpdate"
        },
        "template": {
            "metadata": {
                "labels": {
                    "app.kubernetes.io/name": "keroku-deployment",
                    "app.kubernetes.io/part-of": "keroku",
                    "app.kubernetes.io/managed-by": "keroku",
                    "component": "worker",
                }
            },
            "spec": {
                "containers": [
                    {
                        "env": [
                            {
                                "name": "TYPE",
                                "value": "NODE"
                            },
                        ],
                        "image": "nginxdemos/hello:latest",
                        "imagePullPolicy": "IfNotPresent",
                        "name": "keroku",
                        "resources": {},
                        "securityContext": {},
                        "terminationMessagePath": "/dev/termination-log",
                        "terminationMessagePolicy": "File",
                    }
                ],
                "dnsPolicy": "ClusterFirst",
                "restartPolicy": "Always",
                "schedulerName": "default-scheduler",
                "securityContext": {},
                "terminationGracePeriodSeconds": 30,
            }
        }
    }
}
