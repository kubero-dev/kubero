# How to contribute

All contributions are welcome. For simple typos, just open a PR.
For bigger ideas it might be better to open an issue first before you put a lot of work into it. 

Want to contribute, but don't know where to start? Have a look into the [Roadmap](https://github.com/orgs/kubero-dev/projects/1).

1. Setup your development environment
2. Fork the repository
3. Create a new branch
4. Make your changes
5. Open a PR

## Development setup for the Kubero UI

### Requirements
- docker
- kind
- kubectl
- kubero-cli
- git

### 1) prepare your local code
Fork the repository https://github.com/kubero-dev/kubero into your account.

### 2) Start a cluster
Run `kubero install` with the [CLI](https://github.com/kubero-dev/kubero-cli/releases/latest) and select `kind`. 
This will install a local cluster with a single node and all required components.

You can skip the kubero-UI step since we will use our local code.

### 3) Export the kubeconfig
```bash
kind export kubeconfig --name kubero-XXX --kubeconfig ./kubeconfig
```

### Create a dev namespace
This step is optional but will avoid interference with the local InCluster kubero-ui instance.
```bash
kubectl create namespace kubero-dev
```

### Configure Kubero's environment
```bash
mv .env.template .env
```

### Start local node server
```bash
cd server
yarn install
yarn dev
```

```bash
cd client
yarn install
yarn watch
```

### start optional services 
If you need any additional services (Gitea, Github ...), just run `docker-compose up -d`, or add it to the `docker-compose.yml` file, if it is missing.

Nope. No extra database is required. All data is stored in the Kubernetes cluster.

