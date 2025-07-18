import { createI18n } from 'vue-i18n'

export default createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: {
      pipeline: {
        name: 'Pipeline',
        dashboard: 'Dashboard',
        buttons: {
          new: 'New Pipeline',
          edit: 'Edit Pipeline',
          delete: 'Delete Pipeline',
          create: 'Create Pipeline',
          update: 'Update Pipeline',
          connect: 'Connect',
          disconnect: 'Disconnect',
          reconnect: 'Reconnect',
        },
        form: {
          label: {
            name: 'Name',
            fqdnDomain: 'FQDN Domain',
            teamAccess: 'Team Access',
            enableBuilds: 'Enable Pipeline to build from Source',
          },
          title:{
            continuousDeployment: 'Continuous Deployment',
            environments: 'Environments',
          }
        },
      },
    },
    ja: {
      pipeline: {
        name: 'パイプライン',
        dashboard: 'ダッシュボード',
        buttons: {
          new: '新しいパイプライン',
          edit: 'パイプラインを編集',
          delete: 'パイプラインを削除',
          create: 'パイプラインを作成',
          update: 'パイプラインを更新',
          connect: '接続',
          disconnect: '切断',
          reconnect: '再接続',
        },
        form: {
          label: {
            name: '名前',
            fqdnDomain: 'FQDNドメイン',
            teamAccess: 'チームアクセス',
            enableBuilds: 'ソースからのビルドを有効にする',
          },
          title:{
            continuousDeployment: '継続的デプロイメント',
            environments: '環境',
          }
        },
      },
    },
    de: {
      pipeline: {
        name: 'Pipeline',
        dashboard: 'Dashboard',
        buttons: {
          new: 'Neue Pipeline',
          edit: 'Pipeline bearbeiten',
          delete: 'Pipeline löschen',
          create: 'Pipeline erstellen',
          update: 'Pipeline aktualisieren',
          connect: 'Verbinden',
          disconnect: 'Trennen',
          reconnect: 'Wieder verbinden',
        },
        form: {
          label: {
            name: 'Name',
            fqdnDomain: 'FQDN-Domain',
            teamAccess: 'Teamzugriff',
            enableBuilds: 'Pipeline zum Erstellen aus Quelle aktivieren',
          },
          title:{
            continuousDeployment: 'Kontinuierliches Deployment',
            environments: 'Umgebungen',
          }
        },
      },
    }
  }
})