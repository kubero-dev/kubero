
# Deployment

## Deploy your application via UI
1) Create a pipeline with stages and connect it with your git repository
This step will create the Namespaces, and configure the webhooks and deploymentkey in your repository (only if it is owned by you)

![createpipeline](https://user-images.githubusercontent.com/2052196/196880197-1892dcaa-61ee-4389-8385-a8aedd947b8e.gif)

2) Create an app in every stage.

![createapp](https://user-images.githubusercontent.com/2052196/196886376-f6fa18a3-21f2-4980-b9a1-4d9952895cd4.gif)

## Deploy your application with kubectl (Infrastructure as Code)
Your application requires 2 custom resource definitions.

1) Download Pipeline CRD's here: https://github.com/kubero-dev/kubero-operator/blob/main/config/samples/
```
wget https://raw.githubusercontent.com/kubero-dev/kubero-operator/main/config/samples/application_v1alpha1_kuberopipeline.yaml
wget https://raw.githubusercontent.com/kubero-dev/kubero-operator/main/config/samples/application_v1alpha1_kuberoapp.yaml
```

2) Apply your changes with kubectl to create the pipeline
```
kubectl apply -f application_v1alpha1_kuberopipeline.yaml -n kubero
```

3) Apply your change in the namespace of your stage
```
kubectl apply -f application_v1alpha1_kuberopipeline.yaml -n example-production
```
