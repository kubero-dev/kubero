# Kubero
Kubero brings the convinience of Heroku/platform.sh to your kubernetes cluster. Your developers should not need to worry about the underlying infrastructure.

## What can Kubero do for you?
- Create a pipeline with up to 4 separate environments: review apps -> testing -> stageing -> production
- Build,start and cleanup reviewapps after opening/closing a pull request
- Automatic deployment of the app based on a branch or tag
- Create Scheduled tasks (cronjobs)
- No hassle with the deployment of the app with helm charts
- Deploy Addons (PostgreSQL, Redis, more to come)
- Easy acces of application logs in the UI
- Easy ans safe restart of the application ibn the UI

## Which heroku features are still missing?
- Dataclips
- Authentication (Will be added later) ( DO NOT EXPOSE THE UI AND API TO THE PUBLIC )
- CLI (May be added later since kubero has a API)
- Other Buildpacks (only NodeJS is currently supported, more to come soon)

# Usage
1) Create a pipeline with all your phases
1.1) Connect the Pipeline to your git repository ( not required with pre-build image deployment )
2) Create your apps with cronjobs and addons

# Installation

## Cluster Requirements: 
- Kubernetes 1.19+
- OLM - Operator Lifecycle Manager


## Create and deploy the secrets
```bash
curl -sL https://github.com/downloads/kubero-dev/kubero-operator/helm-charts/kubero/secrets.yaml.example secrets.yaml
# Edit the secret with your credentials
kubectl apply -f secrets.yaml
```
| Variable | Required | Description |
|-------:|:-------:|:-----------|
| GIT_DEPLOYMENTKEY_PUBLIC | required | generated Public Key |
| GIT_DEPLOYMENTKEY_PRIVATE_B64 | required | Base64 encoded Private Key |
| KUBECONFIG_BASE64 | reuired | Base64 encoded Kubeconfig, may contain multiple contexts |
| KUBERO_WEBHOOK_SECRET | required | Random secret string
| GITHUB_PERSONAL_ACCESS_TOKEN | optional | Personal access token for GitHub API |
| GITEA_PERSONAL_ACCESS_TOKEN | optional | Personal access token for Gitea API |
GITLAB_PERSONAL_ACCESS_TOKEN | optional | Personal access token for GitLab API |

## To base64 encode your kubeconfig
```bash
cat kubeconfig | base64 --wrap=0
```

## Install the Operator
The operator will also install the UI and all the required CRD
```bash
TODO
```

## configure Kubero
```bash
kubectl edit configmap kubero-config -n kubero
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
