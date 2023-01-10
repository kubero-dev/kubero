# Configuration

Kubero has 3 sections so far:

  1) kubero: configures the UI
  2) buildpacks: the selectable list of buildpacks
  3) podSizeList: the selectable list of bods

A full example can be found here https://github.com/kubero-dev/kubero/blob/main/config.yaml

```yaml
kubero:
  context: kind-kubero
  namespace: kubero
  port: 3000
buildpacks:
  - name: NodeJS             # displayed Name
    language: JavaScript     # Language detection match
    fetch:
      repository: ghcr.io/kubero-dev/buildpacks/fetch
      tag: main
    build:
      repository: node       # image to use
      tag: latest            # tag to use
      command: "npm install" # command to run
    run:
      repository: node
      tag: latest
      command: "node index.js"
podSizeList:
- name: small
  description: 'Small (CPU: 0.25, Memory: 0.5Gi)'
  default: true
  # resources are defined as usual in Kubernetes
  # https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/
  resources:
    requests:
      memory: 0.5Gi
      cpu: 250m
    limits:
      memory: 1Gi
      cpu: 500m
```

Store the adjusted config in a configmap in the kubero namespace
```
kubectl create configmap kubero-config --from-file=config.yaml=config.yaml -n kubero
```