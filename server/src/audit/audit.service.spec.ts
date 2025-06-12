import { AuditService } from './audit.service';
import { AuditEntry } from './audit.interface';

jest.mock('sqlite3', () => {
  const run = jest.fn((...args) => args[args.length - 1]?.(null));
  const all = jest.fn((...args) => args[args.length - 1]?.(null, []));
  const get = jest.fn((...args) =>
    args[args.length - 1]?.(null, { entries: 0 }),
  );
  const close = jest.fn((cb) => cb && cb(null));
  return {
    Database: jest.fn().mockImplementation(() => ({
      run,
      all,
      get,
      close,
    })),
  };
});

jest.mock('fs', () => ({
  existsSync: jest.fn(() => true),
  mkdirSync: jest.fn(),
  unlinkSync: jest.fn(),
}));

describe('AuditService', () => {
  let service: AuditService;

  beforeEach(() => {
    process.env.KUBERO_AUDIT = 'true';
    process.env.KUBERO_AUDIT_DB_PATH = './db';
    process.env.KUBERO_AUDIT_LIMIT = '1000';
    service = new AuditService();
    // Simuliere, dass DB sofort bereit ist
    service['db'] = new (require('sqlite3').Database)();
    service['enabled'] = true;
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.KUBERO_AUDIT;
    delete process.env.KUBERO_AUDIT_DB_PATH;
    delete process.env.KUBERO_AUDIT_LIMIT;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should not enable audit if KUBERO_AUDIT is not "true"', () => {
    process.env.KUBERO_AUDIT = 'false';
    const s = new AuditService();
    expect(s.getAuditEnabled()).toBe(false);
  });

  /*
  it('should call init and createTables', async () => {
    const s = new AuditService();
    s['enabled'] = true;
    s['db'] = new (require('sqlite3').Database)();
    const spy = jest.spyOn(s as any, 'createTables');
    await s.init();
    expect(spy).toHaveBeenCalled();
  });
  */

  it('should log an entry', () => {
    const entry: AuditEntry = {
      user: 'user',
      severity: 'normal',
      action: 'create',
      namespace: 'ns',
      phase: 'ph',
      app: 'app',
      pipeline: 'pipe',
      resource: 'system',
      message: 'msg',
    };
    const spy = jest.spyOn(service['db'], 'run');
    service.log(entry);
    expect(spy).toHaveBeenCalled();
  });

  it('should logDelayed call log after timeout', () => {
    jest.useFakeTimers();
    const entry: AuditEntry = {
      user: 'user',
      severity: 'normal',
      action: 'create',
      namespace: 'ns',
      phase: 'ph',
      app: 'app',
      pipeline: 'pipe',
      resource: 'system',
      message: 'msg',
    };
    const spy = jest.spyOn(service, 'log');
    service.logDelayed(entry, 100);
    jest.runAllTimers();
    expect(spy).toHaveBeenCalledWith(entry);
    jest.useRealTimers();
  });

  it('should get audit entries', async () => {
    const result = await service.get(10);
    expect(result).toHaveProperty('audit');
    expect(result).toHaveProperty('count');
    expect(result).toHaveProperty('limit');
  });

  it('should get filtered audit entries', async () => {
    const result = await service.getFiltered(10, 'foo');
    expect(Array.isArray(result)).toBe(true);
  });

  it('should get app entries', async () => {
    const result = await service.getAppEntries('pipe', 'ph', 'app', 10);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should get phase entries', async () => {
    const result = await service.getPhaseEntries('ph', 10);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should get pipeline entries', async () => {
    const result = await service.getPipelineEntries('pipe', 10);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should flush the audit table', async () => {
    await expect((service as any).flush()).resolves.toBeUndefined();
  });

  it('should close the database', async () => {
    await expect((service as any).close()).resolves.toBeUndefined();
  });

  it('should reset the database', async () => {
    const spyFlush = jest.spyOn(service as any, 'flush');
    const spyClose = jest.spyOn(service as any, 'close');
    await service.reset();
    expect(spyFlush).toHaveBeenCalled();
    expect(spyClose).toHaveBeenCalled();
  });

  it('should call limit', () => {
    const spy = jest.spyOn(service['db'], 'run');
    (service as any).limit(100);
    expect(spy).toHaveBeenCalled();
  });

  it('should count entries', async () => {
    const result = await service.count();
    expect(typeof result).toBe('number');
  });

  it('should return audit enabled state', () => {
    expect(service.getAuditEnabled()).toBe(true);
  });
});
