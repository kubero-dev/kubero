import { Module, Global } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { PrismaClient } from '@prisma/client';

@Global()
@Module({
  providers: [AuditService, PrismaClient],
  controllers: [AuditController],
  exports: [AuditService],
})
export class AuditModule {}
