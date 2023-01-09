# Prerequisites
In order to install Kubero, you need to have a Kubernetes cluster and the `kubectl` command line tool installed.

## Kubernetes cluster
You can use any Kubernetes cluster. If you don't have one, you can use [Kind](https://kind.sigs.k8s.io/docs/user/quick-start/) or use the to Kubero CLI to create a cluster on one of the many cloud providers offering Kubernetes as a service.

### Starting a local Kind cluster

```bash
kind create cluster --config https://raw.githubusercontent.com/kubero-dev/kubero/main/kind.yaml
```
