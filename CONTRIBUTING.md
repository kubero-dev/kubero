# How to contribute

All contributions are welcome. For simple typos, just open a PR.
For bigger ideas it might be better to open a issue first before you put a lot of work into it.

## Development setup
### Requirements
- docker
- kubectl
- kubero-cli


### Start a cluster
run a `kubero install` with the [CLI](https://github.com/kubero-dev/kubero-cli/releases/latest) and select kind. This will install a local cluster with a single node and all required components.

### Export the kubeconfig
```bash
kind export kubeconfig --name kubero-XXX --kubeconfig ./kubeconfig
```

### Create a namespace
```bash
kubectl create namespace kubero-dev
```

### configure Kubero's environment
```bash
mv .env.template .env
```

### Start local node server
```bash
yarn install
yarn dev
```

```bash
cd client
npm install
npm run dev
```

If you need any additional services (Gitea, Github ...), just run `docker-compose up -d`, or add it to the `docker-compose.yml` file, if it is missing.

Nope. No extra database is required. All data is stored in the Kubernetes cluster.

## How to contribute your code

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Open a PR