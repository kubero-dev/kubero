import { Test, TestingModule } from '@nestjs/testing';
import { StatusController } from './status.controller';

describe('StatusController', () => {
  let controller: StatusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatusController],
    }).compile();

    controller = module.get<StatusController>(StatusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return the metrics when request is not forwarded', async () => {
    // Mock response and request objects
    const mockResponse = {
      req: {
        headers: {}
      },
      status: jest.fn().mockReturnThis()
    } as any;
    
    // Mock super.index
    const superIndexSpy = jest.spyOn(Object.getPrototypeOf(controller), 'index')
      .mockResolvedValue('metrics data');
    
    const result = await controller.index(mockResponse);
    
    expect(superIndexSpy).toHaveBeenCalledWith(mockResponse);
    expect(result).toBe('metrics data');
    expect(mockResponse.status).not.toHaveBeenCalled();
  });
/*
  it('should block request with 403 when x-forwarded-for header is present', async () => {
    // Mock response and request objects
    const mockResponse = {
      req: {
        headers: {
          'x-forwarded-for': '192.168.1.1'
        }
      },
      status: jest.fn().mockReturnThis()
    } as any;
    
    const loggerWarnSpy = jest.spyOn(controller['logger'], 'warn');
    const superIndexSpy = jest.spyOn(Object.getPrototypeOf(controller), 'index');
    
    const result = await controller.index(mockResponse);
    
    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(loggerWarnSpy).toHaveBeenCalledWith('Blocked request from ingress controller');
    expect(superIndexSpy).not.toHaveBeenCalled();
    expect(result).toBe('');
  });
*/
});
