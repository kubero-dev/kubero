<p align="center">
<img src="docs/logo/kubero-logo-horizontal.png">
</p>
<hr>
<br>

![GitHub](https://img.shields.io/github/license/kubero-dev/kubero?style=flat-square&color=brightgreen)
![GitHub release (latest by date)](https://img.shields.io/github/v/release/kubero-dev/kubero?style=flat-square&color=brightgreen)

<br>
Kubero brings the convinience of Heroku to your kubernetes cluster. Your developers should not need to worry about the underlying infrastructure and deployment. It enables you to deploy your applications within some clicks. It also provides a dashboard and CLI to manage your applications.
<br>
<br>
Kubero is Kubernetes native and runs on every Kubernetes.
<br>
<br>

## What can Kubero do for you?
- Create a CI pipeline with up to 4 separate environments for all your applications: review apps -> testing -> stageing -> production
- Build, start and cleanup reviewapps after opening/closing a pull request
- Automatic deployment of the app based on a branch or tag
- Create scheduled tasks (cronjobs)
- Easy deployment of your apps on kubernetes without helm charts
- Deploy addons (PostgreSQL, Redis, more to come)
- Easy access of application logs in the UI
- Easy and safe restart of the application in the UI

## What Kubero won't do for you
- Manage your Kubernetes cluster
- Install and manage your operators
- Give access to your container CLI

## Supported GIT repositories
<img src="docs/screenshots/gitrepositories.png">

## Which languages are supported
Basicly *everything* that can be shipped in a single container. Kubero uses official images to build and run the apps. But they can be replaced or extended to fit your needs.

So far tested languages/frameworks:
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

## Quickstart
1) Download and unpack the <a href="https://github.com/kubero-dev/kubero-cli/releases/latest">Kubero CLI</a><p>
2) Run `kubero install` to install all components on your cluster

## Screenshots
<a href="https://github.com/kubero-dev/kubero/tree/main/docs/screenshots">more Screenshots</a><p>
<img src="docs/screenshots/createapp.gif">

# Usage
1. Create a pipeline with all your phases
2. Connect the Pipeline to your git repository (Github, Bitbucket, Gitlab, Gitea, Gogs)
3. Create your apps with cronjobs and addons

# Full documentation
https://github.com/kubero-dev/kubero/wiki

# Contributing
All contributions are welcome!
 - Open an issue
 - Add a feature or open a feature request
 - Discuss ideas in the discussions
 - Fix typos
 - Contribute code
 - Write articles

## Support
Staring this projects helps a lot. ⭐ Thank you!

[![Stargazers over time](https://starchart.cc/kubero-dev/kubero.svg)](https://starchart.cc/kubero-dev/kubero)