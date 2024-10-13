# How to contribute
> "Great to see you here! We are happy you are considering contributing to Kubero." @mms-gianni

All contributions are welcome. For simple typo's, just open a PR. For bigger ideas/changes we kindly ask you to reach out on discord or open an issue first before you put a lot of work into it. We are very happy to discuss your ideas and help you to get started.

Willing to contribute something, but you don't know where to start? Have a look into the [Roadmap](https://github.com/orgs/kubero-dev/projects/1). 

## Process
1. Setup your development environment
2. Fork the repository and checkout the code
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


### 1) Start a local Kubernetes cluster with Kind
Run `kubero install` with the [CLI](https://github.com/kubero-dev/kubero-cli/releases/latest) and select `kind`. 
This will install a local cluster with a single node and all required components.

You can skip the kubero-UI step since we will use our local code.

### 2) Export the kubeconfig
```bash
kind export kubeconfig --name kubero-XXX --kubeconfig ./kubeconfig
```

### 3) Create a dev namespace
This step is optional but will avoid interference with the local InCluster kubero-ui instance.
```bash
kubectl create namespace kubero-dev
```

### 4) Prepare your local code
Fork the repository https://github.com/kubero-dev/kubero into your account.

Clone your Fork to your local disk.

### 5) Configure Kubero's environment
```bash
mv .env.template .env
```

### 6) Start local node server
This will start the server part. 
```bash
cd server
yarn install
yarn dev
```

Initiate the client JS part. 
```bash
cd client
yarn install
yarn watch
```

You should be able to reach your local dev instance via http://localhost:2000 

### 7) start optional services 
If you need any additional services (Gitea, Github ...), just run `docker-compose up -d`, or add it to the `docker-compose.yml` file, if it is missing.

Nope. No extra database is required. All data is stored in the Kubernetes cluster.

