import { Test, TestingModule } from '@nestjs/testing';
import { AddonsService } from './addons.service';

describe('AddonsService', () => {
  let service: AddonsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AddonsService,
          useValue: {
            getAddons: jest.fn(),
            getAddonById: jest.fn(),
            createAddon: jest.fn(),
            updateAddon: jest.fn(),
            deleteAddon: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AddonsService>(AddonsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
