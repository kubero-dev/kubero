import { Controller, Get, Query } from '@nestjs/common';
import { KubernetesService } from './kubernetes.service';
import { ApiOperation, ApiOkResponse, ApiResponse } from '@nestjs/swagger';
import { StorageClassDTO, ContextDTO, GetEventsDTO } from './dto/kubernetes.dto';

@Controller({ path: 'api/kubernetes', version: '1' })
export class KubernetesController {
  constructor(
    private readonly kubernetesService: KubernetesService
  ) {}

  @ApiResponse({ 
    status: 200, 
    description: 'List of available contexts',
    type: GetEventsDTO,
    isArray: true
  })
  @ApiOperation({ summary: 'Get the Kubernetes events in a specific namespace' })
  @Get('events')
  async getEvents(@Query('namespace') namespace: string) {
    return this.kubernetesService.getEvents(namespace);
  }

  @ApiOkResponse({
    description: 'A List of available storage classes',
    type: StorageClassDTO,
    isArray: true
  })
  @ApiOperation({ summary: 'Get the available storage classes' })
  @Get('storageclasses')
  async getStorageClasses(): Promise<StorageClassDTO[]> {
    return this.kubernetesService.getStorageClasses();
  }

  @ApiOkResponse({
      description: 'Already taken domains',
      type: [String],
      isArray: true
  })
  @ApiOperation({ summary: 'Get a list of allredy taken domains on this Kubernets cluster' })
  @Get('domains')
  async getDomains(): Promise<string[]> {
    return this.kubernetesService.getDomains();
  }

  @ApiOkResponse({
    description: 'A List of available contexts',
    type: ContextDTO,
    isArray: true
  })
  @ApiOperation({ summary: 'Get available contexts' })
  @Get('/contexts')
  async getContexts(): Promise<ContextDTO[]> {
      return this.kubernetesService.getContexts();
  }
}
