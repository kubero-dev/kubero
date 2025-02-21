import { KuberoConfig } from './kubero-config';
import { IKuberoConfig} from '../config.interface';

describe('KuberoConfig', () => {
  it('should be defined', () => {
    expect(new KuberoConfig( {} as IKuberoConfig)).toBeDefined();
  });
});
