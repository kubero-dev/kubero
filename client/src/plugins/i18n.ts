import { createI18n } from 'vue-i18n'
import { en, de, ja } from 'vuetify/locale'

export default createI18n({
  legacy: false,
  locale: 'de',
  fallbackLocale: 'en',
  messages: {
    en: {
      navigation: {
        pipelines: 'Pipelines',
        templates: 'Templates',
        activity: 'Activity',
        addOns: 'Add-Ons',
        accounts: 'Accounts',
        settings: 'Settings',
        logout: 'Logout',
        theme: 'Dark/Light Mode',
        documentation: 'Documentation',
      },
      global: {
        name: "Name",
        value: "Value",
        repository: "Repository",
      },
      pipeline: {
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
          },
          help: {
            gitrepo: 'When connected, webhooks and deployment keys are stored in the repository. This means that the apps configured in this project can be automatically redeployed with a \'git push\' and opening a PR starts a new instance in the "review" phase.',
          },
        },
      },
      app: {
        nav: {
          overview: 'Overview',
          builds: 'Builds',
          metrics: 'Metrics',
          logs: 'Logs',
          events: 'Events',
          vulnerabilities: 'Vulnerabilities',
        },
        actions: {
          name: 'Actions',
          edit: 'Edit',
          openApp: 'Open App',
          restart: 'Restart',
          openConsole: 'Open Console',
          downloadTemplate: 'Download Template',
          delete: 'Delete',
        }
      },
      $vuetify: {
        ...en,
      },
    },
    ja: {
      pipeline: {
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
          },
        },
      },
      $vuetify: {
        ...ja,
      },
    },
    de: {
      global: {
        name: "Name",
        value: "Wert",
        repository: "Repository",
      },
      navigation: {
        pipelines: 'Pipelines',
        templates: 'Templates',
        activity: 'Aktivitäten',
        addOns: 'Add-Ons',
        accounts: 'Accounts',
        settings: 'Einstellungen',
        logout: 'Logout',
        theme: 'Hell/Dunkel Modus',
        documentation: 'Dokumentation',
      },
      pipeline: {
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
            enableBuilds: 'Pipeline zum Bauen aus Quellcode aktivieren',
            cluster: 'Cluster',
            clusterContext: 'Cluster Kontext',
            baseDomain: 'Basis-Domain',
          },
          title:{
            continuousDeployment: 'Kontinuierliches Deployment',
            environments: 'Umgebungen',
          },
          help: {
            gitrepo: 'Beim Verbinden werden Webhooks und Deployment-Schlüssel im Repository gespeichert. Das bedeutet, dass die in diesem Projekt konfigurierten Apps automatisch mit einem \'git push\' neu bereitgestellt werden können und das Öffnen eines PR eine neue Instanz in der "Review"-Phase startet.',
          },
        },
      },
      app: {
        nav: {
          overview: 'Übersicht',
          builds: 'Builds',
          metrics: 'Metriken',
          logs: 'Logs',
          events: 'Events',
          vulnerabilities: 'Sicherheitslücken',
        },
        actions: {
          name: 'Aktionen',
          edit: 'Bearbeiten',
          openApp: 'App öffnen',
          restart: 'Neustart',
          openConsole: 'Terminal öffnen',
          downloadTemplate: 'Template herunterladen',
          delete: 'Löschen',
        }
      },
      $vuetify: {
        ...de,
      },
    }
  }
})