import { Test, TestingModule } from '@nestjs/testing';
import { AddonsController } from './addons.controller';
import { AddonsService } from './addons.service';

describe('AddonsController', () => {
  let controller: AddonsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AddonsController],
      providers: [
        {
          provide: AddonsService,
          useValue: {
            getAddon: jest.fn(),
            createAddon: jest.fn(),
            updateAddon: jest.fn(),
            deleteAddon: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AddonsController>(AddonsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
