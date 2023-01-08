#Hot to add a new service

create a app yaml from your running service
```bash
mkdir myservice
kubectl get kuberoapps.application.kubero.dev myservice -o yaml > myservice/app.yaml
```

Add a new section to index.yaml
```yaml
- name: myservice # mandatatory, must match the dircetory name
  description: "Describe your service as good as you can with max 300 characters"  # mandatatory
  tags: # up to 5 tags
  - time tracking
  - time management
  source: https://github.com/me/myservice
  website: https://www.myservice.org # mandatatory, must be accessible, might be the same as source
  icon: logo.png  # mandatatory (must be in the same folder as the index.yaml or a URL, square, max 300x300px)
  screenshots: # up to 5 screenshots
  - screenshot1.png
  - screenshot2.png
```