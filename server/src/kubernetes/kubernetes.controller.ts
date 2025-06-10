import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { KubernetesService } from './kubernetes.service';
import {
  ApiOperation,
  ApiOkResponse,
  ApiResponse,
  ApiForbiddenResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  StorageClassDTO,
  ContextDTO,
  GetEventsDTO,
} from './dto/kubernetes.dto';
import { OKDTO } from '../common/dto/ok.dto';
import { JwtAuthGuard } from '../auth/strategies/jwt.guard';

@Controller({ path: 'api/kubernetes', version: '1' })
export class KubernetesController {
  constructor(private readonly kubernetesService: KubernetesService) {}

  @Get('events')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiResponse({
    status: 200,
    description: 'List of available contexts',
    type: GetEventsDTO,
    isArray: true,
  })
  @ApiOperation({
    summary: 'Get the Kubernetes events in a specific namespace',
  })
  async getEvents(@Query('namespace') namespace: string) {
    return this.kubernetesService.getEvents(namespace);
  }

  @Get('storageclasses')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiOkResponse({
    description: 'A List of available storage classes',
    type: StorageClassDTO,
    isArray: true,
  })
  @ApiOperation({ summary: 'Get the available storage classes' })
  async getStorageClasses(): Promise<StorageClassDTO[]> {
    return this.kubernetesService.getStorageClasses();
  }

  @Get('domains')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiOkResponse({
    description: 'Already taken domains',
    type: [String],
    isArray: true,
  })
  @ApiOperation({
    summary: 'Get a list of allredy taken domains on this Kubernets cluster',
  })
  async getDomains(): Promise<string[]> {
    return this.kubernetesService.getDomains();
  }

  @Get('/contexts')
  @UseGuards(JwtAuthGuard)
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiBearerAuth('bearerAuth')
  @ApiOkResponse({
    description: 'A List of available contexts',
    type: ContextDTO,
    isArray: true,
  })
  @ApiOperation({ summary: 'Get available contexts' })
  async getContexts(): Promise<ContextDTO[]> {
    return this.kubernetesService.getContexts();
  }
}
