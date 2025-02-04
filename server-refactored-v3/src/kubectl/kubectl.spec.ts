import { Kubectl } from './kubectl';

describe('Kubectl', () => {
  it('should be defined', () => {
    expect(new Kubectl()).toBeDefined();
  });
});
