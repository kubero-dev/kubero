![](https://raw.githubusercontent.com/kubero-dev/docs/refs/heads/main/static/assets/logo/kubero-logo-horizontal.png)

---

[![许可证](https://img.shields.io/github/license/kubero-dev/kubero?style=flat-square&color=blue")](https://github.com/kubero-dev/kubero/blob/main/LICENSE) 
[![GitHub 最新发布版本](https://img.shields.io/github/v/release/kubero-dev/kubero?style=flat-square&color=brightgreen)](https://github.com/kubero-dev/kubero/releases/latest)
[![Discord](https://img.shields.io/discord/1051249947472826408?style=flat-square)](https://discord.gg/tafRPMWS4r)
[![GitHub (预发布)发布日期](https://img.shields.io/github/release-date-pre/kubero-dev/kubero?style=flat-square)](https://github.com/kubero-dev/kubero/releases/latest)
[![演示](https://img.shields.io/badge/demo-up-sucess?style=flat-square&color=blue)](https://demo.kubero.dev)

Kubero [发音：Kube Hero] 是一个自托管的 PaaS（平台即服务），允许任何开发人员无需专业知识即可在 Kubernetes 上部署其应用程序。Kubero 遵循 12-factor 应用程序原则。可以基于现有容器或源代码运行应用程序。

![](https://raw.githubusercontent.com/kubero-dev/docs/refs/heads/main/static/assets/screenshots/createapp.gif)

更多 [截图](https://www.kubero.dev/docs/screenshots) 和完整视频请访问
[YouTube](https://www.youtube.com/watch?v=kmqhddc6UlI)

## 功能 ([演示](https://demo.kubero.dev))
- **Docker 部署** <br> 在 Kubernetes 上部署 Docker 容器，无需 Helm charts。  
- **应用模板（160+）** <br> 使用现成的 [模板](https://www.kubero.dev/templates/) 部署流行的应用程序，如 WordPress 和 Grafana。  
- **CI/CD 流水线** <br> 为所有应用程序创建最多 4 个独立阶段环境的无限流水线。  
- **GitOps 审查应用** <br>  打开或关闭拉取请求时自动构建、启动和清理审查应用。  
- **自动重新部署** <br> 在推送到分支或标签时触发应用重新部署。  
- **附加组件集成** <br> 无缝部署 PostgreSQL 和 Redis 等附加组件与您的应用程序一起。  
- **API 和 CLI** <br> 与现有工具和 CI/CD 工作流无缝集成。  
- **指标和监控** <br> 访问集成指标以监控应用程序健康状况。  
- **通知** <br> 通过 Discord、Slack 或 Webhooks 获取构建和部署更新。  
- **漏洞扫描** <br> 对运行的应用程序执行计划或触发的扫描。  
- **应用日志** <br> 通过 Web UI 直接查看日志，便于监控。  
- **安全重启** <br> 通过 Web UI 安全轻松地重启应用程序。  
- **Web 控制台** <br> 使用内置的容器 Web 控制台直接访问。  
- **计划任务** <br> 轻松创建和管理 cronjobs。  
- **多租户** <br> 支持管理多个租户。  
- **单点登录 (SSO)** <br> 使用 GitHub 和 OAuth2 安全认证。  
- **基本认证** <br> 轻松为您的应用程序配置基本认证。

## 基本概念 
Kubero 是 Kubernetes 原生的，并在任何 Kubernetes 实例上运行两个容器（kubero-ui 和 Operator）。所有数据都存储在您的 Kubernetes etcd 中，无需额外的数据库。

![kubero 概念概览](https://raw.githubusercontent.com/kubero-dev/docs/refs/heads/main/docs/img/kubero-concept.png)

## 附加组件

|                                                                                                                   | 附加组件                     | 维护者                                                                            | 内置* |
|-------------------------------------------------------------------------------------------------------------------|---------------------------|---------------------------------------------------------------------------------------|-----------|
| <img src="client/public/img/addons/mysql.svg" width="30px" style="vertical-align: middle; margin: 10px">          | MySQL                     | [groundhog2k](https://github.com/groundhog2k/helm-charts/tree/master/charts/mysql)    | ✅        |
| <img src="client/public/img/addons/pgsql.svg" width="30px" style="vertical-align: middle; margin: 10px">          | PostgreSQL                | [groundhog2k](https://github.com/groundhog2k/helm-charts/tree/master/charts/postgres) | ✅        |
| <img src="client/public/img/addons/redis.svg" width="30px" style="vertical-align: middle; margin: 10px">          | Redis                     | [groundhog2k](https://github.com/groundhog2k/helm-charts/tree/master/charts/redis)    | ✅        |
| <img src="client/public/img/addons/mongo.svg" width="30px" style="vertical-align: middle; margin: 10px">          | MongoDB                   | [groundhog2k](https://github.com/groundhog2k/helm-charts/tree/master/charts/mongodb)  | ✅        |
| <img src="client/public/img/addons/RabbitMQ.svg" width="30px" style="vertical-align: middle; margin: 10px">       | RabbitMQ                  | [groundhog2k](https://github.com/groundhog2k/helm-charts/tree/master/charts/rabbitmq) | ✅        |
| <img src="client/public/img/addons/couchdb.svg" width="30px" style="vertical-align: middle; margin: 10px">        | CouchDB                   | [Apache](https://apache.github.io/couchdb-helm)                                       | ✅        |
| <img src="client/public/img/addons/Haraka.png" width="30px" style="vertical-align: middle; margin: 10px">         | Haraka 邮件服务器        | [Kubero](https://github.com/kubero-dev/haraka-docker)                                 | ✅        |
| <img src="client/public/img/addons/pgsql.svg" width="30px" style="vertical-align: middle; margin: 10px">          | PostgreSQL HA             | [CloudNative](https://github.com/cloudnative-pg/cloudnative-pg)                       |           |
| <img src="client/public/img/addons/cloudflare.svg" width="30px" style="vertical-align: middle; margin: 10px">     | Cloudflare 隧道         | [Adianth](https://github.com/adyanth/cloudflare-operator)                             |           |
| <img src="client/public/img/addons/Minio.png" width="30px" style="vertical-align: middle; margin: 10px">          | Minio                     | [Minio](https://artifacthub.io/packages/olm/community-operators/minio-operator)       |           |
| <img src="client/public/img/addons/mongo.svg" width="30px" style="vertical-align: middle; margin: 10px">          | Percona MongoDB 集群   | [Percona](https://artifacthub.io/packages/olm/community-operators/mongodb-operator)   |           |
| <img src="client/public/img/addons/pgsql.svg" width="30px" style="vertical-align: middle; margin: 10px">          | Crunchy Postgres 集群  | [Crunchy Data](https://artifacthub.io/packages/olm/community-operators/postgresql)    |           |
| <img src="client/public/img/addons/redis.svg" width="30px" style="vertical-align: middle; margin: 10px">          | Redis 集群             | [Opstree](https://artifacthub.io/packages/olm/community-operators/redis-operator)     |           |
| <img src="client/public/img/addons/CockroachDB.svg" width="30px" style="vertical-align: middle; margin: 10px">    | CockroachDB               | [CockroachDB](https://artifacthub.io/packages/olm/community-operators/cockroachdb)    |           |
| <img src="client/public/img/addons/clickhouse.svg" width="30px" style="vertical-align: middle; margin: 10px">     | Clickhouse                | [Altinity ](https://artifacthub.io/packages/olm/community-operators/clickhouse)       |           |



\* 这些附加组件与 Kubero Operator 一起提供。它们不是高可用性 (HA) 准备好的，但非常适合让您尽快入门。

## 164+ 应用模板（类似于 Heroku 按钮）
- WordPress
- Grafana
- Bitwarden
- [Kuma](https://uptime.kuma.pet)
- [Trilium Notes](https://github.com/zadam/trilium)
- ...

查看完整 [列表](https://www.kubero.dev/templates/) 或提交您自己的应用！[阅读此处](https://github.com/kubero-dev/kubero/blob/main/services/) 了解如何操作。

## 快速开始
**1) 下载并解压 <a href="https://github.com/kubero-dev/kubero-cli/releases/latest">Kubero CLI</a>** (MacOS, Linux, Windows)<p>

二进制文件 (MacOS, Linux)

```bash
$ curl -fsSL get.kubero.dev | bash
```

Brew (MacOS, Linux)

```bash
$ brew tap kubero-dev/kubero
$ brew install kubero-cli
```

**2) 运行 `kubero install` 在新集群或现有集群上安装所有组件**

您可以使用现有集群或通过 kubero install 在以下提供商之一上创建集群：
- GKE
- Scaleway
- DigitalOcean
- Linode
- Kind (本地)


## 支持的 GIT 仓库（托管和自托管）
- Gitea / Forgejo
- Gogs
- Github
- Gitlab
- Bitbucket

## 测试的语言/框架
基本上 *所有* 可以打包成单个容器的内容都可以由 Kubero 部署。

- GoLang (包括 Hugo, gin-gonic)
- Python (包括 Flask)
- JavaScript/NodeJS
- PHP (包括 Laravel)
- Ruby (包括 Rails)
- 静态 HTML
- Rust (包括 Rocket)
- ...

## GitOps 工作原理 
1. 创建包含所需阶段（审查、测试、阶段、生产）的流水线
2. （可选）将流水线连接到您的 git 仓库（GitHub, Bitbucket, GiLab, Gitea, Gogs）
3. 使用 cronjobs 和附加组件配置您的应用程序

Kubero 现在开始构建您的应用程序。一旦构建完成，Kubero 将启动最终容器并通过配置的域名使其可访问。

## 技术栈

- 后端
  - [NestJS](https://nestjs.com/)
  - [TypeScript](https://www.typescriptlang.org/)
  - [Jest](https://jestjs.io/)
- 前端
  - [Vue.js](https://vuejs.org/)
  - [Vuetify](https://vuetifyjs.com/en/)
- CLI
  - [Go](https://golang.org/)
  - [Cobra](https://cobra.dev/)
- Operator
  - [Operator SDK](https://sdk.operatorframework.io/)
  - [Helm](https://helm.sh/)
- 基础设施 
  - [Kubernetes](https://kubernetes.io/)
  - [Kind (开发)](https://kind.sigs.k8s.io/)

## 链接
- 文档 https://www.kubero.dev/docs/
- 路线图 https://github.com/orgs/kubero-dev/projects/1/views/3

## 社区
[![kubero Discord 服务器横幅](https://discordapp.com/api/guilds/1051249947472826408/widget.png?style=banner2)](https://discord.gg/tafRPMWS4r)

## 贡献
欢迎所有贡献！
 - 提出问题/错误/错误
 - 打开功能请求
 - 在讨论部分或 Discord 中讨论想法
 - 修复错别字（我经常犯） 
 - 贡献代码
 - 撰写文章

## 支持此项目
为此项目加星是一个巨大的动力。⭐ 谢谢！

[![随时间推移的 Stargazers](https://starchart.cc/kubero-dev/kubero.svg)](https://starchart.cc/kubero-dev/kubero)
