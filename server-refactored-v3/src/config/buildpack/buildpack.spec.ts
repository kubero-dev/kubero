import { Buildpack } from './buildpack';

describe('Buildpack', () => {
  it('should be defined', () => {
    expect(new Buildpack()).toBeDefined();
  });
});
