export const nixpacksTemplate = `---
# Source: kuberobuild/templates/job-nixpack.yaml
apiVersion: batch/v1
kind: Job
metadata:
  generation: 1
  labels:
    batch.kubernetes.io/job-name: example-test-20240631-2237
    buildstrategy: nixpacks
    kuberoapp: example
    kuberopipeline: test
    job-name: example-test-20240631-2237
  name: example-test-20240631-2237
spec:
  ttlSecondsAfterFinished: 31536000
  backoffLimit: 0 # 0 means do not retry
  completionMode: NonIndexed
  completions: 1
  manualSelector: false
  parallelism: 1
  podReplacementPolicy: TerminatingOrFailed
  suspend: false
  template:
    metadata:
      creationTimestamp: null
      labels:
        batch.kubernetes.io/job-name: example-test-20240631-2237
        buildstrategy: nixpacks
        kuberoapp: example
        kuberopipeline: test
        job-name: example-test-20240631-2237
    spec:
      automountServiceAccountToken: true
      securityContext:
        fsGroup: 1000
      containers:
        - env:
          - name: REPOSITORY
            value: registry-kubero.yourdomain.com/optionalrepositoryowner/pipeline/app
          - name: TAG
            value: 123456
          - name: APP
            value: example
          - name: PATCH_JSON
            value: '{"spec":{"image":{"repository":"$REPOSITORY","tag": "$TAG"}}}'
          command:
          - sh
          - -c
          - 'kubectl patch kuberoapps $APP --type=merge -p "$PATCH_JSON"'
          image: bitnami/kubectl:latest
          imagePullPolicy: Always
          name: deploy
          resources: {}
          terminationMessagePath: /dev/termination-log
          terminationMessagePolicy: File
      initContainers:
        - name: fetch
          env:
          - name: GIT_REPOSITORY
            value: git@github.com:kubero-dev/template-nodeapp.git
          - name: GIT_REF
            value: main
          - name: KUBERO_BUILDPACK_DEFAULT_RUN_CMD
            value: "exit 0"
          - name: KUBERO_BUILDPACK_DEFAULT_BUILD_CMD
            value: "exit 0"
          image: "ghcr.io/kubero-dev/fetch:latest"
          imagePullPolicy: Always
          resources: {}
          securityContext:
            readOnlyRootFilesystem: false
          terminationMessagePath: /dev/termination-log
          terminationMessagePolicy: File
          volumeMounts:
          - mountPath: /home/kubero/.ssh-mounted
            name: deployment-keys
            readOnly: true
          - mountPath: /app
            name: app-storage
          workingDir: /app
        - name: build
          command:
          - sh
          - -c
          - nixpacks build . -o .
          image: "ghcr.io/kubero-dev/build:latest"
          imagePullPolicy: Always
          resources: {}
          securityContext:
            privileged: false
          terminationMessagePath: /dev/termination-log
          terminationMessagePolicy: File
          volumeMounts:
          - mountPath: /app
            name: app-storage
          workingDir: /app
        - name: push
          command:
          - sh
          - -c
          - |-
            buildah build -f $BUILDAH_DOCKERFILE_PATH --isolation chroot -t $BUILD_IMAGE .
            buildah push --tls-verify=false $BUILD_IMAGE
          env:
          - name: REGISTRY_AUTH_FILE
            value: /etc/buildah/auth/.dockerconfigjson
          - name: BUILD_IMAGE
            value: registry-kubero.yourdomain.com/optionalrepositoryowner/pipeline/app:123456
          - name: BUILDAH_DOCKERFILE_PATH
            value: /app/Dockerfile
          image: "quay.io/containers/buildah:v1.35"
          imagePullPolicy: IfNotPresent
          resources: {}
          securityContext:
            privileged: true
          terminationMessagePath: /dev/termination-log
          terminationMessagePolicy: File
          volumeMounts:
          - mountPath: /app
            name: app-storage
            readOnly: true
          - mountPath: /etc/buildah/auth
            name: pull-secret
            readOnly: true
          workingDir: /app
      restartPolicy: Never
      schedulerName: default-scheduler
      serviceAccount: example-kuberoapp
      serviceAccountName: example-kuberoapp
      terminationGracePeriodSeconds: 30
      volumes:
      - name: deployment-keys
        secret:
#          defaultMode: 420
          secretName: deployment-keys
      - emptyDir: {}
        name: app-storage
      - name: pull-secret
        secret:
          defaultMode: 384
          secretName: kubero-pull-secret
`;
