import { Test, TestingModule } from '@nestjs/testing';
import { RepoService } from './repo.service';

describe('RepoService', () => {
  let service: RepoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RepoService],
    }).compile();

    service = module.get<RepoService>(RepoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
