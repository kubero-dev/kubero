import { Test, TestingModule } from '@nestjs/testing';
import { RepoService } from './repo.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AppsService } from '../apps/apps.service';

describe('RepoService', () => {
  let service: RepoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RepoService,
        {
          provide: NotificationsService,
          useValue: {
            sendNotification: jest.fn(),
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

    service = module.get<RepoService>(RepoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
