import { Test, TestingModule } from '@nestjs/testing';
import { GroupsService } from './groups.service';

describe('GroupService', () => {
  let service: GroupsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupsService],
    }).compile();

    service = module.get<GroupsService>(GroupsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

describe('GroupsService', () => {
  let service: GroupsService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      userGroup: {
        findMany: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    service = new GroupsService();
    // @ts-ignore
    service['prisma'] = prismaMock;
  });

  it('should find all groups', async () => {
    const mockGroups = [{ id: '1', name: 'group1' }];
    prismaMock.userGroup.findMany.mockResolvedValueOnce(mockGroups);
    const result = await service.findAll();
    expect(result).toBe(mockGroups);
    expect(prismaMock.userGroup.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  });

  it('should create a group', async () => {
    const mockGroup = { id: '2', name: 'group2', description: 'desc' };
    prismaMock.userGroup.create.mockResolvedValueOnce(mockGroup);
    const result = await service.create('group2', 'desc');
    expect(result).toBe(mockGroup);
    expect(prismaMock.userGroup.create).toHaveBeenCalledWith({
      data: { name: 'group2', description: 'desc' },
    });
  });

  it('should find a group by id', async () => {
    const mockGroup = { id: '3', name: 'group3' };
    prismaMock.userGroup.findUnique.mockResolvedValueOnce(mockGroup);
    const result = await service.findById('3');
    expect(result).toBe(mockGroup);
    expect(prismaMock.userGroup.findUnique).toHaveBeenCalledWith({
      where: { id: '3' },
    });
  });

  it('should update a group', async () => {
    const mockGroup = { id: '4', name: 'group4', description: 'desc4' };
    prismaMock.userGroup.update.mockResolvedValueOnce(mockGroup);
    const result = await service.update('4', {
      name: 'group4',
      description: 'desc4',
    });
    expect(result).toBe(mockGroup);
    expect(prismaMock.userGroup.update).toHaveBeenCalledWith({
      where: { id: '4' },
      data: { name: 'group4', description: 'desc4' },
    });
  });

  it('should delete a group', async () => {
    const mockGroup = { id: '5', name: 'group5' };
    prismaMock.userGroup.delete.mockResolvedValueOnce(mockGroup);
    const result = await service.delete('5');
    expect(result).toBe(mockGroup);
    expect(prismaMock.userGroup.delete).toHaveBeenCalledWith({
      where: { id: '5' },
    });
  });
});
