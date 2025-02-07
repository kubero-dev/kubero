import { Test, TestingModule } from '@nestjs/testing';
import { AddonsController } from './addons.controller';

describe('AddonsController', () => {
  let controller: AddonsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AddonsController],
    }).compile();

    controller = module.get<AddonsController>(AddonsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
