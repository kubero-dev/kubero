export let service = {
    "apiVersion": "v1",
    "kind": "Service",
    "metadata": {
        "labels": {
            "app.kubernetes.io/name": "keroku-service",
            "app.kubernetes.io/part-of": "keroku",
            "app.kubernetes.io/managed-by": "keroku",
            "component": "service"
        },
        "name": "REPLACED_BY_SERVICE_NAME",
    },
    "spec": {
        "ipFamilyPolicy": "SingleStack",
        "ports": [
            {
                "name": "web",
                "port": 8080,
                "protocol": "TCP",
                "targetPort": 8080
            }
        ],
        "selector": {
            "app.kubernetes.io/name": "keroku-deployment",
            "app.kubernetes.io/part-of": "keroku",
            "app.kubernetes.io/managed-by": "keroku",
            "instance": "web"
        },
        "sessionAffinity": "None",
        "type": "ClusterIP"
    },
    "status": {
        "loadBalancer": {}
    }
}