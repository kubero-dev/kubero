{!README.md!}

## Goals and Concept
Kubero brings the convenience of Heroku/platform.sh/Vercel.dev to your Kubernetes cluster. Your developers should not need to worry about the underlying infrastructure and deployment. Kubero is a tool that helps you to deploy your application in a Kubernetes cluster.

Kubero is basically a Kubernetes Operator with a UI, API, and CLI.

## CI/CD
Kubero comes with an integrated CI/CD pipeline, which allows you to deploy your App with a simple push into a branch, or even start a new instance based on your Pull-Request.

You can use it to deploy your application in a Kubernetes cluster or deploy your prebuilt container images.

The Pipeline does not build a container image. It only pulls your code and runs the build scripts, which are mounted into your running container. Since the Images are not built, pushed, and pulled from a registry, Kubero is a very fast solution.


## Integrations/Buildpacks

You can run everything that runs in a container. Kubero uses default images to build and run your app. But you can build your own builder if required. And create your custom deployment packs.

## Addons/Plugins
Addons are deployed with Kubernetes Operators which are configurable over the UI.

These are the currently available add-ons:
 - Redis
 - Redis cluster
 - MongoDB
 - Postgres

## Articles and Tutorials
 - [Comparing selfhosted Heroku alternatives](https://dev.to/shoksuno/comparing-selfhosted-heroku-alternatives-249p)
 - [The simplest way to run your own Heroku on Kubernetes](https://dev.to/shoksuno/the-simplest-way-to-run-your-own-heroku-on-kubernetes-3l03)
 - [Replace Heroku with Kubero on Kubernetes (part 1)](https://dev.to/shoksuno/replace-heroku-with-kubero-on-kubernetes-2aoj)
