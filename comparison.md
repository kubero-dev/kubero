# competitors to Kubero

- Coolify https://coolify.io/
- Capover https://caprover.com/
- dokku https://dokku.com/
- piku https://github.com/piku/piku
- kubero https://github.com/kubero-dev/kubero
- Cuber
- Acron https://github.com/acorn-io/acorn


|                   | kubero              | coolify            | dokku              | Caprover           | piku               | Cuber              | Acorn              | Heroku Private Space |
|-------------------|:-------------------:|:------------------:|:------------------:|:------------------:|:------------------:|:------------------:|:------------------:|:--------------------:|
| User Interface    | :white_check_mark:  | :white_check_mark: | :x: PRO            | :white_check_mark: | :x:                | :x:                | :x:                | :white_check_mark: |
| Kubernetes        | :white_check_mark:  | :x:                | :white_check_mark: | :x:                | :x:                | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| Scaling           | :white_check_mark:  | :x:                |                    | :x:                | :x:                | :x:                | :x:                | :white_check_mark: |
| Autoscaling       | :white_check_mark:  | :x:                |                    | :x:                | :x:                | :x:                | :x:                | :white_check_mark: |
| Cronjobs          | :white_check_mark:  | :x:                | :white_check_mark: | :x:                | :x:                | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| CLI               | :white_check_mark:* | :x:                | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| API               | :white_check_mark:  | :x:                | :x: PRO            |                    |                    |                    | :white_check_mark: | :white_check_mark: |
| Autodeployment    | :white_check_mark:  | :white_check_mark: |                    |                    | :x:                |
| Pull-Request-Apps | :white_check_mark:  | :white_check_mark: |                    |                    | :x:                | :x:                | :x:                |
| CI/CD             | :white_check_mark:  | :white_check_mark: | :white_check_mark: |                    | :white_check_mark: | :x:                | :x:                |
| Builtin Addons    | :white_check_mark:  | :white_check_mark: | :white_check_mark: | :white_check_mark: |                    |
| Builtin Services  | :x:                 | :white_check_mark: |                    | :white_check_mark: | :x:                |
| Any language      | :white_check_mark:


\* Work in progress




### User interface
The app needs to be easy to use. It should be possible to deploy an app with a view clicks. The user should be able to see the status of the app and the logs.

### Scaling
The app should be able to scale apps horizontally and vertically.

### Auto scaling
The app should be able to auto scale apps horizontally and vertically.

### Cron jobs
The app should be able to run timed cron jobs periodically.

### CLI
The app should have a CLI to manage the running applications.

### API
The app should have an API to manage the running applications.

### CI/CD
The app should be able to deploy apps from git repositories.

### Autodeployment
The app should listen to git pushes on a branch

### Pullrequest Apps
Tha app should automaticly start a new app for every pull request.

### Built in addons
The app should have built in addons like databases, caches, queues, etc.

### Built in Services
The app should have built in services like Wordpress, Nextcloud, Cachet, etc.