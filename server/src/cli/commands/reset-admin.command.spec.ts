import { Test, TestingModule } from '@nestjs/testing';
import { ResetAdminCommand } from './reset-admin.command';
import { DatabaseService } from '../../database/database.service';
import { Logger } from '@nestjs/common';

describe('ResetAdminCommand', () => {
  let command: ResetAdminCommand;
  let databaseService: jest.Mocked<DatabaseService>;
  let logger: jest.Mocked<Logger>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResetAdminCommand,
        {
          provide: DatabaseService,
          useValue: {
            resetAdminUser: jest.fn(),
          },
        },
      ],
    }).compile();

    command = module.get<ResetAdminCommand>(ResetAdminCommand);
    databaseService = module.get(DatabaseService);

    // Mock the logger
    logger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    } as any;
    (command as any).logger = logger;
  });

  it('should be defined', () => {
    expect(command).toBeDefined();
  });

  describe('run', () => {
    let exitSpy: jest.SpyInstance;

    beforeEach(() => {
      exitSpy = jest
        .spyOn(process, 'exit')
        .mockImplementation((() => {}) as (code?: number) => never);
      // We need to call the original implementation of run
      jest.spyOn(command, 'run').mockRestore();
    });

    afterEach(() => {
      exitSpy.mockRestore();
    });

    it('should reset the admin account and exit with code 0', async () => {
      await command.run();
      expect(logger.log).toHaveBeenCalledWith('Resetting admin account...');
      expect(databaseService.resetAdminUser).toHaveBeenCalled();
      expect(logger.log).toHaveBeenCalledWith(
        'Admin account has been reset successfully',
      );
      expect(exitSpy).toHaveBeenCalledWith(0);
    });

    it('should log an error and exit with code 1 if resetting fails', async () => {
      const error = new Error('Test error');
      databaseService.resetAdminUser.mockRejectedValue(error);
      await command.run();
      expect(logger.log).toHaveBeenCalledWith('Resetting admin account...');
      expect(databaseService.resetAdminUser).toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to reset admin account',
        error,
      );
      expect(exitSpy).toHaveBeenCalledWith(1);
    });
  });
});
