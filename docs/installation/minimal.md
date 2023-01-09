# Minimal Installation

## Prequisites:
- Kubernetes cluster
- kubectl

## Install the Kubero Operator:
Required to deploy pipelines and apps
```
kubectl apply -f hhttps://raw.githubusercontent.com/kubero-dev/kubero-operator/main/deploy/operator.yaml
```

## Install the Kubero UI:
Required to manage pipelines and apps
```
kubectl create namespace kubero
kubectl apply -f https://raw.githubusercontent.com/kubero-dev/kubero-operator/main/config/samples/application_v1alpha1_kubero.yaml -n kubero
```