![](https://raw.githubusercontent.com/kubero-dev/docs/refs/heads/main/static/assets/logo/kubero-logo-horizontal.png)

---

[![ライセンス](https://img.shields.io/github/license/kubero-dev/kubero?style=flat-square&color=blue")](https://github.com/kubero-dev/kubero/blob/main/LICENSE) 
[![GitHub 最新リリース](https://img.shields.io/github/v/release/kubero-dev/kubero?style=flat-square&color=brightgreen)](https://github.com/kubero-dev/kubero/releases/latest)
[![Discord](https://img.shields.io/discord/1051249947472826408?style=flat-square)](https://discord.gg/tafRPMWS4r)
[![GitHub (プレリリース)リリース日](https://img.shields.io/github/release-date-pre/kubero-dev/kubero?style=flat-square)](https://github.com/kubero-dev/kubero/releases/latest)
[![デモ](https://img.shields.io/badge/demo-up-sucess?style=flat-square&color=blue)](https://demo.kubero.dev)

Kubero [発音：Kube Hero] は、開発者が専門知識を必要とせずに Kubernetes 上でアプリケーションをデプロイできる、セルフホスト型 PaaS（Platform as a Service）です。Kubero は 12-factor アプリケーションの原則に従っています。既存のコンテナまたはソースコードに基づいてアプリを実行することができます。

![](https://raw.githubusercontent.com/kubero-dev/docs/refs/heads/main/static/assets/screenshots/createapp.gif)

その他の [スクリーンショット](https://www.kubero.dev/docs/screenshots) や完全な動画は
[YouTube](https://www.youtube.com/watch?v=kmqhddc6UlI) をご覧ください。

## 機能 ([デモ](https://demo.kubero.dev))
- **Docker デプロイ** <br> Helm チャートを必要とせずに Kubernetes 上で Docker コンテナをデプロイします。  
- **アプリテンプレート（160+）** <br> WordPress や Grafana などの人気アプリを、すぐに使える [テンプレート](https://www.kubero.dev/templates/) を使用してデプロイします。  
- **CI/CD パイプライン** <br> すべてのアプリケーションに対して最大 4 つの独立したステージング環境を持つ無制限のパイプラインを作成します。  
- **GitOps レビューアプリ** <br> プルリクエストを開いたり閉じたりするときに、レビューアプリを自動的に構築、起動、クリーンアップします。  
- **自動再デプロイ** <br> ブランチやタグへのプッシュ時にアプリの再デプロイをトリガーします。  
- **アドオン統合** <br> PostgreSQL や Redis などのアドオンをアプリケーションと一緒にシームレスにデプロイします。  
- **API & CLI** <br> 既存のツールや CI/CD ワークフローとシームレスに統合します。  
- **メトリクス & モニタリング** <br> 統合されたメトリクスにアクセスしてアプリケーションの健康状態を監視します。  
- **通知** <br> Discord、Slack、または Webhooks を介してビルドおよびデプロイの更新を取得します。  
- **脆弱性スキャン** <br> 実行中のアプリケーションに対してスケジュールまたはトリガーされたスキャンを実行します。  
- **アプリログ** <br> Web UI から直接ログを表示して簡単に監視します。  
- **安全な再起動** <br> Web UI を介してアプリケーションを安全かつ簡単に再起動します。  
- **Web コンソール** <br> 組み込みのコンテナ Web コンソールを使用して直接アクセスします。  
- **スケジュールタスク** <br> cronjobs を簡単に作成および管理します。  
- **マルチテナンシー** <br> 複数のテナントを管理するためのサポート。  
- **シングルサインオン (SSO)** <br> GitHub や OAuth2 を使用して安全に認証します。  
- **基本認証** <br> アプリケーションの基本認証を簡単に構成します。

## 基本概念 
Kubero は Kubernetes ネイティブであり、任意の Kubernetes インスタンス上で 2 つのコンテナ（kubero-ui と Operator）で動作します。すべてのデータは追加のデータベースなしで Kubernetes etcd に保存されます。

![kubero 概念概要](https://raw.githubusercontent.com/kubero-dev/docs/refs/heads/main/docs/img/kubero-concept.png)

## アドオン

|                                                                                                                   | アドオン                     | メンテナー                                                                            | 内蔵* |
|-------------------------------------------------------------------------------------------------------------------|---------------------------|---------------------------------------------------------------------------------------|-----------|
| <img src="client/public/img/addons/mysql.svg" width="30px" style="vertical-align: middle; margin: 10px">          | MySQL                     | [groundhog2k](https://github.com/groundhog2k/helm-charts/tree/master/charts/mysql)    | ✅        |
| <img src="client/public/img/addons/pgsql.svg" width="30px" style="vertical-align: middle; margin: 10px">          | PostgreSQL                | [groundhog2k](https://github.com/groundhog2k/helm-charts/tree/master/charts/postgres) | ✅        |
| <img src="client/public/img/addons/redis.svg" width="30px" style="vertical-align: middle; margin: 10px">          | Redis                     | [groundhog2k](https://github.com/groundhog2k/helm-charts/tree/master/charts/redis)    | ✅        |
| <img src="client/public/img/addons/mongo.svg" width="30px" style="vertical-align: middle; margin: 10px">          | MongoDB                   | [groundhog2k](https://github.com/groundhog2k/helm-charts/tree/master/charts/mongodb)  | ✅        |
| <img src="client/public/img/addons/RabbitMQ.svg" width="30px" style="vertical-align: middle; margin: 10px">       | RabbitMQ                  | [groundhog2k](https://github.com/groundhog2k/helm-charts/tree/master/charts/rabbitmq) | ✅        |
| <img src="client/public/img/addons/couchdb.svg" width="30px" style="vertical-align: middle; margin: 10px">        | CouchDB                   | [Apache](https://apache.github.io/couchdb-helm)                                       | ✅        |
| <img src="client/public/img/addons/Haraka.png" width="30px" style="vertical-align: middle; margin: 10px">         | Haraka メールサーバー        | [Kubero](https://github.com/kubero-dev/haraka-docker)                                 | ✅        |
| <img src="client/public/img/addons/pgsql.svg" width="30px" style="vertical-align: middle; margin: 10px">          | PostgreSQL HA             | [CloudNative](https://github.com/cloudnative-pg/cloudnative-pg)                       |           |
| <img src="client/public/img/addons/cloudflare.svg" width="30px" style="vertical-align: middle; margin: 10px">     | Cloudflare トンネル         | [Adianth](https://github.com/adyanth/cloudflare-operator)                             |           |
| <img src="client/public/img/addons/Minio.png" width="30px" style="vertical-align: middle; margin: 10px">          | Minio                     | [Minio](https://artifacthub.io/packages/olm/community-operators/minio-operator)       |           |
| <img src="client/public/img/addons/mongo.svg" width="30px" style="vertical-align: middle; margin: 10px">          | Percona MongoDB クラスター   | [Percona](https://artifacthub.io/packages/olm/community-operators/mongodb-operator)   |           |
| <img src="client/public/img/addons/pgsql.svg" width="30px" style="vertical-align: middle; margin: 10px">          | Crunchy Postgres クラスター  | [Crunchy Data](https://artifacthub.io/packages/olm/community-operators/postgresql)    |           |
| <img src="client/public/img/addons/redis.svg" width="30px" style="vertical-align: middle; margin: 10px">          | Redis クラスター             | [Opstree](https://artifacthub.io/packages/olm/community-operators/redis-operator)     |           |
| <img src="client/public/img/addons/CockroachDB.svg" width="30px" style="vertical-align: middle; margin: 10px">    | CockroachDB               | [CockroachDB](https://artifacthub.io/packages/olm/community-operators/cockroachdb)    |           |
| <img src="client/public/img/addons/clickhouse.svg" width="30px" style="vertical-align: middle; margin: 10px">     | Clickhouse                | [Altinity ](https://artifacthub.io/packages/olm/community-operators/clickhouse)       |           |



\* これらのアドオンは Kubero Operator と一緒に提供されます。これらは高可用性 (HA) 対応ではありませんが、できるだけ早く始めるのに最適です。

## 164+ アプリテンプレート（Heroku ボタンに類似）
- WordPress
- Grafana
- Bitwarden
- [Kuma](https://uptime.kuma.pet)
- [Trilium Notes](https://github.com/zadam/trilium)
- ...

完全な [リスト](https://www.kubero.dev/templates/) を確認するか、独自のアプリを提出してください！[こちらを読む](https://github.com/kubero-dev/kubero/blob/main/services/) 方法を確認してください。

## クイックスタート
**1) <a href="https://github.com/kubero-dev/kubero-cli/releases/latest">Kubero CLI</a> をダウンロードして解凍** (MacOS, Linux, Windows)<p>

バイナリ (MacOS, Linux)

```bash
$ curl -fsSL get.kubero.dev | bash
```

Brew (MacOS, Linux)

```bash
$ brew tap kubero-dev/kubero
$ brew install kubero-cli
```

**2) `kubero install` を実行して、新しいまたは既存のクラスターにすべてのコンポーネントをインストール**

既存のクラスターを使用するか、kubero install を使用して以下のプロバイダーのいずれかでクラスターを作成できます：
- GKE
- Scaleway
- DigitalOcean
- Linode
- Kind (ローカル)


## サポートされている GIT リポジトリ（ホスト型およびセルフホスト型）
- Gitea / Forgejo
- Gogs
- Github
- Gitlab
- Bitbucket

## テスト済みの言語/フレームワーク
基本的に *すべて* 単一のコンテナにパッケージ化できるものは Kubero によってデプロイ可能です。

- GoLang (Hugo, gin-gonic を含む)
- Python (Flask を含む)
- JavaScript/NodeJS
- PHP (Laravel を含む)
- Ruby (Rails を含む)
- 静的 HTML
- Rust (Rocket を含む)
- ...

## GitOps の仕組み 
1. 必要なフェーズ（レビュー、テスト、ステージ、プロダクション）を持つパイプラインを作成します。
2. （オプション）パイプラインを git リポジトリ（GitHub, Bitbucket, GiLab, Gitea, Gogs）に接続します。
3. cronjobs とアドオンを使用してアプリを構成します。

Kubero は現在、アプリの構築を開始します。ビルドが完了すると、Kubero は最終コンテナを起動し、構成されたドメインを介してアクセス可能にします。

## 技術スタック

- バックエンド
  - [NestJS](https://nestjs.com/)
  - [TypeScript](https://www.typescriptlang.org/)
  - [Jest](https://jestjs.io/)
- フロントエンド
  - [Vue.js](https://vuejs.org/)
  - [Vuetify](https://vuetifyjs.com/en/)
- CLI
  - [Go](https://golang.org/)
  - [Cobra](https://cobra.dev/)
- オペレーター
  - [Operator SDK](https://sdk.operatorframework.io/)
  - [Helm](https://helm.sh/)
- インフラストラクチャ 
  - [Kubernetes](https://kubernetes.io/)
  - [Kind (開発)](https://kind.sigs.k8s.io/)

## リンク
- ドキュメント https://www.kubero.dev/docs/
- ロードマップ https://github.com/orgs/kubero-dev/projects/1/views/3

## コミュニティ
[![kubero Discord サーバーバナー](https://discordapp.com/api/guilds/1051249947472826408/widget.png?style=banner2)](https://discord.gg/tafRPMWS4r)

## 貢献
すべての貢献を歓迎します！
 - 問題/バグ/エラーを提起する
 - 機能リクエストを開く
 - ディスカッションセクションや Discord でアイデアを議論する
 - タイポを修正する（私はよく間違えます） 
 - コードを貢献する
 - 記事を書く

## このプロジェクトをサポートする
このプロジェクトにスターを付けることは大きなモチベーションです。⭐ ありがとうございます！

[![時間の経過による Stargazers](https://starchart.cc/kubero-dev/kubero.svg)](https://starchart.cc/kubero-dev/kubero)
