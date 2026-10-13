import { Test, TestingModule } from '@nestjs/testing';
import { PipelinesController } from './pipelines.controller';
import { PipelinesService } from './pipelines.service';

const mockUserGroups = ['group1', 'group2'];
const mockUser = {
  id: 1,
  strategy: 'local',
  username: 'admin',
};

const mockJWT = {
  userId: 1,
  strategy: 'local',
  username: 'admin',
  apitoken: '1234567890',
  userGroups: mockUserGroups,
};

describe('PipelinesController', () => {
  let controller: PipelinesController;
  let service: jest.Mocked<PipelinesService>;

  beforeEach(async () => {
    service = {
      listPipelines: jest.fn().mockResolvedValue(['pipeline1', 'pipeline2']),
      createPipeline: jest.fn().mockResolvedValue({ ok: true }),
      getPipeline: jest.fn().mockResolvedValue({ name: 'pipeline1' }),
      updatePipeline: jest.fn().mockResolvedValue({ ok: true }),
      deletePipeline: jest.fn().mockResolvedValue({ ok: true }),
      getPipelineWithApps: jest.fn().mockResolvedValue([{ name: 'app1' }]),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PipelinesController],
      providers: [
        {
          provide: PipelinesService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<PipelinesController>(PipelinesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get all pipelines', async () => {
    const req = { user: mockJWT };
    const result = await controller.getPipelines(req);
    expect(service.listPipelines).toHaveBeenCalled();
    expect(result).toEqual(['pipeline1', 'pipeline2']);
  });

  it('should create a new pipeline if pipelineName is "new"', async () => {
    const dto: any = {
      pipelineName: 'pipeline1',
      domain: 'domain',
      phases: [],
      buildpack: '',
      reviewapps: false,
      dockerimage: '',
      git: {},
      registry: {},
      deploymentstrategy: '',
      buildstrategy: '',
    };

    const req = { user: mockJWT };
    const result = await controller.createPipeline('new', dto, req);
    expect(service.createPipeline).toHaveBeenCalled();
    expect(result).toEqual({ ok: true });
  });

  it('should throw if pipelineName is not "new" in createPipeline', async () => {
    const dto: any = {
      pipelineName: 'pipeline1',
      domain: 'domain',
      phases: [],
      buildpack: '',
      reviewapps: false,
      dockerimage: '',
      git: {},
      registry: {},
      deploymentstrategy: '',
      buildstrategy: '',
    };
    const req = { user: mockJWT };
    await expect(
      controller.createPipeline('notnew', dto, req),
    ).rejects.toThrow();
  });

  it('should get a specific pipeline', async () => {
    const result = await controller.getPipeline('pipeline1');
    expect(service.getPipeline).toHaveBeenCalledWith('pipeline1');
    expect(result).toEqual({ name: 'pipeline1' });
  });

  it('should update a pipeline', async () => {
    const dto: any = {
      pipelineName: 'pipeline1',
      domain: 'domain',
      phases: [],
      buildpack: '',
      reviewapps: false,
      dockerimage: '',
      git: {},
      registry: {},
      deploymentstrategy: '',
      buildstrategy: '',
      resourceVersion: '1',
    };
    const req = { user: mockJWT };
    const result = await controller.updatePipeline(dto, req, 'pipeline1');
    expect(service.updatePipeline).toHaveBeenCalled();
    expect(result).toEqual({ ok: true });
  });

  it('should delete a pipeline', async () => {
    const req = { user: mockJWT };
    const result = await controller.deletePipeline('pipeline1', req);
    expect(service.deletePipeline).toHaveBeenCalledWith(
      'pipeline1',
      expect.any(Object),
    );
    expect(result).toEqual({ message: '', status: 'ok' });
  });

  it('should get all apps for a pipeline', async () => {
    const req = { user: mockJWT };
    const result = await controller.getPipelineApps('pipeline1', req);
    expect(service.getPipelineWithApps).toHaveBeenCalledWith('pipeline1', [
      'group1',
      'group2',
    ]);
    expect(result).toEqual([{ name: 'app1' }]);
  });
});
