import { Body, Controller, Get, Param, Post } from '@nestjs/common';
//import { ApiTags } from '@nestjs/swagger';
import { ConfigService } from './config.service';
import { ApiOperation, ApiParam } from '@nestjs/swagger';

@Controller({ path: 'api/config', version: '1' })
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @ApiOperation({ summary: 'Get the Kubero settings' })
  @Get('/')
  async getSettings() {
    return this.configService.getSettings();
  }

  @ApiOperation({ summary: 'Get the banner informations' })
  @Get('/banner')
  async getBanner() {
    return this.configService.getBanner();
  }

  @ApiOperation({ summary: 'Get the templates settings' })
  @Get('/templates')
  async getTemplates() {
    return this.configService.getTemplateConfig();
  }

  @ApiOperation({ summary: 'Get the registry settings' })
  @Get('/registry')
  async getRegistry() {
    return this.configService.getRegistry();
  }

  @ApiOperation({ summary: 'List runpacks' })
  @Get('/runpacks')
  async getRunpacks() {
    return this.configService.getRunpacks();
  }

  @ApiOperation({ summary: 'Get the configured cluster issuer' })
  @Get('/clusterissuer')
  async getClusterIssuer() {
    return this.configService.getClusterIssuer();
  }

  @ApiOperation({ summary: 'List buildpacks' })
  @Get('/buildpacks')
  async getBuildpacks() {
    return this.configService.getBuildpacks();
  }

  @ApiOperation({ summary: 'List available pod sizes' })
  @Get('/podsizes')
  async getPodSizes() {
    return this.configService.getPodSizes();
  }
  @Get('/setup/check/:component')
  @ApiOperation({ summary: 'Check the setup' })
  @ApiParam({ name: 'component', description: 'Component to check' })
  async checkComponent(
    @Param('component') component: string,
  ) {
    return this.configService.checkComponent(component);
  }

  @Post('/setup/kubeconfig/validate')
  async validateKubeconfig(@Body() body) {
    const kubeconfig = body.kubeconfig;
    const kubeContext = body.context;
    const result = await this.configService.validateKubeconfig(kubeconfig, kubeContext);
    return result;
  }

  @Post('/setup/save')
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
