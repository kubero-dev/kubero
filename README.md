![](https://raw.githubusercontent.com/kubero-dev/docs/refs/heads/main/static/assets/logo/kubero-logo-horizontal.png)

---

[![License](https://img.shields.io/github/license/kubero-dev/kubero?style=flat-square&color=blue")](https://github.com/kubero-dev/kubero/blob/main/LICENSE) 
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/kubero-dev/kubero?style=flat-square&color=brightgreen)](https://github.com/kubero-dev/kubero/releases/latest)
[![Discord](https://img.shields.io/discord/1051249947472826408?style=flat-square)](https://discord.gg/tafRPMWS4r)
[![GitHub (Pre-)Release Date](https://img.shields.io/github/release-date-pre/kubero-dev/kubero?style=flat-square)](https://github.com/kubero-dev/kubero/releases/latest)
[![Demo](https://img.shields.io/badge/demo-up-sucess?style=flat-square&color=blue)](https://demo.kubero.dev)

[中文翻译](README.zh-CN.md)

[日本語訳](README.ja.md)

Kubero [pronounced: Kube Hero] is a self-hosted PaaS (Platform as a Service) that allows any developer to deploy their application on Kubernetes without specialized knowledge. Kubero follows the principles of 12-factor apps. It is possible to run apps based on existing containers or from source code.

<div align="center">
  <a href="https://www.kubero.dev/docs/screenshots" target="_blank"><img src="https://www.kubero.dev/assets/images/pipeline-list-a693ac0c7dc36ec9fa42100e8908577c.png" alt="Create App Screenshot 1" width="220" style="margin:8px; border-radius:8px;" /></a>
  <a href="https://www.kubero.dev/docs/screenshots" target="_blank"><img src="https://www.kubero.dev/assets/images/app-overview-56c193140fd4f5acd9d8d242da15129b.png" alt="Create App Screenshot 2" width="220" style="margin:8px; border-radius:8px;" /></a>
  <a href="https://www.kubero.dev/docs/screenshots" target="_blank"><img src="https://www.kubero.dev/assets/images/app-vulnerabilities-49af1cf7933071f3cc680ab4737249e2.png" alt="Create App Screenshot 4" width="220" style="margin:8px; border-radius:8px;" /></a>
  <a href="https://www.kubero.dev/docs/screenshots" target="_blank"><img src="https://www.kubero.dev/assets/images/app-metrics-762b0a7f53e9b3f926bc1c2cc8e33fd8.png" alt="Create App Screenshot 3" width="220" style="margin:8px; border-radius:8px;" /></a>
  <a href="https://www.kubero.dev/docs/screenshots" target="_blank"><img src="https://www.kubero.dev/assets/images/pipeline-overview-4de7dcef62bd231f24946ee41f2068a8.png" alt="Create App Screenshot 3" width="220" style="margin:8px; border-radius:8px;" /></a>
  <a href="https://www.kubero.dev/docs/screenshots" target="_blank"><img src="https://www.kubero.dev/assets/images/addons-overview-ce4352793df173c1f4b82e620914952e.png" alt="Create App Screenshot 3" width="220" style="margin:8px; border-radius:8px;" /></a>
</div>

More [Screenshots](https://www.kubero.dev/docs/screenshots) and a full video on
[YouTube](https://www.youtube.com/watch?v=kmqhddc6UlI)

## Features ([DEMO](https://demo.kubero.dev))
- **Docker Deployments** <br> Deploy Docker containers on Kubernetes without needing Helm charts.  
- **App Templates (+160)** <br> Deploy popular applications like WordPress and Grafana with ready-to-use [templates](https://www.kubero.dev/templates/).  
- **CI/CD Pipelines** <br> Create unlimited pipelines with up to 4 separate staging environments for all your applications.  
- **GitOps Review Apps** <br>  Automatically build, start, and clean up review apps when opening or closing pull requests.  
- **Automatic Redeployments** <br> Trigger app redeployments on pushes to branches or tags.  
- **Add-ons Integration** <br> Seamlessly deploy add-ons such as PostgreSQL and Redis alongside your applications.  
- **API & CLI** <br> Integrate seamlessly with existing tools and CI/CD workflows.  
- **Metrics & Monitoring** <br> Access integrated metrics to monitor application health.  
- **Notifications** <br> Get build and deployment updates via Discord, Slack, or Webhooks.  
- **Vulnerability Scans** <br> Perform scheduled or triggered scans for running applications.  
- **Application Logs** <br> View logs directly from the web UI for easy monitoring.  
- **Safe Restarts** <br> Restart applications safely and easily through the web UI.  
- **Web Console** <br> Use the built-in container web console for direct access.  
- **Scheduled Tasks** <br> Easily create and manage cronjobs.  
- **Multi-Tenancy** <br> Support for managing multiple tenants.  
- **Single Sign-On (SSO)** <br> Authenticate securely with GitHub and OAuth2.  
- **Basic Auth** <br> Configure Basic Auth for your applications with ease. 


## Basic Concept 
Kubero is Kubernetes native and runs with two containers on any Kubernetes instance (kubero-ui and Operator). All data is stored on your Kubernetes etcd without an extra database.


![kubero  concept overview](https://raw.githubusercontent.com/kubero-dev/docs/refs/heads/main/docs/img/kubero-concept.png)

## Add-ons

|                                                                                                                   | Addon                     | Maintainer                                                                            | Built in* |
|-------------------------------------------------------------------------------------------------------------------|---------------------------|---------------------------------------------------------------------------------------|-----------|
| <img src="client/public/img/addons/mysql.svg" width="30px" style="vertical-align: middle; margin: 10px">          | MySQL                     | [groundhog2k](https://github.com/groundhog2k/helm-charts/tree/master/charts/mysql)    | ✅        |
| <img src="client/public/img/addons/pgsql.svg" width="30px" style="vertical-align: middle; margin: 10px">          | PostgreSQL                | [groundhog2k](https://github.com/groundhog2k/helm-charts/tree/master/charts/postgres) | ✅        |
| <img src="client/public/img/addons/redis.svg" width="30px" style="vertical-align: middle; margin: 10px">          | Redis                     | [groundhog2k](https://github.com/groundhog2k/helm-charts/tree/master/charts/redis)    | ✅        |
| <img src="client/public/img/addons/mongo.svg" width="30px" style="vertical-align: middle; margin: 10px">          | MongoDB                   | [groundhog2k](https://github.com/groundhog2k/helm-charts/tree/master/charts/mongodb)  | ✅        |
| <img src="client/public/img/addons/RabbitMQ.svg" width="30px" style="vertical-align: middle; margin: 10px">       | RabbitMQ                  | [groundhog2k](https://github.com/groundhog2k/helm-charts/tree/master/charts/rabbitmq) | ✅        |
| <img src="client/public/img/addons/couchdb.svg" width="30px" style="vertical-align: middle; margin: 10px">        | CouchDB                   | [Apache](https://apache.github.io/couchdb-helm)                                       | ✅        |
| <img src="client/public/img/addons/Haraka.png" width="30px" style="vertical-align: middle; margin: 10px">         | Haraka Mail Server        | [Kubero](https://github.com/kubero-dev/haraka-docker)                                 | ✅        |
| <img src="client/public/img/addons/mysql.svg" width="30px" style="vertical-align: middle; margin: 10px">          | MySQL                     | [Bitnami](https://github.com/bitnami/charts/tree/main/bitnami/mysql)                  | ⚠️ (deprecated) |
| <img src="client/public/img/addons/pgsql.svg" width="30px" style="vertical-align: middle; margin: 10px">          | PostgreSQL                | [Bitnami](https://github.com/bitnami/charts/tree/main/bitnami/postgresql)             | ⚠️ (deprecated) |
| <img src="client/public/img/addons/redis.svg" width="30px" style="vertical-align: middle; margin: 10px">          | Redis                     | [Bitnami](https://github.com/bitnami/charts/tree/main/bitnami/redis)                  | ⚠️ (deprecated) |
| <img src="client/public/img/addons/mongo.svg" width="30px" style="vertical-align: middle; margin: 10px">          | MongoDB                   | [Bitnami](https://github.com/bitnami/charts/tree/main/bitnami/mongodb)                | ⚠️ (deprecated) |
| <img src="client/public/img/addons/elasticsearch.svg" width="30px" style="vertical-align: middle; margin: 10px">  | Elasticsearch             | [Bitnami](https://github.com/bitnami/charts/tree/main/bitnami/elasticsearch)          | ⚠️ (deprecated) |
| <img src="client/public/img/addons/kafka.svg" width="30px" style="vertical-align: middle; margin: 10px">          | Kafka                     | [Bitnami](https://github.com/bitnami/charts/tree/main/bitnami/kafka)                  | ⚠️ (deprecated) |
| <img src="client/public/img/addons/memcached.svg" width="30px" style="vertical-align: middle; margin: 10px">      | Memcache                  | [Bitnami](https://github.com/bitnami/charts/tree/main/bitnami/memcached)              | ⚠️ (deprecated) |
| <img src="client/public/img/addons/RabbitMQ.svg" width="30px" style="vertical-align: middle; margin: 10px">       | RabbitMQ                  | [Bitnami](https://github.com/bitnami/charts/tree/main/bitnami/rabbitmq)               | ⚠️ (deprecated) |
| <img src="client/public/img/addons/pgsql.svg" width="30px" style="vertical-align: middle; margin: 10px">          | PostgreSQL HA             | [CloudNative](https://github.com/cloudnative-pg/cloudnative-pg)                       |           |
| <img src="client/public/img/addons/cloudflare.svg" width="30px" style="vertical-align: middle; margin: 10px">     | Cludflare Tunnels         | [Adianth](https://github.com/adyanth/cloudflare-operator)                             |           |
| <img src="client/public/img/addons/Minio.png" width="30px" style="vertical-align: middle; margin: 10px">          | Minio                     | [Minio](https://artifacthub.io/packages/olm/community-operators/minio-operator)       |           |
| <img src="client/public/img/addons/mongo.svg" width="30px" style="vertical-align: middle; margin: 10px">          | Percona MongoDB Cluster   | [Percona](https://artifacthub.io/packages/olm/community-operators/mongodb-operator)   |           |
| <img src="client/public/img/addons/pgsql.svg" width="30px" style="vertical-align: middle; margin: 10px">          | Crunchy Postgres Cluster  | [Crunchy Data](https://artifacthub.io/packages/olm/community-operators/postgresql)    |           |
| <img src="client/public/img/addons/redis.svg" width="30px" style="vertical-align: middle; margin: 10px">          | Redis Cluster             | [Opstree](https://artifacthub.io/packages/olm/community-operators/redis-operator)     |           |
| <img src="client/public/img/addons/CockroachDB.svg" width="30px" style="vertical-align: middle; margin: 10px">    | CockroachDB               | [CockroachDB](https://artifacthub.io/packages/olm/community-operators/cockroachdb)    |           |
| <img src="client/public/img/addons/clickhouse.svg" width="30px" style="vertical-align: middle; margin: 10px">     | Clickhouse                | [Altinity ](https://artifacthub.io/packages/olm/community-operators/clickhouse)       |           |



\* These add-ons are shipped with the Kubero Operator. They are not High Availability (HA) ready but greate to to get you started as fast as possible.

\*\* All Bitnami add-ons are deprecated and will be removed in future releases due to Broadcom's image repository removal. [read more here](https://github.com/bitnami/charts/issues/35164)

## 164+ Application templates (similar to Heroku Buttons)
- WordPress
- Grafana
- Bitwarden
- [Kuma](https://uptime.kuma.pet)
- [Trilium Notes](https://github.com/zadam/trilium)
- ...

Check out the full [list here](https://www.kubero.dev/templates/) or submit your own app! [Read here](https://github.com/kubero-dev/kubero/blob/main/services/) how to do it.

## Quickstart
**1) Download and unpack the <a href="https://github.com/kubero-dev/kubero-cli/releases/latest">Kubero CLI</a>** (MacOS, Linux, Windows)<p>

Binaries (MacOS, Linux)

```bash
$ curl -fsSL get.kubero.dev | bash
```

Brew (MacOS, Linux)

```bash
$ brew tap kubero-dev/kubero
$ brew install kubero-cli
```

**2) Run `kubero install` to install all components on a new or your existing cluster**

You can bring your own existing cluster or create one with the kubero install on one of the following providers:
- GKE
- Scaleway
- DigitalOcean
- Linode
- Kind (local)


## Supported GIT repositories (hosted and self-hosted)
- Gitea / Forgejo
- Gogs
- Github
- Gitlab
- Bitbucket

## Tested languages/frameworks
Basically *everything* that can be packaged in a single container can be deployed by Kubero.

- GoLang (including Hugo, gin-gonic)
- Python (including Flask)
- JavaScript/NodeJS
- PHP (including Laravel)
- Ruby (including Rails)
- Static HTML
- Rust (including Rocket)
- ...

## How GitOps Works 
1. Create a pipeline with the phases you need (review, test, stage, production)
2. (optional) Connect the pipeline to your git repository (GitHub, Bitbucket, GiLab, Gitea, Gogs)
3. Configure your apps with cronjobs and addons

Kubero starts now building your app. Once the build is complete, Kubero will launch the final container and make it accessible via the configured domain. 

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

## Links
- Documentation https://www.kubero.dev/docs/
- Roadmap https://github.com/orgs/kubero-dev/projects/1/views/3

## Community
[![kubero Discord server Banner](https://discordapp.com/api/guilds/1051249947472826408/widget.png?style=banner2)](https://discord.gg/tafRPMWS4r)

## Contributing
All contributions are welcome!
 - Rise an issue/bug/error
 - Open a feature request
 - Discuss ideas in the discussions section or discord
 - Fix typos (I do a lot of them) 
 - Contribute code
 - Write articles

## Supporting this project
Starring this project is a huge motivation. ⭐ Thank you!

[![Stargazers over time](https://starchart.cc/kubero-dev/kubero.svg)](https://starchart.cc/kubero-dev/kubero)


