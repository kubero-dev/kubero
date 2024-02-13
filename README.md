<p align="center">
<img src="docs/logo/kubero-logo-horizontal.png">
</p>
<hr>
<br>

<a href="https://github.com/kubero-dev/kubero/blob/main/LICENSE" target="_blank"><img alt="License" src="https://img.shields.io/github/license/kubero-dev/kubero?style=flat-square&color=blue"></a>
<a href="https://github.com/kubero-dev/kubero/releases/latest" target="_blank"><img alt="GitHub release (latest by date)" src="https://img.shields.io/github/v/release/kubero-dev/kubero?style=flat-square&color=brightgreen"></a>
<a href="https://discord.gg/tafRPMWS4r" target="_blank"><img alt="Discord" src="https://img.shields.io/discord/1051249947472826408?style=flat-square"></a><!--<img alt="GitHub Downloads all releases" src="https://img.shields.io/github/downloads/kubero-dev/kubero-cli/total?style=flat-square&label=cli downloads">-->
<a href="https://github.com/kubero-dev/kubero/releases/latest" target="_blank"><img alt="GitHub (Pre-)Release Date" src="https://img.shields.io/github/release-date-pre/kubero-dev/kubero?style=flat-square"></a>
<a href="https://demo.kubero.dev" target="_blank"><img alt="Demo" src="https://img.shields.io/badge/demo-up-sucess?style=flat-square&color=blue"></a>


<br>
Kubero [pronounced: Kube Hero] is a fully self-hosted Internal Developer Platform (IDP) that brings the workflows of Heroku to your Kubernetes cluster. It enables you to deploy your applications with a few clicks. It has a built-in CI/CD pipeline and supports multiple staging environments.
<br>
<br>

<img src="docs/screenshots/createapp.gif">

More <a href="https://docs.kubero.dev/screenshots" target="_blank">Screenshots</a> and a full video on
<a href="https://www.youtube.com/watch?v=kmqhddc6UlI" target="_blank">YouTube</a><p>

## How it Works ([DEMO](https://demo.kubero.dev))
1. Create a pipeline with the phases you need (review, test, stage, production)
2. Connect the pipeline to your git repository (Github, Bitbucket, Gitlab, Gitea, Gogs)
3. Configure your apps with cronjobs and addons

Kubero will then start an init container that will clone your repository and another init container to build your app. Kubero is now able to start the container and expose it to the internet. You can now access your app via the configured domain.

## Features
- Create unlimited CI pipelines with up to 4 separate **staging environments** for all your applications
- Automatically build, start, and cleanup **review-apps** after opening/closing a pull request
- Automatic **redeployment** of the app based on a push to a branch or tag
- Create scheduled tasks as **cronjobs**
- Deploy well known apps with **templates** [(Wordpress, Grafana, ...)](https://www.kubero.dev/templates)
- Easy deployment of your docker containers on Kubernetes **without helm charts**
- Deploy **add-ons** for your application (PostgreSQL, Redis, [and more ...](https://github.com/kubero-dev/kubero#preconfigured-add-ons))
- Easy access of **application logs** in the UI
- Easy and safe **restart** of the application in the UI
- Triggered or periodic **vulnerability scans** of your running apps
- Comes with an API and CLI to integrate with your existing tools

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

You find the preconfigured buildpacks and examples here:
https://github.com/kubero-dev/buildpacks

## Add-ons

|   | Addon | Maintainer | Built in* |
|---|-------|------------|-----------|
| <img src="client/public/img/addons/MySQL.png" width="30px" style="vertical-align: middle; margin: 10px"> | MySQL | [Bitnami](https://charts.bitnami.com/bitnami) | ✅ |
| <img src="client/public/img/addons/postgresql.png" width="30px" style="vertical-align: middle; margin: 10px"> | PostgreSQL | [Bitnami](https://charts.bitnami.com/bitnami) | ✅ |
| <img src="client/public/img/addons/Redis.png" width="30px" style="vertical-align: middle; margin: 10px"> | Redis | [Bitnami](https://charts.bitnami.com/bitnami) | ✅ |
| <img src="client/public/img/addons/MongoDB.png" width="30px" style="vertical-align: middle; margin: 10px"> | MongoDB | [Bitnami](https://charts.bitnami.com/bitnami) | ✅ |
| <img src="client/public/img/addons/Elasticsearch.png" width="30px" style="vertical-align: middle; margin: 10px"> | Elasticsearch | [Bitnami](https://charts.bitnami.com/bitnami)  | ✅ |
| <img src="client/public/img/addons/Kafka.png" width="30px" style="vertical-align: middle; margin: 10px"> | Kafka | [Bitnami](https://charts.bitnami.com/bitnami)  | ✅ |
| <img src="client/public/img/addons/CouchDB.png" width="30px" style="vertical-align: middle; margin: 10px"> | CouchDB | [Apache](https://apache.github.io/couchdb-helm) | ✅ |
| <img src="client/public/img/addons/Haraka.png" width="30px" style="vertical-align: middle; margin: 10px"> | Haraka Mail Server | [Kubero](https://github.com/kubero-dev/haraka-docker) | ✅ |
| <img src="client/public/img/addons/Memcached.png" width="30px" style="vertical-align: middle; margin: 10px"> | Memcache | [Bitnami](https://charts.bitnami.com/bitnami)  | ✅ |
| <img src="client/public/img/addons/RabbitMQ.png" width="30px" style="vertical-align: middle; margin: 10px"> | RabbitMQ | [Bitnami](https://charts.bitnami.com/bitnami)  | ✅ |
| <img src="client/public/img/addons/cloudflare.svg" width="30px" style="vertical-align: middle; margin: 10px"> | Cludflare Tunnels | [Adianth](https://github.com/adyanth/cloudflare-operator) |  |
| <img src="client/public/img/addons/Minio.png" width="30px" style="vertical-align: middle; margin: 10px"> | Minio | [Minio](https://artifacthub.io/packages/olm/community-operators/minio-operator) |  |
| <img src="client/public/img/addons/MongoDB.png" width="30px" style="vertical-align: middle; margin: 10px"> | Percona MongoDB Cluster | [Percona](https://artifacthub.io/packages/olm/community-operators/mongodb-operator) |  |
| <img src="client/public/img/addons/postgresql.png" width="30px" style="vertical-align: middle; margin: 10px"> | Crunchy Postgres Cluster | [Crunchy Data](https://artifacthub.io/packages/olm/community-operators/postgresql) |  |
| <img src="client/public/img/addons/Redis.png" width="30px" style="vertical-align: middle; margin: 10px"> | Redis Cluster | [Opstree](https://artifacthub.io/packages/olm/community-operators/redis-operator) |  |
| <img src="client/public/img/addons/CockroachDB.svg" width="30px" style="vertical-align: middle; margin: 10px"> | CockroachDB| [CockroachDB](https://artifacthub.io/packages/olm/community-operators/cockroachdb) |  |


\* Ships with the Kubero Operator

#### Planned Add-ons 
- [Aerospike](https://aerospike.com/)
- [TiDB](https://pingcap.com/)
- [ArangoDB](https://www.arangodb.com/)
- [Cassandra](https://cassandra.apache.org/)
- [InfluxDB](https://www.influxdata.com/)
- [MariaDB](https://mariadb.org/)
- [Prometheus](https://prometheus.io/)
- [ImmuDB](https://github.com/unagex/immudb-operator) 

#### Longterm future Add-ons
- [Crossplane](https://crossplane.io/)
- [Neo4j](https://neo4j.com/)
- [Presto](https://prestodb.io/)
- [TimescaleDB](https://www.timescale.com/)
- [Zookeeper](https://zookeeper.apache.org/)
- [RethinkDB](https://rethinkdb.com/)

## 60+ Application templates (similar to Heroku Buttons)
- Wordpress
- Grafana
- Bluesky PDS (Personal Data Server)
- <a href="https://uptime.kuma.pet" target="_blank">Kuma</a>
- <a href="https://github.com/zadam/trilium" target="_blank">Trilium Notes</a>
- ...

Check out the full [list here](https://www.kubero.dev/templates/) or submit your own app! [Read here](https://github.com/kubero-dev/kubero/blob/main/services/) how to do it.

## Basic Concept 
Kubero is Kubernetes native and runs with two containers on any Kubernetes instance.
<br>
<br>

<img src="docs/img/highlevel.png">

## Quickstart
**1) Download and unpack the <a href="https://github.com/kubero-dev/kubero-cli/releases/latest">Kubero CLI</a>** (MacOS, Linux, Windows)<p>

Binaries (MacOS, Linux)
```
curl -fsSL get.kubero.dev | bash
```

 Brew (MacOS, Linux)
```
brew tap kubero-dev/kubero
brew install kubero-cli
```

**2) Run `kubero install` to install all components on a new or your existing cluster**

You can bring your own cluster or create one with the kubero install on one of the following providers:
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
 - Open an issue
 - Add a feature or open a feature request
 - Discuss ideas in the discussions
 - Fix typos
 - Contribute code
 - Write articles

## Supporting this project
Starring this project is a huge motivation. ⭐ Thank you!

[![Stargazers over time](https://starchart.cc/kubero-dev/kubero.svg)](https://starchart.cc/kubero-dev/kubero)
