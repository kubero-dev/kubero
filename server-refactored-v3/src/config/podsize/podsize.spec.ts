import { PodSize } from './podsize';
import { IPodSize } from '../config.interface';

describe('PodSize', () => {
  it('should be defined', () => {
    expect(new PodSize({} as IPodSize)).toBeDefined();
  });
});
