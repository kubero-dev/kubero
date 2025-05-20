import { Test, TestingModule } from '@nestjs/testing';
import { RepoController } from './repo.controller';
import { RepoService } from './repo.service';
import { AppsService } from '../apps/apps.service';

describe('RepoController', () => {
  let controller: RepoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RepoController],
      providers: [
        {
          provide: RepoService,
          useValue: {
            getRepo: jest.fn(),
            createRepo: jest.fn(),
            updateRepo: jest.fn(),
            deleteRepo: jest.fn(),
          },
        },
        {
          provide: AppsService,
          useValue: {
            getAppById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RepoController>(RepoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
