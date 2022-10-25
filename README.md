<img src="docs/logo/kubero-logo-horizontal.png">

<br>
<br>
Kubero brings the convinience of Heroku/platform.sh to your kubernetes cluster. Your developers should not need to worry about the underlying infrastructure and deployment.
<br>
<br>
Kubero runs as a operator and has a UI, API and soon a CLI.

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
- CLI (Work in progress: https://github.com/kubero-dev/kubero-cli )

## Which languages are supported
Basicly everything that can be shipped in a single container. Kubero uses official images to build and run the apps. But they can be replaced or extended to fit your needs.

So far tested languages:
- GoLang (including Hugo)
- Python
- JavaScript/NodeJS
- PHP ( in Progress )
- ruby
- Static HTML
- rust
- ...

You find the preconfigured buildpacks and examples here :
https://github.com/kubero-dev/buildpacks


## Screenshots
<a href="https://github.com/kubero-dev/kubero/tree/main/docs/screenshots">more Screenshots</a><p>
<img src="docs/screenshots/createapp.png">

# Usage
1. Create a pipeline with all your phases
2. Connect the Pipeline to your git repository ( not required with pre-build image deployment )
3. Create your apps with cronjobs and addons

# Full documentation
https://github.com/kubero-dev/kubero/wiki