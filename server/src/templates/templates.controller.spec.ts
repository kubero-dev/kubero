import { Test, TestingModule } from '@nestjs/testing';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';
import { Response } from 'express';

describe('TemplatesController', () => {
  let controller: TemplatesController;
  let service: TemplatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TemplatesController],
      providers: [
        {
          provide: TemplatesService,
          useValue: {
            getTemplate: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TemplatesController>(TemplatesController);
    service = module.get<TemplatesService>(TemplatesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return template on success', async () => {
    const mockTemplate = { name: 'test-template' };
    const templateB64 = Buffer.from(
      'http://example.com/template.yaml',
    ).toString('base64');
    (service.getTemplate as jest.Mock).mockResolvedValueOnce(mockTemplate);

    const res = {
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as any as Response;

    await controller.getTemplate(templateB64, res);

    expect(service.getTemplate).toHaveBeenCalledWith(templateB64);
    expect(res.send).toHaveBeenCalledWith(mockTemplate);
  });

  it('should return 500 on error', async () => {
    const error = new Error('fail');
    const errorMessage = {
      error: 'Failed to load template',
      message: error.message,
    }
    const templateB64 = Buffer.from('http://fail.com/template.yaml').toString(
      'base64',
    );
    (service.getTemplate as jest.Mock).mockRejectedValueOnce(error);

    const res = {
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as any as Response;

    const loggerSpy = jest
      .spyOn(controller['logger'], 'error')
      .mockImplementation(() => {});

    await controller.getTemplate(templateB64, res);

    expect(service.getTemplate).toHaveBeenCalledWith(templateB64);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(errorMessage);
    expect(loggerSpy).toHaveBeenCalledWith(error);

    loggerSpy.mockRestore();
  });
});
