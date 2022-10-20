<img src="docs/logo/kubero-logo-horizontal.png">

<br>
<br>
Kubero brings the convinience of Heroku/platform.sh to your kubernetes cluster. Your developers should not need to worry about the underlying infrastructure and deployment.
<br>
<br>

![GitHub](https://img.shields.io/github/license/kubero-dev/kubero?style=flat-square)
![GitHub package.json version](https://img.shields.io/github/package-json/v/kubero-dev/kubero?style=flat-square)

## What can Kubero do for you?
- Create a CI pipeline with up to 4 separate environments for all your applications: review apps -> testing -> stageing -> production
- Build, start and cleanup reviewapps after opening/closing a pull request
- Automatic deployment of the app based on a branch or tag
- Create scheduled tasks (cronjobs)
- Easy deployment of your apps on kubernetes without helm charts
- Deploy addons (PostgreSQL, Redis, more to come)
- Easy access of application logs in the UI
- Easy and safe restart of the application in the UI

## What Kubero can't do for you
- Manage your Kubernetes cluster
- Install and manage your operators
- Give access to your container CLI

## Which heroku features are still missing?
- Dataclips
- CLI (Will be added later since kubero has a API)

## Which languages are supported
Basicly everything that can be shipped in a single container. Kubero uses official images to build and run the apps. But they can be replaced or extended to fit your needs.

So far tested languages:
- GoLang (including Hugo)
- Python
- JavaScript/NodeJS
- PHP ( in Progress )
- ruby
- Static HTML

You find buildpack examples and:
https://github.com/kubero-dev/kubero/tree


## Screenshots
<a href="https://github.com/kubero-dev/kubero/tree/main/docs/screenshots">more Screenshots</a><p>
<img width="45%" style="vertical-align: top" src="docs/screenshots/app.png">
<img width="45%" style="vertical-align: top" src="docs/screenshots/appoverview.png">

# Usage
1. Create a pipeline with all your phases
2. Connect the Pipeline to your git repository ( not required with pre-build image deployment )
3. Create your apps with cronjobs and addons

# Full documentation
https://github.com/kubero-dev/kubero/wiki