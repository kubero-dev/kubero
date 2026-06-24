export const podsizes = `
  - name: small
    description: 'Small (CPU: 0.25, Memory: 0.5Gi)'
    default: true
    resources:
      requests:
        memory: 0.5Gi
        cpu: 250m
      limits:
        memory: 1Gi
        cpu: 500m
  - name: medium
    description: 'Medium (CPU: 1, Memory: 2Gi)'
    resources:
      requests:
        memory: 2Gi
        cpu: 1000m
      limits:
        memory: 4Gi
        cpu: 2000m
  - name: large
    description: 'Large (CPU: 2, Memory: 4Gi)'
    active: false
    resources:
      requests:
        memory: 4Gi
        cpu: 2000m
      limits:
        memory: 4Gi
        cpu: 2000m
`;
