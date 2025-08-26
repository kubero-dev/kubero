import { AuditService } from './audit.service';
import { PrismaClient } from '@prisma/client';
import { AuditEntry } from './audit.interface';

jest.mock('@prisma/client');

describe('AuditService', () => {
  let service: AuditService;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
    (PrismaClient as jest.Mock).mockImplementation(() => mockPrisma);

    process.env.KUBERO_AUDIT = 'true';
    process.env.KUBERO_AUDIT_LIMIT = '10';
    AuditService.prototype.init = jest.fn();
    service = new AuditService();
    service['enabled'] = true;
    service['prisma'] = mockPrisma;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should not enable audit if KUBERO_AUDIT is not true', () => {
    process.env.KUBERO_AUDIT = 'false';
    const s = new AuditService();
    expect(s.getAuditEnabled()).toBe(false);
  });
  /*
  it('init should log audit entry if enabled', async () => {
    const logSpy = jest.spyOn(AuditService.prototype, 'log').mockResolvedValue(undefined);
    service = new AuditService();
    service['enabled'] = true;
    await service.init();
    expect(logSpy).toHaveBeenCalledWith(expect.objectContaining({
      user: 'kubero',
      severity: 'normal',
      action: 'start',
      namespace: '',
      phase: '',
      app: '',
      pipeline: '',
      resource: 'system',
      message: 'server started',
    }));
  });
*/

  it('init should do nothing if not enabled', () => {
    const logSpy = jest.spyOn(service, 'log');
    service['enabled'] = false;
    service.init();
    expect(logSpy).not.toHaveBeenCalled();
  });

  it('should log an entry', async () => {
    const entry: AuditEntry = {
      user: 'test',
      severity: 'normal',
      action: 'create',
      namespace: 'ns',
      phase: 'dev',
      app: 'app',
      pipeline: 'pipe',
      resource: 'system',
      message: 'msg',
    };
    Object.defineProperty(mockPrisma, 'audit', {
      value: {},
      writable: true,
    });
    // create a local spy and assign it to the mock to avoid referencing an unbound method
    const createSpy = jest.fn().mockResolvedValue({});
    mockPrisma.audit.create = createSpy;
    mockPrisma.audit.count = jest.fn().mockResolvedValue(0);
    mockPrisma.audit.findMany = jest.fn().mockResolvedValue([]);
    mockPrisma.audit.deleteMany = jest.fn().mockResolvedValue({});
    await service.log(entry);
    expect(createSpy).toHaveBeenCalledWith({
      data: expect.objectContaining({
        user: 'test',
        severity: 'normal',
        action: 'create',
        namespace: 'ns',
        phase: 'dev',
        app: 'app',
        pipeline: 'pipe',
        resource: 'system',
        message: 'msg',
      }),
    });
  });

  it('should get audit entries', async () => {
    const audits = [
      {
        id: 1,
        timestamp: new Date(),
        user: 'test',
        severity: 'normal',
        action: 'create',
        namespace: 'ns',
        phase: 'dev',
        app: 'app',
        pipeline: 'pipe',
        resource: 'system',
        message: 'msg',
      },
    ];
    mockPrisma.audit.findMany = jest.fn().mockResolvedValue(audits);
    mockPrisma.audit.count = jest.fn().mockResolvedValue(1);

    const result = await service.get(10);
    expect(result.audit).toEqual(audits);
    expect(result.count).toBe(1);
    expect(result.limit).toBe(10);
  });

  it('should reset audit log', async () => {
    // ensure audit object exists and assign a local spy to avoid referencing an unbound method
    Object.defineProperty(mockPrisma, 'audit', {
      value: {},
      writable: true,
    });
    const deleteSpy = jest.fn().mockResolvedValue({});
    mockPrisma.audit.deleteMany = deleteSpy;
    const logSpy = jest.spyOn(service['logger'], 'log');
    await service.reset();
    expect(deleteSpy).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith('Audit log reset.');
  });

  it('should return 0 for count if not enabled', async () => {
    service['enabled'] = false;
    mockPrisma.audit.count = jest.fn().mockResolvedValue(0);

    const count = await service.count();
    expect(count).toBe(0);
  });

  it('should call flush in reset', async () => {
    const flushSpy = jest
      .spyOn(service as any, 'flush')
      .mockResolvedValue(undefined);
    await service.reset();
    expect(flushSpy).toHaveBeenCalled();
  });

  it('should not log if not enabled', async () => {
    service['enabled'] = false;

    const createSpy = jest.fn().mockResolvedValue({});
    mockPrisma.audit.create = createSpy;

    await service.log({
      user: 'test',
      severity: 'normal',
      action: 'create',
      namespace: 'ns',
      phase: 'dev',
      app: 'app',
      pipeline: 'pipe',
      resource: 'system',
      message: 'msg',
    });
    expect(createSpy).not.toHaveBeenCalled();
  });

  it('getFiltered returns filtered entries', async () => {
    const rows: AuditEntry[] = [
      {
        user: 'test',
        severity: 'normal',
        action: 'create',
        namespace: 'ns',
        phase: 'dev',
        app: 'app',
        pipeline: 'pipe',
        resource: 'system',
        message: 'foo',
      },
    ];
    // create local spy and assign to mock to avoid referencing an unbound method
    const findManySpy = jest.fn().mockResolvedValue(rows);
    mockPrisma.audit.findMany = findManySpy;

    const result = await service.getFiltered(10, 'foo');
    expect(findManySpy).toHaveBeenCalledWith({
      where: { message: { contains: 'foo' } },
      orderBy: { timestamp: 'desc' },
      take: 10,
      include: {
        users: {
          select: { username: true },
        },
      },
    });
    expect(result).toEqual(rows);
  });

  it('getFiltered returns [] if disabled', async () => {
    service['enabled'] = false;
    const result = await service.getFiltered(10, 'foo');
    expect(result).toEqual([]);
  });

  it('getAppEntries returns app entries', async () => {
    const rows: AuditEntry[] = [
      {
        user: 'test',
        severity: 'normal',
        action: 'create',
        namespace: 'ns',
        phase: 'dev',
        app: 'app',
        pipeline: 'pipe',
        resource: 'system',
        message: 'foo',
      },
    ];
    // create local spy and assign to mock to avoid referencing an unbound method
    const findManySpy2 = jest.fn().mockResolvedValue(rows);

    mockPrisma.audit.findMany = findManySpy2;
    mockPrisma.audit.count = jest.fn().mockResolvedValue(rows.length);

    const result = await service.getAppEntries('pipe', 'dev', 'app', 5);
    expect(findManySpy2).toHaveBeenCalledWith({
      where: { pipeline: 'pipe', phase: 'dev', app: 'app' },
      orderBy: { timestamp: 'desc' },
      take: 5,
      include: {
        users: {
          select: { username: true },
        },
      },
    });
    expect(result).toEqual({ audit: rows, count: 1, limit: 5 });
  });

  it('getAppEntries returns [] if disabled', async () => {
    service['enabled'] = false;
    const result = await service.getAppEntries('pipe', 'dev', 'app', 5);
    expect(result).toEqual({ audit: [], count: 0, limit: 5 });
  });
});
