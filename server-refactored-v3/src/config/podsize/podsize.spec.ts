import { PodSize } from './podsize';
import { IPodSize } from '../config.interface';

const mockPodSize: IPodSize = {
  name: 'small',
  description: 'Small pod',
  default: true,
  active: true,
  resources: {
    requests: {
      memory: '256Mi',
      cpu: '250m',
    },
    limits: {
      memory: '512Mi',
      cpu: '500m',
    },
  },
};

describe('PodSize', () => {
  it('should be defined', () => {
    expect(new PodSize(mockPodSize)).toBeDefined();
  });
});