import { ReadonlyGuard } from './readonly.guard';
import { ExecutionContext, HttpException } from '@nestjs/common';

describe('ReadonlyGuard', () => {
  let guard: ReadonlyGuard;
  let mockContext: ExecutionContext;

  beforeEach(() => {
    guard = new ReadonlyGuard();
    mockContext = {} as ExecutionContext;
  });

  afterEach(() => {
    delete process.env.KUBERO_READONLY;
  });

  it('should allow access when KUBERO_READONLY is not "true"', () => {
    process.env.KUBERO_READONLY = 'false';
    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should throw HttpException when KUBERO_READONLY is "true"', () => {
    process.env.KUBERO_READONLY = 'true';
    expect(() => guard.canActivate(mockContext)).toThrow(HttpException);
    try {
      guard.canActivate(mockContext);
    } catch (e) {
      expect(e.message).toBe('Kubero is in read-only mode');
      expect(e.getStatus()).toBe(202);
    }
  });
});
