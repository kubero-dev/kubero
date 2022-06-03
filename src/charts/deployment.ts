export let deployment = {
    "apiVersion": "apps/v1",
    "kind": "Deployment",
    "metadata": {
        "labels": {
            "app.kubernetes.io/name": "keroku-deployment",
            "app.kubernetes.io/part-of": "keroku",
            "app.kubernetes.io/managed-by": "keroku",
            "component": "worker",
        },
        "name": "my-locust-worker",
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
                        "args": [
                            "--worker"
                        ],
                        "command": [
                            "sh",
                            "/config/docker-entrypoint.sh"
                        ],
                        "env": [
                            {
                                "name": "LOCUST_HOST",
                                "value": "https://www.google.com"
                            },
                            {
                                "name": "LOCUST_USERS",
                                "value": "1"
                            },
                            {
                                "name": "LOCUST_SPAWN_RATE",
                                "value": "1"
                            },
                            {
                                "name": "LOCUST_MASTER_NODE_HOST",
                                "value": "my-locust"
                            },
                            {
                                "name": "LOCUST_MASTER_NODE_PORT",
                                "value": "5557"
                            },
                            {
                                "name": "LOCUST_LOGLEVEL",
                                "value": "INFO"
                            },
                            {
                                "name": "LOCUST_LOCUSTFILE",
                                "value": "/mnt/locust/main.py"
                            }
                        ],
                        "image": "helo-world:latest",
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
