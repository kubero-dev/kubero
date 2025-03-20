import { IApp } from 'src/apps/apps.interface';
import { Template } from './template';

describe('Template', () => {
  it('should be defined', () => {
    expect(new Template({} as IApp)).toBeDefined();
  });
});
