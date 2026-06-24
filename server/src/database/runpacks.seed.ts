export const runpacks = `
  - name: NodeJS
    language: JavaScript
    fetch:
      repository: ghcr.io/kubero-dev/buildpacks/fetch
      tag: v1.2
      readOnlyAppStorage: false
      securityContext:
        runAsUser: 0
        runAsGroup: 0
        runAsNonRoot: false
        readOnlyRootFilesystem: false
        allowPrivilegeEscalation: false
        capabilities:
          add: []
          drop: []
    build:
      repository: node
      tag: latest
      command: "npm install"
      readOnlyAppStorage: false
      securityContext:
        runAsUser: 0
        runAsGroup: 0
        runAsNonRoot: false
        readOnlyRootFilesystem: false
        allowPrivilegeEscalation: false
        capabilities:
          add: []
          drop: []
    run:
      repository: node
      tag: latest
      command: "node index.js"
      readOnlyAppStorage: true
      securityContext:
        runAsUser: 0
        runAsGroup: 0
        runAsNonRoot: false
        readOnlyRootFilesystem: false
        allowPrivilegeEscalation: false
        capabilities:
          add: []
          drop: []
  - name: PHP
    language: PHP
    fetch:
      repository: ghcr.io/kubero-dev/buildpacks/fetch
      tag: v1.2
      readOnlyAppStorage: false
      securityContext:
        runAsUser: 0
        runAsGroup: 0
        runAsNonRoot: false
        readOnlyRootFilesystem: false
        allowPrivilegeEscalation: false
        capabilities:
          add: []
          drop: []
    build:
      repository: composer
      tag: latest
      command: "composer install; chown -R 1000:1000 /app"
      readOnlyAppStorage: false
      securityContext:
        runAsUser: 0
        runAsGroup: 0
        runAsNonRoot: false
        readOnlyRootFilesystem: false
        allowPrivilegeEscalation: false
        capabilities:
          add: []
          drop: []
    run:
      repository: ghcr.io/kubero-dev/buildpacks/php
      tag: "main"
      command: "apache2-foreground"
      readOnlyAppStorage: false
      securityContext:
        runAsUser: 0
        runAsGroup: 0
        runAsNonRoot: false
        allowPrivilegeEscalation: true
        readOnlyRootFilesystem: false
        capabilities:
          add: []
          drop: []
  - name: Python
    language: Python
    fetch:
      repository: ghcr.io/kubero-dev/buildpacks/fetch
      tag: v1.2
      readOnlyAppStorage: false
      securityContext:
        runAsUser: 0
        runAsGroup: 0
        runAsNonRoot: false
        readOnlyRootFilesystem: false
        allowPrivilegeEscalation: false
        capabilities:
          add: []
          drop: []
    build:
      repository: python
      tag: 3.10-buster
      command: "python3 -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt"
      readOnlyAppStorage: false
      securityContext:
        runAsUser: 0
        runAsGroup: 0
        runAsNonRoot: false
        readOnlyRootFilesystem: false
        allowPrivilegeEscalation: false
        capabilities:
          add: []
          drop: []
    run:
      repository: python
      tag: 3.10-buster
      command: ". .venv/bin/activate && python3 main.py"
      readOnlyAppStorage: true
      securityContext:
          runAsUser: 0
          runAsGroup: 0
          runAsNonRoot: false
          readOnlyRootFilesystem: false
          allowPrivilegeEscalation: false
          capabilities:
            add: []
            drop: []
  - name: GoLang
    language: GoLang
    fetch:
      repository: ghcr.io/kubero-dev/buildpacks/fetch
      tag: v1.2
      readOnlyAppStorage: false
      securityContext:
          runAsUser: 0
          runAsGroup: 0
          runAsNonRoot: false
          readOnlyRootFilesystem: false
          allowPrivilegeEscalation: false
          capabilities:
            add: []
            drop: []
    build:
      repository: golang
      tag: alpine
      command: "go mod download && go mod verify && go build -v -o app"
      readOnlyAppStorage: false
      securityContext:
        runAsUser: 0
        runAsGroup: 0
        runAsNonRoot: false
        readOnlyRootFilesystem: true
        allowPrivilegeEscalation: false
        capabilities:
          add: []
          drop: []
    run:
      repository: golang
      tag: alpine
      command: "./app"
      readOnlyAppStorage: true
      securityContext:
        runAsUser: 0
        runAsGroup: 0
        runAsNonRoot: false
        readOnlyRootFilesystem: true
        allowPrivilegeEscalation: false
        capabilities:
          add: []
          drop: []
  - name: Hugo
    language: GoLang
    fetch:
      repository: ghcr.io/kubero-dev/buildpacks/fetch
      tag: v1.2
      readOnlyAppStorage: false
      securityContext:
        runAsUser: 0
        runAsGroup: 0
        runAsNonRoot: false
        readOnlyRootFilesystem: true
        allowPrivilegeEscalation: false
        capabilities:
          add: []
          drop: []
    build:
      repository: klakegg/hugo
      tag: latest
      command: hugo -D
      readOnlyAppStorage: false
      securityContext:
        runAsUser: 0
        runAsGroup: 0
        runAsNonRoot: false
        readOnlyRootFilesystem: true
        allowPrivilegeEscalation: false
        capabilities:
          add: []
          drop: []
    run:
      repository: caddy
      tag: latest
      command: caddy file-server --listen :8080 --root /app/public
      readOnlyAppStorage: true
      securityContext:
        runAsUser: 0
        runAsGroup: 0
        runAsNonRoot: false
        readOnlyRootFilesystem: true
        allowPrivilegeEscalation: false
        capabilities:
          add: []
          drop: []
  - name: Ruby
    language: Ruby
    fetch:
      repository: ghcr.io/kubero-dev/buildpacks/fetch
      tag: v1.2
      readOnlyAppStorage: false
      securityContext:
        runAsUser: 0
        runAsGroup: 0
        runAsNonRoot: false
        readOnlyRootFilesystem: true
        allowPrivilegeEscalation: false
        capabilities:
          add: []
          drop: []
    build:
      repository: ruby
      tag: "2.7"
      command: "export GEM_HOME=/app/bundle; bundle install --jobs=4 --retry=3"
      readOnlyAppStorage: false
      securityContext:
        runAsUser: 0
        runAsGroup: 0
        runAsNonRoot: false
        readOnlyRootFilesystem: false
        allowPrivilegeEscalation: false
        capabilities:
          add: []
          drop: []
    run:
      repository: ruby
      tag: "2.7"
      command: "export GEM_HOME=/app/bundle; bundle exec ruby main.rb"
      readOnlyAppStorage: true
      securityContext:
        runAsUser: 0
        runAsGroup: 0
        runAsNonRoot: false
        readOnlyRootFilesystem: false
        allowPrivilegeEscalation: false
        capabilities:
          add: []
          drop: []
  - name: Static
    language: HTML
    fetch:
      repository: ghcr.io/kubero-dev/buildpacks/fetch
      tag: v1.2
      readOnlyAppStorage: false
      securityContext:
        runAsUser: 0
        runAsGroup: 0
        runAsNonRoot: false
        readOnlyRootFilesystem: false
        allowPrivilegeEscalation: false
        capabilities:
          add: []
          drop: []
    build:
      repository: busybox
      tag: latest
      command: "echo 'Buildpack not required'"
      readOnlyAppStorage: false
      securityContext:
        runAsUser: 0
        runAsGroup: 0
        runAsNonRoot: false
        readOnlyRootFilesystem: false
        allowPrivilegeEscalation: false
        capabilities:
          add: []
          drop: []
    run:
      repository: caddy
      tag: latest
      command: caddy file-server --listen :8080 --root /app
      readOnlyAppStorage: true
      securityContext:
        runAsUser: 0
        runAsGroup: 0
        runAsNonRoot: false
        readOnlyRootFilesystem: false
        allowPrivilegeEscalation: false
        capabilities:
          add: []
          drop: []
`;
