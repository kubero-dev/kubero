import { Injectable } from '@nestjs/common';
import { AuditEntry } from './audit.interface';
import { Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class AuditService {
  private logmaxbackups: number = 1000;
  private enabled: boolean = true;
  private readonly logger = new Logger(AuditService.name);
  private readonly prisma = new PrismaClient();

  constructor() {
    this.logmaxbackups = process.env.KUBERO_AUDIT_LIMIT
      ? parseInt(process.env.KUBERO_AUDIT_LIMIT)
      : 1000;

    if (process.env.KUBERO_AUDIT !== 'true') {
      this.enabled = false;
      Logger.log('⏸️ Audit logging not enabled', 'Feature');
      return;
    } else {
      Logger.log('✅ Audit logging enabled', 'Feature');
    }
    this.init();
  }

  public init() {
    if (!this.enabled) {
      return;
    }
    const auditEntry: AuditEntry = {
      user: '1',
      severity: 'normal',
      action: 'start',
      namespace: '',
      phase: '',
      app: '',
      pipeline: '',
      resource: 'system',
      message: 'server started',
    };

    this.logDelayed(auditEntry, 5000);
  }

  public logDelayed(entry: AuditEntry, delay: number = 1000) {
    setTimeout(() => {
      this.log(entry);
    }, delay);
  }

  public async log(entry: AuditEntry) {
    if (!this.enabled) {
      return;
    }
    try {
      if (entry.user === '' || entry.user === null) {
        this.logger.debug(
          'Audit log entry without user. Defaulting to system user.',
        );
        entry.user = '1'; // Default to system user if not provided
      }
      await this.prisma.audit.create({
        data: {
          user: entry.user,
          severity: entry.severity || 'normal',
          action: entry.action,
          namespace: entry.namespace,
          phase: entry.phase,
          app: entry.app,
          pipeline: entry.pipeline,
          resource: entry.resource,
          message: entry.message,
        },
      });
      await this.limit(this.logmaxbackups);
    } catch (err) {
      this.logger.error(err);
    }
  }

  public async get(
    limit: number = 100,
  ): Promise<{ audit: AuditEntry[]; count: number; limit: number }> {
    if (!this.enabled) {
      return { audit: [], count: 0, limit: limit };
    }
    const audit = await this.prisma.audit.findMany({
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: {
        users: {
          select: { username: true },
        },
      },
    });
    const count = await this.prisma.audit.count();
    return { audit, count, limit };
  }

  public async getFiltered(
    limit: number = 100,
    filter: string = '',
  ): Promise<AuditEntry[]> {
    if (!this.enabled) {
      return [];
    }
    return this.prisma.audit.findMany({
      where: {
        message: { contains: filter },
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: {
        users: {
          select: { username: true },
        },
      },
    });
  }

  public async getAppEntries(
    pipeline: string,
    phase: string,
    app: string,
    limit: number = 100,
  ): Promise<{ audit: AuditEntry[]; count: number; limit: number }> {
    if (!this.enabled) {
      return { audit: [], count: 0, limit: limit };
    }
    const audit = await this.prisma.audit.findMany({
      where: { pipeline, phase, app },
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: {
        users: {
          select: { username: true },
        },
      },
    });
    const count = await this.prisma.audit.count({
      where: { pipeline, phase, app },
    });
    return { audit, count, limit };
  }

  private async flush(): Promise<void> {
    await this.prisma.audit.deleteMany({});
  }

  public async reset(): Promise<void> {
    if (!this.enabled) {
      return;
    }
    await this.flush();
    this.logger.log('Audit log reset.');
  }

  // remove the oldest entries from database if the limit is reached
  private async limit(limit: number = 1000) {
    const count = await this.prisma.audit.count();
    if (count > limit) {
      const toDelete = count - limit;
      const oldest = await this.prisma.audit.findMany({
        orderBy: { timestamp: 'asc' },
        take: toDelete,
        select: { id: true },
      });
      await this.prisma.audit.deleteMany({
        where: { id: { in: oldest.map((e) => e.id) } },
      });
    }
  }

  public async count(): Promise<number> {
    if (!this.enabled) {
      return 0;
    }
    return this.prisma.audit.count();
  }

  public getAuditEnabled(): boolean {
    return this.enabled;
  }
}
