import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
//import { ApiTags } from '@nestjs/swagger';
import { ConfigService } from './config.service';
import { ApiBearerAuth, ApiForbiddenResponse, ApiOperation, ApiParam } from '@nestjs/swagger';
import { OKDTO } from 'src/shared/dto/ok.dto';
import { JwtAuthGuard } from 'src/auth/strategies/jwt.guard';

@Controller({ path: 'api/config', version: '1' })
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get('/')
  @UseGuards(JwtAuthGuard)
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

  @Get('/banner')
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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

  @Get('/clusterissuer')
  @UseGuards(JwtAuthGuard)
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

  @Get('/buildpacks')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({ summary: 'List buildpacks' })
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  async getBuildpacks() {
    return this.configService.getBuildpacks();
  }

  @Get('/podsizes')
  @UseGuards(JwtAuthGuard)
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
  async checkComponent(
    @Param('component') component: string,
  ) {
    return this.configService.checkComponent(component);
  }

  @Post('/setup/kubeconfig/validate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  async validateKubeconfig(@Body() body) {
    const kubeconfig = body.kubeconfig;
    const kubeContext = body.context;
    const result = await this.configService.validateKubeconfig(kubeconfig, kubeContext);
    return result;
  }

  @Post('/setup/save')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiForbiddenResponse({
    description: 'Error: Unauthorized',
    type: OKDTO,
    isArray: false,
  })
  async updateRunningConfig(@Body() body) {
    const kubeconfigBase64 = body.KUBECONFIG_BASE64;
    const kubeContext = body.KUBERO_CONTEXT;
    const kuberoNamespace = body.KUBERO_NAMESPACE;
    const KuberoSessionKey = body.KUBERO_SESSION_KEY;
    const kuberoWebhookSecret = body.KUBERO_WEBHOOK_SECRET;

    const kubeconfigDecoded = Buffer.from(kubeconfigBase64, 'base64').toString('utf-8');
    const resultValidation = await this.configService.validateKubeconfig(kubeconfigDecoded, kubeContext);
    if (resultValidation.valid === false) {
        return resultValidation;
    }

    const resultUpdateConfig = await this.configService.updateRunningConfig(kubeconfigBase64, kubeContext, kuberoNamespace, KuberoSessionKey, kuberoWebhookSecret);

    return resultUpdateConfig;
  }
}
