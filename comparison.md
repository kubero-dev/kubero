# competitors to Kubero

- Coolify https://coolify.io/
- Capover https://caprover.com/
- dokku https://dokku.com/
- piku https://github.com/piku/piku
- kubero https://github.com/kubero-dev/kubero
- Cuber https://cuber.cloud/
- Acorn https://github.com/acorn-io/acorn


|                   | kubero              | coolify            | dokku              | Caprover           | piku               | Cuber              | Acorn        | Heroku <br>Private Space |
|-------------------|:-------------------:|:------------------:|:------------------:|:------------------:|:------------------:|:------------------:|:------------------:|:------------------:|
| User Interface    | :white_check_mark:  | :white_check_mark: | :x: PRO            | :white_check_mark: | :x:                | :x:                | :x:                | :white_check_mark: |
| Multi User        | :white_check_mark:  | :white_check_mark: | :white_check_mark: | :x:                | N/A                | N/A                | N/A                | :white_check_mark: |
| Kubernetes        | :white_check_mark:  | :x:                | :x:                | :x:                | :x:                | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| Multi Kubernetes  | :white_check_mark:  | :x:                | :x:                | :x:                | :x:                | :x:                | :x:                | N/A                |
| Scaling           | :white_check_mark:  | :x:                | :x:                | :white_check_mark: | vertically         | :x:                | :x:                | :white_check_mark: |
| Autoscaling       | :white_check_mark:  | :x:                | :x:                | :x:                | :x:                | :x:                | :x:                | :white_check_mark: |
| Cronjobs          | :white_check_mark:  | :x:                | :white_check_mark: | :x:                | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| CLI               | :white_check_mark:* | :x:                | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| API               | :white_check_mark:  | :x:                | :x: PRO            | :white_check_mark: | :x:                | :x:                | :white_check_mark: | :white_check_mark: |
| Autodeployment    | :white_check_mark:  | :white_check_mark: | :x:                | :white_check_mark: | :x:                | :x:                | :x:                | :white_check_mark: |
| Pull-Request-Apps | :white_check_mark:  | :white_check_mark: | :x:                | :x:                | :x:                | :x:                | :x:                | :white_check_mark: |
| CI/CD             | :white_check_mark:  | :white_check_mark: | :white_check_mark: | :x:                | :white_check_mark: | :x:                | :x:                | :white_check_mark: |
| Builtin Addons    | :white_check_mark:  | :white_check_mark: | plugin             | :white_check_mark: | :x:                | :x:                | :x:                | :white_check_mark: |
| Builtin Services  | :x:                 | :white_check_mark: | :x:                | :white_check_mark: | :x:                | :x:                | :x:                | :white_check_mark: |
| Any language      | :white_check_mark:  | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: |


\* Work in progress




### User interface
The app needs to be easy to use. It should be possible to deploy an app with a view clicks. The user should be able to see the status of the app and the logs.

### Multi User
The app should be able to handle multiple users. Each user should be able manage applications.

### Kubernetes
Kubernetes has benefits like metrics, logmanagement, autoscaling and immutable infrastructure (restarts when the app crashes).

### Multi Kubernetes
It should be possible to deploy its apps to multiple different Kubernetes clusters.
### Scaling
The app should be able to scale apps horizontally and vertically.

### Auto scaling
The app should be able to auto scale apps horizontally and vertically based on the load.

### Cron jobs
The app should be able to run timed cron jobs periodically.

### CLI
The app should have a CLI to manage the running applications.

### API
The app should have an API to manage the running applications.

### CI/CD
The app should be able to deploy apps from git repositories.

### Autodeployment
The app should listen to git pushes on a branch (webhooks)

### Pullrequest Apps
Tha app should automaticly start a new app for every pull request.

### Built in addons
The app should have built in addons like databases, caches, queues, etc.

### Built in Services
The app should have built in services like Wordpress, Nextcloud, CachetHQ, etc.

### Any language
The app should be able to build and run any language.