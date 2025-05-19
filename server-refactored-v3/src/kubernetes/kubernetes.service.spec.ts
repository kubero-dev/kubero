import { KubernetesService } from './kubernetes.service';

describe('Kubectl', () => {
  it('should be defined', () => {
    expect(new KubernetesService()).toBeDefined();
  });
});
