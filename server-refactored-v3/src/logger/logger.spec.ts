import { CustomConsoleLogger } from './logger';

describe('Logger', () => {
  it('should be defined', () => {
    expect(new CustomConsoleLogger()).toBeDefined();
  });
});
