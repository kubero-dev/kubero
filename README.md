<p align="center">
<img src="docs/logo/kubero-logo-horizontal.png">
</p>
<hr>
<br>

![GitHub](https://img.shields.io/github/license/kubero-dev/kubero?style=flat-square&color=brightgreen)
![GitHub release (latest by date)](https://img.shields.io/github/v/release/kubero-dev/kubero?style=flat-square&color=brightgreen)

<br>
Kubero is a Internal Developer Platform (IDP) that brings the convenience of Heroku to your Kubernetes cluster. Your developers should not need to worry about the underlying infrastructure or deployment. It enables you to deploy your applications with a few clicks. It also provides a dashboard and CLI to manage your applications.
<br>
<br>
Kubero is Kubernetes native and runs on any Kubernetes instance.
<br>
<br>

## What can Kubero do for you?
- Create a CI pipeline with up to 4 separate environments for all your applications: review apps -> testing -> stageing -> production
- Build, start and cleanup review-apps after opening/closing a pull request
- Automatic deployment of the app based on a branch or tag
- Create scheduled tasks (cronjobs)
- Easy deployment of your apps on Kubernetes without helm charts
- Deploy addons (PostgreSQL, Redis, more to come)
- Easy access of application logs in the UI
- Easy and safe restart of the application in the UI

## What Kubero won't do for you
- Manage your Kubernetes cluster
- Install and manage your operators
- Give access to your container CLI

## Supported GIT repositories (hosted and self-hosted)
- Gitea
- Forgejo (WIP)
- Gogs
- Github
- Gitlab
- Bitbucket

## Tested languages/frameworks
Basicly *everything* that can be shipped in a single container. Kubero uses official images to build and run the apps. But they can be replaced or extended to fit your needs.

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
2) Run `kubero install` to install all components on an new or your existing cluster

## Usage
<a href="https://github.com/kubero-dev/kubero/tree/main/docs/screenshots">Screenshots</a><p>
<a href="https://www.youtube.com/watch?v=-_XcC_8cpis" target="_blank"><img src="docs/screenshots/youtube-screen.png"></a>

1. Create a pipeline with all your phases
2. Connect the pipeline to your git repository (Github, Bitbucket, Gitlab, Gitea, Gogs)
3. Create your apps with cronjobs and addons

## Documentation
https://github.com/kubero-dev/kubero/wiki

## Roadmap
https://github.com/orgs/kubero-dev/projects/1/views/3

## Community
<a href="https://discord.gg/tafRPMWS4r" target="_blank"><img src="docs/logo/discord.svg" width="200px"></a>

## Contributing
All contributions are welcome!
 - Open an issue
 - Add a feature or open a feature request
 - Discuss ideas in the discussions
 - Fix typos
 - Contribute code
 - Write articles

## Supporting this project
Starring this project is a huge motivation. ⭐ Thank you!

[![Stargazers over time](https://starchart.cc/kubero-dev/kubero.svg)](https://starchart.cc/kubero-dev/kubero)
