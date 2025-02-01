import { Controller, Get } from '@nestjs/common';
import { CommonService } from './common.service';

@Controller({ path: 'api/', version: '1' })
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @Get(['session', 'auth/session'])
  getSession(): string {
    return this.commonService.getSession();
  }
}