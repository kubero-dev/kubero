import { Controller, Get, Query } from '@nestjs/common';
import { KubernetesService } from './kubernetes.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller({ path: 'api/kubernetes', version: '1' })
export class KubernetesController {
  constructor(
    private readonly kubernetesService: KubernetesService
  ) {}

  @ApiOperation({ summary: 'Get the Kubernetes events in a specific namespace' })
  @Get('events')
  async getEvents(@Query('namespace') namespace: string) {
    return this.kubernetesService.getEvents(namespace);
  }

  @ApiOperation({ summary: 'Get the available storage classes' })
  @Get('storageclasses')
  async getStorageClasses() {
    return this.kubernetesService.getStorageClasses();
  }

  @ApiOperation({ summary: 'Get a list of allredy taken domains on this Kubernets cluster' })
  @Get('domains')
  async getDomains() {
    return this.kubernetesService.getDomains();
  }

}
