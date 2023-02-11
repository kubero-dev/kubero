# Comparison to alternatives

- Kubero [https://www.kubero.dev](https://www.kubero.dev)
- Coolify [https://coolify.io](https://coolify.io/)
- Capover [https://caprover.com](https://caprover.com)
- Dokku [https://dokku.com](https://dokku.com/)
- Piku [https://github.com/piku/piku](https://github.com/piku/piku)
- Cuber [https://cuber.cloud](https://cuber.cloud)
- Acorn [https://www.acorn.io](https://www.acorn.io)
- Qovery [https://www.qovery.com](https://www.qovery.com)
- Tsuru [https://tsuru.io](https://tsuru.io)
- Dyrector [https://dyrector.io](https://dyrector.io)
- Devtron [https://devtron.ai](https://devtron.ai)


|                 | Heroku Private Space | kubero | coolify | dokku | Caprover | piku       | Cuber | Acorn | Qovery | Tsuru | Dyrector | Devtron
|-------------------|:-------------------:|:------:|:-------:|:-----:|:--------:|:----------:|:-----:|:-----:|:------:|:-----:|:--------:|:------:|
| User Interface    | ✅                 | ✅      | ✅      | ❌ PRO| ✅       | ❌         | ❌    | ❌   | ✅     | ❌    | ✅       | ✅     |
| Multi User        | ✅                 | ✅      | ✅      | ✅    | ❌       | N/A         | N/A  | N/A  | ✅     | N/A   | ✅       | ✅     |
| Kubernetes        | N/A                | ✅      | ❌      | plugin| ❌       | ❌         | ✅    | ✅   | ✅     | ✅    | ✅       | ✅     |
| Multi Kubernetes  | N/A                | ✅      | ❌      | ❌    | ❌       | ❌         | ❌    | ❌   |
| Scaling           | ✅                 | ✅      | ❌      | ❌    | ✅       | vertically | ❌    | ❌   |
| Autoscaling       | ✅                 | ✅      | ❌      | ❌    | ❌       | ❌         | ❌    | ❌   |
| Cronjobs          | ✅                 | ✅      | ❌      | ✅    | ❌       | ✅         | ✅    | ✅   | ✅     | ❌    |
| CLI               | ✅                 | ✅      | ❌      | ✅    | ✅       | ✅         | ✅    | ✅   | ✅     | ✅    |
| API               | ✅                 | ✅      | ❌      | ❌ PRO| ✅       | ❌         | ❌    | ✅   | ✅     | ✅    |
| Autodeployment    | ✅                 | ✅      | ✅      | ❌    | ✅       | ❌         | ❌    | ❌   |
| Pull-Request-Apps | ✅                 | ✅      | ✅      | ❌    | ❌       | ❌         | ❌    | ❌   |
| Dataclips         | ✅                 | ❌      | ❌      | ❌    | ❌       | ❌         | ❌    | ❌   |
| CI/CD             | ✅                 | ✅      | ✅      | ✅    | ❌       | ✅         | ❌    | ❌   |
| Builtin Addons    | ✅                 | ✅      | ✅      | plugin| ✅       | ❌         | ❌    | ❌   |
| Builtin Services  | ✅                 | ❌      | ✅      | ❌    | ✅       | ❌         | ❌    | ❌   |
| Any language      | ✅                 | ✅      | ✅      | ✅    | ✅       | ✅         | ✅    | ✅   |

## Criteria
**User interface**
The app needs to be easy to use. It should be possible to deploy an app with a view clicks. The user should be able to see the status of the app and the logs.

**Multi User**
The app should be able to handle multiple users. Each user should be able manage applications.

**Kubernetes**
Kubernetes has benefits like metrics, logmanagement, autoscaling and immutable infrastructure (restarts when the app crashes).

**Multi Kubernetes**
It should be possible to deploy its apps to multiple different Kubernetes clusters.
**Scaling**
The app should be able to scale apps horizontally and vertically.

**Auto scaling**
The app should be able to auto scale apps horizontally and vertically based on the load.

**Cron jobs**
The app should be able to run timed cron jobs periodically.

**CLI**
The app should have a CLI to manage the running applications.

**API**
The app should have an API to manage the running applications.

**CI/CD**
The app should be able to deploy apps from git repositories.

**Autodeployment**
The app should listen to git pushes on a branch (webhooks)

**Pullrequest Apps**
Tha app should automaticly start a new app for every pull request.

**Built in addons**
The app should have built in addons like databases, caches, queues, etc.

**Built in Services**
The app should have built in services like Wordpress, Nextcloud, CachetHQ, etc.

**Any language**
The app should be able to build and run any language.
