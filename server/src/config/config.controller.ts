import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
//import { ApiTags } from '@nestjs/swagger';
import { ConfigService } from './config.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { OKDTO } from '../common/dto/ok.dto';
import { JwtAuthGuard } from '../auth/strategies/jwt.guard';
import { ReadonlyGuard } from '../common/guards/readonly.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';
import { PodSize } from './podsize/podsize';

@Controller({ path: 'api/config', version: '1' })
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get('/')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('config:read', 'config:write')
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: 'Get the Kubero settings' })
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  async getSettings() {
    return this.configService.getSettings();
  }

  @Post('/')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('config:write')
  @UseGuards(ReadonlyGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: 'Update the Kubero settings' })
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  //@ApiBody({ type: OKDTO })
  async updateSettings(@Body() body) {
    return this.configService.updateSettings(body);
  }

  @Get('/banner')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('config:read', 'config:write')
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: 'Get the banner informations' })
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  async getBanner() {
    return this.configService.getBanner();
  }

  @Get('/templates')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('config:read', 'config:write')
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: 'Get the templates settings' })
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  async getTemplates() {
    return this.configService.getTemplateConfig();
  }

  @Get('/registry')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('config:read', 'config:write')
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: 'Get the registry settings' })
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  async getRegistry() {
    return this.configService.getRegistry();
  }

  @Get('/runpacks')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('config:read', 'config:write')
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: 'List runpacks' })
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  async getRunpacks() {
    return this.configService.getRunpacks();
  }

  @Delete('/runpacks/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('config:write')
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: 'Delete a runpack' })
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiParam({ name: 'id', description: 'Runpack ID to delete' })
  async deleteRunpack(@Param('id') id: string) {
    return this.configService.deleteRunpack(id);
  }

  @Post('/runpacks')
  @UseGuards(JwtAuthGuard, PermissionsGuard, ReadonlyGuard)
  @Permissions('config:write')
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: 'Add a new runpack' })
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiBody({
    required: true,
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Runpack name',
        },
        language: {
          type: 'string',
          description: 'Programming language of the runpack',
        },
      },
      // Additional properties for fetch, build, and run phases
    },
  })
  async addRunpack(@Body() body) {
    return this.configService.createRunpack(body);
  }

  @Get('/clusterissuer')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('config:read', 'config:write')
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: 'Get the configured cluster issuer' })
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearerAuth')
  async getClusterIssuer() {
    return this.configService.getClusterIssuer();
  }

  @Get('/podsizes')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('config:read', 'config:write')
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiOperation({ summary: 'List available pod sizes' })
  async getPodSizes() {
    return this.configService.getPodSizes();
  }

  @Post('/podsizes')
  @UseGuards(JwtAuthGuard, PermissionsGuard, ReadonlyGuard)
  @Permissions('config:write')
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiOperation({ summary: 'Add a new pod size' })
  @ApiBody({
    required: true,
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Pod size name',
        },
        description: {
          type: 'string',
          description: 'Description of the pod size',
        },
        cpuLimit: {
          type: 'string',
          description: 'CPU limit for the pod size (e.g., "2")',
        },
        memoryLimit: {
          type: 'string',
          description: 'Memory limit for the pod size (e.g., "4Gi")',
        },
        cpuRequest: {
          type: 'string',
          description: 'CPU request for the pod size (e.g., "1")',
        },
        memoryRequest: {
          type: 'string',
          description: 'Memory request for the pod size (e.g., "2Gi")',
        },
      },
    },
  })
  async addPodSize(@Body() body) {
    const { name, description, resources } = body;
    if (!name || !description || !resources.limits || !resources.requests) {
      throw new Error('Invalid pod size data provided');
    }
    const podsize = new PodSize({
      name: name,
      description: description,
      resources: {
        requests: {
          memory: resources.requests.memory,
          cpu: resources.requests.cpu,
        },
        limits: {
          memory: resources.limits.memory,
          cpu: resources.limits.cpu,
        },
      },
    });
    return this.configService.addPodSize(podsize);
  }

  @Delete('/podsizes/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard, ReadonlyGuard)
  @Permissions('config:write')
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiOperation({ summary: 'Delete a pod size' })
  @ApiParam({ name: 'id', description: 'Pod size ID to delete' })
  async deletePodSize(@Param('id') id: string) {
    if (!id) {
      throw new Error('Pod size ID is required');
    }
    return this.configService.deletePodSize(id);
  }

  @Put('/podsizes/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard, ReadonlyGuard)
  @Permissions('config:write')
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiOperation({ summary: 'Update a pod size' })
  @ApiParam({ name: 'id', description: 'Pod size ID to update' })
  @ApiBody({
    required: true,
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Pod size name',
        },
        description: {
          type: 'string',
          description: 'Description of the pod size',
        },
        cpuLimit: {
          type: 'string',
          description: 'CPU limit for the pod size (e.g., "2")',
        },
        memoryLimit: {
          type: 'string',
          description: 'Memory limit for the pod size (e.g., "4Gi")',
        },
        cpuRequest: {
          type: 'string',
          description: 'CPU request for the pod size (e.g., "1")',
        },
        memoryRequest: {
          type: 'string',
          description: 'Memory request for the pod size (e.g., "2Gi")',
        },
      },
    },
  })
  async updatePodSize(@Param('id') id: string, @Body() body) {
    const { name, description, resources } = body;
    if (!name || !description || !resources.limits || !resources.requests) {
      throw new Error('Invalid pod size data provided');
    }
    const podsize = new PodSize({
      name: name,
      description: description,
      resources: {
        requests: {
          memory: resources.requests.memory,
          cpu: resources.requests.cpu,
        },
        limits: {
          memory: resources.limits.memory,
          cpu: resources.limits.cpu,
        },
      },
    });
    return this.configService.updatePodSize(id, podsize);
  }

  @Get('/setup/check/:component')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiOperation({ summary: 'Check the setup' })
  @ApiParam({ name: 'component', description: 'Component to check' })
  async checkComponent(@Param('component') component: string) {
    return this.configService.checkComponent(component);
  }

  @Post('/setup/kubeconfig/validate')
  @UseGuards(JwtAuthGuard)
  @UseGuards(ReadonlyGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiOperation({ summary: 'Validate the provided kubeconfig' })
  @ApiBody({
    required: true,
    schema: {
      type: 'object',
      properties: {
        kubeconfig: {
          type: 'string',
          description: 'Kubeconfig content as a string',
        },
        context: {
          type: 'string',
          description: 'Kubernetes context to validate',
        },
      },
    },
  })
  async validateKubeconfig(@Body() body) {
    const kubeconfig = body.kubeconfig;
    const kubeContext = body.context;
    const result = await this.configService.validateKubeconfig(
      kubeconfig,
      kubeContext,
    );
    return result;
  }

  @Post('/setup/save')
  @UseGuards(JwtAuthGuard)
  @UseGuards(ReadonlyGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  @ApiOperation({ summary: 'Save the running configuration' })
  @ApiBody({
    required: true,
    schema: {
      type: 'object',
      properties: {
        KUBECONFIG_BASE64: {
          type: 'string',
          description: 'Base64 encoded kubeconfig',
        },
        KUBERO_CONTEXT: {
          type: 'string',
          description: 'Kubernetes context to use',
        },
        KUBERO_NAMESPACE: {
          type: 'string',
          description: 'Namespace for Kubero',
        },
        KUBERO_SESSION_KEY: {
          type: 'string',
          description: 'Session key for Kubero',
        },
        KUBERO_WEBHOOK_SECRET: {
          type: 'string',
          description: 'Webhook secret for Kubero',
        },
      },
    },
  })
  async updateRunningConfig(@Body() body) {
    const kubeconfigBase64 = body.KUBECONFIG_BASE64;
    const kubeContext = body.KUBERO_CONTEXT;
    const kuberoNamespace = body.KUBERO_NAMESPACE;
    const KuberoSessionKey = body.KUBERO_SESSION_KEY;
    const kuberoWebhookSecret = body.KUBERO_WEBHOOK_SECRET;

    const kubeconfigDecoded = Buffer.from(kubeconfigBase64, 'base64').toString(
      'utf-8',
    );
    const resultValidation = await this.configService.validateKubeconfig(
      kubeconfigDecoded,
      kubeContext,
    );
    if (resultValidation.valid === false) {
      return resultValidation;
    }

    const resultUpdateConfig = await this.configService.updateRunningConfig(
      kubeconfigBase64,
      kubeContext,
      kuberoNamespace,
      KuberoSessionKey,
      kuberoWebhookSecret,
    );

    return resultUpdateConfig;
  }
}
