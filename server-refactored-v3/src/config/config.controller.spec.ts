import { Test, TestingModule } from '@nestjs/testing';
import { ConfigController } from './config.controller';
import { ConfigService } from './config.service';

describe('ConfigController', () => {
  let controller: ConfigController;
  let service: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    service = {
      getSettings: jest.fn().mockResolvedValue('settings'),
      updateSettings: jest.fn().mockResolvedValue('updated'),
      getBanner: jest.fn().mockResolvedValue('banner'),
      getTemplateConfig: jest.fn().mockResolvedValue('templates'),
      getRegistry: jest.fn().mockResolvedValue('registry'),
      getRunpacks: jest.fn().mockResolvedValue('runpacks'),
      getClusterIssuer: jest.fn().mockResolvedValue('issuer'),
      getPodSizes: jest.fn().mockResolvedValue('pods'),
      checkComponent: jest.fn().mockResolvedValue('checked'),
      validateKubeconfig: jest.fn().mockResolvedValue({ valid: true }),
      updateRunningConfig: jest.fn().mockResolvedValue('updatedConfig'),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConfigController],
      providers: [{ provide: ConfigService, useValue: service }],
    }).compile();

    controller = module.get<ConfigController>(ConfigController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get settings', async () => {
    await expect(controller.getSettings()).resolves.toBe('settings');
    expect(service.getSettings).toHaveBeenCalled();
  });

  it('should update settings', async () => {
    await expect(controller.updateSettings({ foo: 'bar' })).resolves.toBe(
      'updated',
    );
    expect(service.updateSettings).toHaveBeenCalledWith({ foo: 'bar' });
  });

  it('should get banner', async () => {
    await expect(controller.getBanner()).resolves.toBe('banner');
    expect(service.getBanner).toHaveBeenCalled();
  });

  it('should get templates', async () => {
    await expect(controller.getTemplates()).resolves.toBe('templates');
    expect(service.getTemplateConfig).toHaveBeenCalled();
  });

  it('should get registry', async () => {
    await expect(controller.getRegistry()).resolves.toBe('registry');
    expect(service.getRegistry).toHaveBeenCalled();
  });

  it('should get runpacks', async () => {
    await expect(controller.getRunpacks()).resolves.toBe('runpacks');
    expect(service.getRunpacks).toHaveBeenCalled();
  });

  it('should get cluster issuer', async () => {
    await expect(controller.getClusterIssuer()).resolves.toBe('issuer');
    expect(service.getClusterIssuer).toHaveBeenCalled();
  });

  it('should get pod sizes', async () => {
    await expect(controller.getPodSizes()).resolves.toBe('pods');
    expect(service.getPodSizes).toHaveBeenCalled();
  });

  it('should check component', async () => {
    await expect(controller.checkComponent('test')).resolves.toBe('checked');
    expect(service.checkComponent).toHaveBeenCalledWith('test');
  });

  it('should validate kubeconfig', async () => {
    const body = { kubeconfig: 'config', context: 'ctx' };
    await expect(controller.validateKubeconfig(body)).resolves.toEqual({
      valid: true,
    });
    expect(service.validateKubeconfig).toHaveBeenCalledWith('config', 'ctx');
  });

  it('should update running config if validation is valid', async () => {
    service.validateKubeconfig.mockResolvedValueOnce({ valid: true });
    const body = {
      KUBECONFIG_BASE64: Buffer.from('config').toString('base64'),
      KUBERO_CONTEXT: 'ctx',
      KUBERO_NAMESPACE: 'ns',
      KUBERO_SESSION_KEY: 'key',
      KUBERO_WEBHOOK_SECRET: 'secret',
    };
    await expect(controller.updateRunningConfig(body)).resolves.toBe(
      'updatedConfig',
    );
    expect(service.updateRunningConfig).toHaveBeenCalled();
  });

  it('should return validation result if not valid', async () => {
    service.validateKubeconfig.mockResolvedValueOnce({ valid: false });
    const body = {
      KUBECONFIG_BASE64: Buffer.from('config').toString('base64'),
      KUBERO_CONTEXT: 'ctx',
      KUBERO_NAMESPACE: 'ns',
      KUBERO_SESSION_KEY: 'key',
      KUBERO_WEBHOOK_SECRET: 'secret',
    };
    await expect(controller.updateRunningConfig(body)).resolves.toEqual({
      valid: false,
    });
    expect(service.validateKubeconfig).toHaveBeenCalled();
  });
});
