import { Kubectl } from './kubernetes.service';

describe('Kubectl', () => {
  it('should be defined', () => {
    expect(new Kubectl()).toBeDefined();
  });
});
