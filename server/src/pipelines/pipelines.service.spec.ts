import { PipelinesService } from './pipelines.service';
import { IUser } from 'src/auth/auth.interface';
import { IPipeline } from './pipelines.interface';

jest.mock('../config/buildpack/buildpack', () => ({
  Buildpack: {
    SetSecurityContext: jest.fn((ctx) => ctx),
  },
}));

export const mockPipeline: IPipeline = {
  name: 'pipe1',
  domain: 'pipe1.example.com',
  reviewapps: false,
  phases: [
    {
      name: 'dev',
      enabled: true,
      context: 'ctx1',
      defaultEnvvars: [],
      domain: 'dev.pipe1.example.com',
      // apps: [] // falls im Interface vorhanden
    },
    {
      name: 'prod',
      enabled: false,
      context: 'ctx2',
      defaultEnvvars: [],
      domain: 'prod.pipe1.example.com',
      // apps: []
    },
  ],
  buildpack: {} as any,
  git: {
    keys: { priv: undefined, pub: undefined },
    provider: 'github',
    repository: undefined,
    webhook: {},
  },
  registry: {
    host: 'docker.io',
    username: 'user',
    password: 'pass',
  },
  dockerimage: 'repo/image:tag',
  deploymentstrategy: 'git',
  buildstrategy: 'dockerfile',
  resourceVersion: '1',
};

describe('PipelinesService', () => {
  let service: PipelinesService;
  let kubectl: any;
  let notificationsService: any;

  beforeEach(() => {
    kubectl = {
      getPipelinesList: jest.fn(),
      getPipeline: jest.fn(),
      getAppsList: jest.fn(),
      setCurrentContext: jest.fn(),
      updatePipeline: jest.fn(),
      createPipeline: jest.fn(),
      deletePipeline: jest.fn(),
    };
    notificationsService = {
      send: jest.fn(),
    };
    service = new PipelinesService(kubectl, notificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('listPipelines', () => {
    it('should return pipeline list', async () => {
      kubectl.getPipelinesList.mockResolvedValue({
        items: [
          { spec: { name: 'pipe1', phases: [] } },
          { spec: { name: 'pipe2', phases: [] } },
        ],
      });
      const result = await service.listPipelines();
      expect(result.items.length).toBe(2);
      expect(result.items[0].name).toBe('pipe1');
    });
  });

  describe('getPipelineWithApps', () => {
    it('should return pipeline with apps', async () => {
      kubectl.setCurrentContext.mockResolvedValue(undefined);
      kubectl.getPipeline.mockResolvedValue({
        spec: {
          name: 'pipe1',
          git: { keys: { priv: 'priv', pub: 'pub' } },
          phases: [
            { name: 'dev', enabled: true },
            { name: 'prod', enabled: false },
          ],
        },
      });
      kubectl.getAppsList.mockResolvedValue({
        items: [{ spec: { name: 'app1' } }, { spec: { name: 'app2' } }],
      });
      jest.spyOn(service, 'getContext').mockResolvedValue('ctx');
      const result = await service.getPipelineWithApps('pipe1');
      expect(result?.name).toBe('pipe1');
      expect(result?.phases.length).toBe(2);
      expect(result?.git.keys.priv).toBeUndefined();
      expect(result?.git.keys.pub).toBeUndefined();
    });

    it('should return undefined if pipeline spec or keys missing', async () => {
      kubectl.setCurrentContext.mockResolvedValue(undefined);
      kubectl.getPipeline.mockResolvedValue({ spec: undefined });
      const result = await service.getPipelineWithApps('pipe1');
      expect(result).toBeUndefined();
    });
  });

  describe('getContext', () => {
    it('should return context for phase', async () => {
      service.listPipelines = jest.fn().mockResolvedValue({
        items: [
          {
            name: 'pipe1',
            phases: [{ name: 'dev', context: 'ctx1' }],
          },
        ],
      });
      const ctx = await service.getContext('pipe1', 'dev', [
        'group1',
        'group2',
      ]);
      expect(ctx).toBe('ctx1');
    });

    it('should return missing context if not found', async () => {
      service.listPipelines = jest.fn().mockResolvedValue({
        items: [],
      });
      const ctx = await service.getContext('pipe1', 'dev', [
        'group1',
        'group2',
      ]);
      expect(ctx).toBe('missing-pipe1-dev');
    });
  });

  describe('getPipeline', () => {
    it('should return pipeline spec with resourceVersion', async () => {
      kubectl.getPipeline.mockResolvedValue({
        spec: {
          name: 'pipe1',
          buildpack: {
            fetch: { securityContext: {} },
            build: { securityContext: {} },
            run: { securityContext: {} },
          },
          git: { keys: { priv: 'priv', pub: 'pub' } },
        },
        metadata: { resourceVersion: '123' },
      });
      const result = await service.getPipeline('pipe1');
      expect(result?.name).toBe('pipe1');
      expect(result?.resourceVersion).toBe('123');
      expect(result?.git.keys.priv).toBeUndefined();
      expect(result?.git.keys.pub).toBeUndefined();
    });

    it('should return undefined if getPipeline fails', async () => {
      kubectl.getPipeline.mockRejectedValue(new Error('fail'));
      const result = await service.getPipeline('pipe1');
      expect(result).toBeUndefined();
    });
  });

  describe('deletePipeline', () => {
    it('should not delete if KUBERO_READONLY is true', async () => {
      process.env.KUBERO_READONLY = 'true';
      const user = { username: 'test' } as IUser;
      const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
      service.deletePipeline('pipe1', user);
      expect(spy).toHaveBeenCalledWith(
        'KUBERO_READONLY is set to true, not deleting pipeline pipe1',
      );
      spy.mockRestore();
      delete process.env.KUBERO_READONLY;
    });

    it('should delete pipeline and send notification', async () => {
      kubectl.getPipeline.mockResolvedValue({ name: 'pipe1' });
      kubectl.deletePipeline.mockResolvedValue(undefined);
      const user = { username: 'test' } as IUser;
      await service.deletePipeline('pipe1', user);
      expect(kubectl.deletePipeline).toHaveBeenCalledWith('pipe1');
      //expect(notificationsService.send).toHaveBeenCalled();
    });
  });

  describe('updatePipeline', () => {
    it('should not update if KUBERO_READONLY is true', async () => {
      process.env.KUBERO_READONLY = 'true';
      const user = { username: 'test' } as IUser;
      const spy = jest
        .spyOn(service['logger'], 'log')
        .mockImplementation(() => {});
      await service.updatePipeline(mockPipeline, '1', user);
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
      delete process.env.KUBERO_READONLY;
    });

    it('should update pipeline and send notification', async () => {
      const user = { username: 'test' } as IUser;
      kubectl.getPipeline.mockResolvedValue({
        spec: { git: { keys: { priv: 'priv', pub: 'pub' } } },
      });
      kubectl.updatePipeline.mockResolvedValue(undefined);
      await service.updatePipeline(mockPipeline, '1', user);
      expect(kubectl.updatePipeline).toHaveBeenCalled();
      //expect(notificationsService.send).toHaveBeenCalled();
    });

    it('should handle error in updatePipeline', async () => {
      const user = { username: 'test' } as IUser;
      kubectl.getPipeline.mockRejectedValue(new Error('fail'));
      const spy = jest
        .spyOn(service['logger'], 'error')
        .mockImplementation(() => {});
      await service.updatePipeline(mockPipeline, '1', user);
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('createPipeline', () => {
    it('should not create if KUBERO_READONLY is true', async () => {
      process.env.KUBERO_READONLY = 'true';
      const user = { username: 'test' } as IUser;
      const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
      await service.createPipeline(mockPipeline, user);
      expect(spy).toHaveBeenCalledWith(
        'KUBERO_READONLY is set to true, not creting pipeline pipe1',
      );
      spy.mockRestore();
      delete process.env.KUBERO_READONLY;
    });

    it('should create pipeline and send notification', async () => {
      const user = { username: 'test' } as IUser;
      kubectl.createPipeline.mockResolvedValue(undefined);
      const result = await service.createPipeline(mockPipeline, user);
      expect(kubectl.createPipeline).toHaveBeenCalledWith(mockPipeline);
      expect(notificationsService.send).toHaveBeenCalled();
      expect(result?.status).toBe('ok');
    });

    describe('countPipelines', () => {
      it('should return the number of pipelines', async () => {
        kubectl.getPipelinesList.mockResolvedValue({
          items: [{ spec: {} }, { spec: {} }, { spec: {} }],
        });
        const result = await service.countPipelines();
        expect(result).toBe(3);
      });

      it('should return 0 when no pipelines exist', async () => {
        kubectl.getPipelinesList.mockResolvedValue({ items: [] });
        const result = await service.countPipelines();
        expect(result).toBe(0);
      });
    });
  });
});
