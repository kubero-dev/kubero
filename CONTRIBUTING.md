# How to contribute
> "Great to see you here! We are happy you are considering contributing to Kubero." @mms-gianni

All contributions are welcome. For simple typo's, just open a PR. For bigger ideas/changes we kindly ask you to reach out on discord or open an issue first before you put a lot of work into it. We are very happy to discuss your ideas and help you to get started.

Willing to contribute something, but you don't know where to start? Have a look into the [Roadmap](https://github.com/orgs/kubero-dev/projects/1). 

## Contribution Process
1. Setup your development environment
2. Fork the repository and checkout the code
3. Create a new branch
4. Make your changes
5. Open a PR

## Techstack
- Backend
  - [NestJS](https://nestjs.com/)
  - [TypeScript](https://www.typescriptlang.org/)
  - [Jest](https://jestjs.io/)
- Frontend
  - [Vue.js](https://vuejs.org/)
  - [Vuetify](https://vuetifyjs.com/en/)
- CLI
  - [Go](https://golang.org/)
  - [Cobra](https://cobra.dev/)
- Operator
  - [Operator SDK](https://sdk.operatorframework.io/)
  - [Helm](https://helm.sh/)
- Infrastructure 
  - [Kubernetes](https://kubernetes.io/)
  - [Kind (Development)](https://kind.sigs.k8s.io/)


## Development setup for the Kubero UI

### Requirements

To get started with Kubero development, you will need the following toolbelt:

- Docker
- Kind (Kubernetes in Docker)
- Kubectl
- [Kubero CLI](https://github.com/kubero-dev/kubero-cli/releases/latest)
- Git
- Code editor of your choice (VSCode, Webstorm, Atom, ...)

### 1) Start a Local Kubernetes Cluster with Kind
Run `kubero install` with the [CLI](https://github.com/kubero-dev/kubero-cli/releases/latest) and select `kind`. 
This will install a local cluster with a single node and all required components.

You can skip the kubero-UI step since we will use our local code.

### 2) Export the Kubeconfig
```bash
kind export kubeconfig --name kubero-XXX --kubeconfig ./kubeconfig
```
This step exports the kubeconfig for your local cluster, making it available for Kubero.

### 3) Create a Development Namespace (Optional)
Although optional, creating a separate namespace helps prevent interference with the local in-cluster Kubero-UI instance.
```bash
kubectl create namespace kubero-dev
```

### 4) Checkout the Code
1. Fork the [Kubero](https://github.com/kubero-dev/kubero) repository to your GitHub account.
2. Clone your forked repository to your local machine.

```bash
git clone https://github.com/YOUR_USERNAME/kubero.git
cd kubero
```

### 5) Start Your Local Instance
Navigate to the server directory, and rename the .env.template file to .env to set up the required environment variables.
```bash
cd server
mv .env.template .env
```

Install the dependencies, and start the server:
```bash
yarn install
yarn dev
```

Next, set up the client JavaScript part:
```bash
cd client
yarn install
yarn watch
```

You should now be able to access your local development instance at http://localhost:2000 

### 6) Start Additional Services (Optional)
If you need additional services (such as Gitea or GitHub integration), run the following command to start them via Docker:
```bash
docker-compose up -d
```
If any services are missing, you can add them to the `docker-compose.yml` file.

Nope. No extra database is required. All data is stored in the Kubernetes cluster.

