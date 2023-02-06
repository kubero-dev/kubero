# Kubero Services

Services can be added to Kubero by creating a pull request to this repository.

Required qualifications to submit a service:
- Single app container (not counting addons)
- Publicly accessible Docker images
- Maintained and documented (1 commit within the last 6 months)
- Icon/Logo (square, max 300x300px)

## How to add a new services

1) Fork this repository
2) Create a new folder with the name of your service
3) Add a app.yaml and service.yaml
4) Create a pull request

### app.yaml
The app yaml that describes your service technically. You can use the following template to get started.
If you have a running instace of Kubero you can use the CLI to lookup the values for your service.
```yaml
apiVersion: application.kubero.dev/v1alpha1
kind: KuberoApp
metadata:
  name: myservice
spec:
  name: myservice
  deploymentstrategy: docker
  image:
    repository: repository/image
    tag: latest
    containerPort: "8080"
  addons: []
  envVars: []
  cronjobs: []
  extraVolumes: []
  web:
    replicaCount: 1
  worker:
    replicaCount: 0
```

### service.yaml
The service yaml that describes your service to the users and holds all the metadata.
```yaml
name: Myservice # mandatatory
description: "Describe your service as good as you can in one sentence (max 140 characters)"  # mandatatory
tags: # optional, up to 5 tags
- time tracking
- time management
source: https://github.com/me/myservice # optional
website: https://www.myservice.org # mandatatory, must be publicly accessible, might be the same as source
icon: https://mydomain.com/logo.png  # mandatatory (must be a publicly accesible a URL, square, max 300x300px)
screenshots: # optional, up to 5 screenshots
- https://mydomain.com/screenshot1.png
- https://mydomain.com/screenshot2.png
```
