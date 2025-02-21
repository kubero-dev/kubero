import { App } from './app';
import { IApp } from '../apps.interface';

describe('App', () => {
  it('should be defined', () => {
    expect(new App({} as IApp)).toBeDefined();
  });
});
