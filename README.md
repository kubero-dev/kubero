# Keroku
We all love Heroku. But we also love Kubernetes. So we want to deploy on kubernetes like on Heroku.

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