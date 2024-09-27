![](docs/logo/kubero-logo-horizontal.png)

---

[![License](https://img.shields.io/github/license/kubero-dev/kubero?style=flat-square&color=blue")](https://github.com/kubero-dev/kubero/blob/main/LICENSE) 
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/kubero-dev/kubero?style=flat-square&color=brightgreen)](https://github.com/kubero-dev/kubero/releases/latest)
[![Discord](https://img.shields.io/discord/1051249947472826408?style=flat-square)](https://discord.gg/tafRPMWS4r)
[![GitHub (Pre-)Release Date](https://img.shields.io/github/release-date-pre/kubero-dev/kubero?style=flat-square)](https://github.com/kubero-dev/kubero/releases/latest)
[![Demo](https://img.shields.io/badge/demo-up-sucess?style=flat-square&color=blue)](https://demo.kubero.dev)

Kubero [pronounced: Kube Hero] is a self-hosted PaaS (Platform as a Service) that allows any developer to deploy their application on Kubernetes without specialized knowledge. Kubero follows the principles of 12-factor apps. It is possible to run apps based on existing containers or from source code.

![](docs/screenshots/createapp.gif)

More [Screenshots](https://docs.kubero.dev/screenshots) and a full video on
[YouTube](https://www.youtube.com/watch?v=kmqhddc6UlI)

## How GitOps Works ([DEMO](https://demo.kubero.dev))
1. Create a pipeline with the phases you need (review, test, stage, production)
2. (optional) Connect the pipeline to your git repository (GitHub, Bitbucket, GiLab, Gitea, Gogs)
3. Configure your apps with cronjobs and addons

Kubero starts now building your app. Once the build is complete, Kubero will launch the final container and make it accessible via the configured domain. 

## Features
- Create unlimited CI/CD pipelines with up to 4 separate **staging environments** for all your applications
- Automatically build, start, and cleanup **review-apps** after opening/closing a pull request
- Automatic **redeployment** of the app based on a push to a branch or tag
- Create scheduled tasks as **cronjobs**
- Deploy well known apps with **templates** [(WordPress, Grafana, ...)](https://www.kubero.dev/templates)
- Easy deployment of your docker containers on Kubernetes **without writing helm charts**
- Deploy **add-ons** along your application (PostgreSQL, Redis, [and more ...](https://github.com/kubero-dev/kubero#preconfigured-add-ons))
- Easy access of **application logs** in the web-UI
- Easy and safe **restart** of the application in the web-UI
- Triggered or periodic **vulnerability scans** of your running apps
- Comes with an **API and CLI** to integrate with your existing tools and CI/CD
- Built-in **container web console**
- Build and deployment **Notifications** to Discord/Slack/Webhooks
- Integrated **metrics and monitoring**
- **SSO** with GitHub and Oauth2

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

## Add-ons

|                                                                                                                   | Addon                     | Maintainer                                                                            | Built in* |
|-------------------------------------------------------------------------------------------------------------------|---------------------------|---------------------------------------------------------------------------------------|-----------|
| <img src="client/public/img/addons/mysql.svg" width="30px" style="vertical-align: middle; margin: 10px">          | MySQL                     | [Bitnami](https://github.com/bitnami/charts/tree/main/bitnami/mysql)                  | ✅ |
| <img src="client/public/img/addons/pgsql.svg" width="30px" style="vertical-align: middle; margin: 10px">          | PostgreSQL                | [Bitnami](https://github.com/bitnami/charts/tree/main/bitnami/postgresql)             | ✅ |
| <img src="client/public/img/addons/redis.svg" width="30px" style="vertical-align: middle; margin: 10px">          | Redis                     | [Bitnami](https://github.com/bitnami/charts/tree/main/bitnami/redis)                  | ✅ |
| <img src="client/public/img/addons/mongo.svg" width="30px" style="vertical-align: middle; margin: 10px">          | MongoDB                   | [Bitnami](https://github.com/bitnami/charts/tree/main/bitnami/mongodb)                | ✅ |
| <img src="client/public/img/addons/elasticsearch.svg" width="30px" style="vertical-align: middle; margin: 10px">  | Elasticsearch             | [Bitnami](https://github.com/bitnami/charts/tree/main/bitnami/elasticsearch)          | ✅ |
| <img src="client/public/img/addons/kafka.svg" width="30px" style="vertical-align: middle; margin: 10px">          | Kafka                     | [Bitnami](https://github.com/bitnami/charts/tree/main/bitnami/kafka)                  | ✅ |
| <img src="client/public/img/addons/couchdb.svg" width="30px" style="vertical-align: middle; margin: 10px">        | CouchDB                   | [Apache](https://apache.github.io/couchdb-helm)                                       | ✅ |
| <img src="client/public/img/addons/Haraka.png" width="30px" style="vertical-align: middle; margin: 10px">         | Haraka Mail Server        | [Kubero](https://github.com/kubero-dev/haraka-docker)                                 | ✅ |
| <img src="client/public/img/addons/memcached.svg" width="30px" style="vertical-align: middle; margin: 10px">      | Memcache                  | [Bitnami](https://github.com/bitnami/charts/tree/main/bitnami/memcached)              | ✅ |
| <img src="client/public/img/addons/RabbitMQ.svg" width="30px" style="vertical-align: middle; margin: 10px">       | RabbitMQ                  | [Bitnami](https://github.com/bitnami/charts/tree/main/bitnami/rabbitmq)               | ✅ |
| <img src="client/public/img/addons/cloudflare.svg" width="30px" style="vertical-align: middle; margin: 10px">     | Cludflare Tunnels         | [Adianth](https://github.com/adyanth/cloudflare-operator)                             |    |
| <img src="client/public/img/addons/Minio.png" width="30px" style="vertical-align: middle; margin: 10px">          | Minio                     | [Minio](https://artifacthub.io/packages/olm/community-operators/minio-operator)       |    |
| <img src="client/public/img/addons/mongo.svg" width="30px" style="vertical-align: middle; margin: 10px">          | Percona MongoDB Cluster   | [Percona](https://artifacthub.io/packages/olm/community-operators/mongodb-operator)   |    |
| <img src="client/public/img/addons/pgsql.svg" width="30px" style="vertical-align: middle; margin: 10px">          | Crunchy Postgres Cluster  | [Crunchy Data](https://artifacthub.io/packages/olm/community-operators/postgresql)    |    |
| <img src="client/public/img/addons/redis.svg" width="30px" style="vertical-align: middle; margin: 10px">          | Redis Cluster             | [Opstree](https://artifacthub.io/packages/olm/community-operators/redis-operator)     |    |
| <img src="client/public/img/addons/CockroachDB.svg" width="30px" style="vertical-align: middle; margin: 10px">    | CockroachDB               | [CockroachDB](https://artifacthub.io/packages/olm/community-operators/cockroachdb)    |    |


\* Ships with the Kubero Operator

## 80+ Application templates (similar to Heroku Buttons)
- WordPress
- Grafana
- Bitwarden
- [Kuma](https://uptime.kuma.pet)
- [Trilium Notes](https://github.com/zadam/trilium)
- ...

Check out the full [list here](https://www.kubero.dev/templates/) or submit your own app! [Read here](https://github.com/kubero-dev/kubero/blob/main/services/) how to do it.

## Basic Concept 
Kubero is Kubernetes native and runs with two containers on any Kubernetes instance (kubero-ui and Operator). All data is stored on your Kubernetes etcd without an extra database.







![](docs/img/highlevel.png)

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

## Documentation
https://docs.kubero.dev/

## Roadmap
https://github.com/orgs/kubero-dev/projects/1/views/3

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
