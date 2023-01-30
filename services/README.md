# How to add a new services

1) create a app yaml from your running service
```bash
mkdir myservice
kubectl get kuberoapps.application.kubero.dev myservice -o yaml > myservice/app.yaml
```

2) Add a service.yaml
```yaml
- name: Myservice # mandatatory
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