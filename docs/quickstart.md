
# Quickstart
1) Download and unpack the <a href="https://github.com/kubero-dev/kubero-cli/releases/latest">Kubero CLI</a><p>
2) Run `kubero install` and follow the instructions


It is possible to install every component separately. with the "-c" flag. For example:
```bash
kubero install -c kubero-operator
```

List of all components:
- kubernetes
- olm
- ingress
- metrics
- certmanager
- kubero-operator
- kubero-ui
- all (default, runs all components in the best order)
