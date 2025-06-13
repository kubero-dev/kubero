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
    service['prisma'] = mockPrisma;
    service['enabled'] = true;
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
    mockPrisma.audit.create = jest.fn().mockResolvedValue({});
    mockPrisma.audit.count = jest.fn().mockResolvedValue(0);
    mockPrisma.audit.findMany = jest.fn().mockResolvedValue([]);
    mockPrisma.audit.deleteMany = jest.fn().mockResolvedValue({});
    await service.log(entry);
    expect(mockPrisma.audit.create).toHaveBeenCalledWith({
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
    mockPrisma.audit.deleteMany = jest.fn().mockResolvedValue({});
    const logSpy = jest.spyOn(service['logger'], 'log');
    await service.reset();
    expect(mockPrisma.audit.deleteMany).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith('Audit log reset.');
  });

  it('should return 0 for count if not enabled', async () => {
    service['enabled'] = false;
    const count = await service.count();
    expect(count).toBe(0);
  });

  it('should call flush in reset', async () => {
    const flushSpy = jest.spyOn(service as any, 'flush').mockResolvedValue(undefined);
    await service.reset();
    expect(flushSpy).toHaveBeenCalled();
  });

  it('should not log if not enabled', async () => {
    service['enabled'] = false;
    const createSpy = jest.spyOn(mockPrisma.audit, 'create');
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
});