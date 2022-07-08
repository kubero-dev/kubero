# Kubero
We all love Heroku. But we also love Kubernetes. So we want to deploy on kubernetes like we do on Heroku.

## What can Kubero do for you?
- Create a pipeline with up to 4 separate environments: review apps -> testing -> stageing -> production
- Build and start reviewapps after opening a pull request
- Automatic deployment of the app to the environment based on a push or tag
- Create Scheduled tasks (cronjobs)
- No hassle with the deployment of the app with helm charts

## Which heroku features are still missing?
- Dataclips
- Authentication (Will be added later)
- CLI (May be added later since kubero has a API)
- Other Buildpacks (only NodeJS suppoertet yet, more to come soon)

## Which feature will be better than on Heroku?
- Write to local disk (Will be added later)

## Cluster Requirements: 
- Kubernetes 1.19+
- OLM - Operator Lifecycle Manager

## configuration

### configure Kubernetes access
```bash
$ export KUBECONFIG_PATH=<path>
``` 

or base64 encode the content of the file
```bash
$ export KUBECONFIG_BASE64=<path>
```

## Development

### local development
from local source
```bash
yarn dev
```

or with docker compose
```bash
docker-compose build
docker-compose up -d
```

### start a local kind cluster
```
kind create cluster --config kind.yaml
kubectl create -f https://raw.githubusercontent.com/operator-framework/operator-lifecycle-manager/master/deploy/upstream/quickstart/crds.yaml
kubectl create -f https://raw.githubusercontent.com/operator-framework/operator-lifecycle-manager/master/deploy/upstream/quickstart/olm.yaml
kubectl create -f https://raw.githubusercontent.com/operator-framework/operator-lifecycle-manager/master/deploy/upstream/quickstart/catalog.yaml
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

kubectl apply -f k8s/crd/pipeline.yaml
//TODO: add kubero operator installation here
``` 

### Exporting the Kubernetes config file 

Local development
```bash
kind export kubeconfig --name kubero --kubeconfig ./kubeconfig
```

To use in the docker-compose 
```bash
kind get kubeconfig --internal --name kubero > kubeconfig-docker
```
