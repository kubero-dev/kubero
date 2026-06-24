export const buildpacksTemplate = `---
# Source: kuberobuild/templates/job-buikdpacks.yaml
apiVersion: batch/v1
kind: Job
metadata:
  labels:
    batch.kubernetes.io/job-name: example-test-20240631-2237
    buildstrategy: buildpacks
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
      labels:
        batch.kubernetes.io/job-name: example-test-20240631-2237
        buildstrategy: buildpacks
        kuberoapp: example
        kuberopipeline: test
        job-name: example-test-20240631-2237
    spec:
      automountServiceAccountToken: true
      securityContext:
        fsGroup: 1000
      containers:
        - name: deploy
          env:
          - name: REPOSITORY
            value: registry-kubero.yourdomain.com/optionalrepositoryowner/pipeline/app
          - name: TAG
            value: "123456"
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
        - command:
          - sh
          - -c
          - chmod -R g+w /app
          image: busybox:latest
          imagePullPolicy: IfNotPresent
          name: permissions
          securityContext:
            readOnlyRootFilesystem: true
          volumeMounts:
          - mountPath: /app
            name: app-storage
          workingDir: /app
        - name: build
          args:
          - '-app=.'
          - registry-kubero.yourdomain.com/optionalrepositoryowner/pipeline/app:mytag-id
          command: ['/cnb/lifecycle/creator']
          # https://github.com/buildpacks/pack/issues/564#issuecomment-943345649
          # https://github.com/buildpacks/spec/blob/platform/v0.13/platform.md#creator
          #command: ['/cnb/lifecycle/creator', '-app=.', '-buildpacks=/cnb/buildpacks', '-platform=/platform', '-run-image=ghcr.io/kubero-dev/run:v1.4.0', '-uid=1000', '-gid=1000', 'kubero-local-dev-0037732.loca.lt/example/exampled:latest']
          #command: ['tail', '-f', '/dev/null']
          image: "paketobuildpacks/builder-jammy-full:latest" #List of Builders : https://paketo.io/docs/reference/builders-reference/
          imagePullPolicy: Always
          resources: {}
          env:
          - name: CNB_PLATFORM_API
            value: "0.13"
          securityContext:
            privileged: true
          terminationMessagePath: /dev/termination-log
          terminationMessagePolicy: File
          volumeMounts:
          - mountPath: /app
            name: app-storage
            readOnly: false
          - mountPath: /home/cnb/.docker
            name: docker-config
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
      - name: docker-config
        secret:
          secretName: kubero-pull-secret
          items:
            - key: .dockerconfigjson
              path: config.json
#      - name: pull-secret
#        secret:
#          defaultMode: 0384
#          secretName: kubero-pull-secret
`;
