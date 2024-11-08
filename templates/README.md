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
  annotations:
    kubero.dev/template.architecture: '["arm64", "amd64"]' # optional, architecture of the service
    kubero.dev/template.description: Describe your service as good as you can in one sentence (max 140 characters) # mandatatory
    kubero.dev/template.icon: https://avatars.githubusercontent.com/u/64215741?s=200&v=4 # mandatatory (must be a publicly accesible a URL, square, max 300x300px)
    kubero.dev/template.installation: Some installation instructions to get started with your service. 
      This can be a link to your documentation or a quick start guide. Can be markdown. # optional
    kubero.dev/template.links: '["https://docs.mydomain.com", "https://additionallink.com"]' # optional, up to 5 links
    kubero.dev/template.screenshots: '["https://mydomain.com/screenshot1.png" , "https://mydomain.com/screenshot2.png"]' # optional, up to 5 screenshots
    kubero.dev/template.source: https://github.com/me/myservice # mandatatory
    kubero.dev/template.tags: '["project management"]' # optional, up to 5 tags
    kubero.dev/template.title: Myservice # mandatatory
    kubero.dev/template.website: https://mydomain.com/ # mandatatory, must be publicly accessible, might be the same as source
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
