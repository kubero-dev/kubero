# Keroku
We all love Heroku. But we also love Kubernetes. So we want to deploy on kubernetes like on Heroku.

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
```bash
yarn run dev
```
### start a local kind cluster
```
kind create cluster --config kind.yaml
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
``` 