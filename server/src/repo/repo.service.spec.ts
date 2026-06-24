import { RepoService } from './repo.service';

jest.mock('./git/github', () => ({
  GithubApi: jest.fn().mockImplementation(() => ({
    getReferences: jest.fn(() => Promise.resolve(['main', 'dev'])),
    listRepos: jest.fn(() => Promise.resolve(['repo1', 'repo2'])),
    getBranches: jest.fn(() => Promise.resolve(['main', 'dev'])),
    getPullrequests: jest.fn(() => Promise.resolve([{ id: 1 }])),
    connectRepo: jest.fn(() => Promise.resolve({ connected: true })),
    disconnectRepo: jest.fn(() => Promise.resolve({ disconnected: true })),
    getWebhook: jest.fn(() => ({
      event: 'push',
      branch: 'main',
      repo: { ssh_url: 'ssh://repo' },
    })),
  })),
}));
jest.mock('./git/gitea', () => ({
  GiteaApi: jest.fn().mockImplementation(() => ({
    getReferences: jest.fn(() => Promise.resolve(['main'])),
    listRepos: jest.fn(() => Promise.resolve(['repo1'])),
    getBranches: jest.fn(() => Promise.resolve(['main'])),
    getPullrequests: jest.fn(() => Promise.resolve([{ id: 2 }])),
    connectRepo: jest.fn(() => Promise.resolve({ connected: true })),
    disconnectRepo: jest.fn(() => Promise.resolve({ disconnected: true })),
    getWebhook: jest.fn(() => false),
  })),
}));
jest.mock('./git/gogs', () => ({
  GogsApi: jest.fn().mockImplementation(() => ({
    getReferences: jest.fn(() => Promise.resolve(['main'])),
    listRepos: jest.fn(() => Promise.resolve(['repo1'])),
    getBranches: jest.fn(() => Promise.resolve(['main'])),
    getPullrequests: jest.fn(() => Promise.resolve([{ id: 3 }])),
    connectRepo: jest.fn(() => Promise.resolve({ connected: true })),
    disconnectRepo: jest.fn(() => Promise.resolve({ disconnected: true })),
    getWebhook: jest.fn(() => false),
  })),
}));
jest.mock('./git/gitlab', () => ({
  GitlabApi: jest.fn().mockImplementation(() => ({
    getReferences: jest.fn(() => Promise.resolve(['main'])),
    listRepos: jest.fn(() => Promise.resolve(['repo1'])),
    getBranches: jest.fn(() => Promise.resolve(['main'])),
    getPullrequests: jest.fn(() => Promise.resolve([{ id: 4 }])),
    connectRepo: jest.fn(() => Promise.resolve({ connected: true })),
    disconnectRepo: jest.fn(() => Promise.resolve({ disconnected: true })),
    getWebhook: jest.fn(() => false),
  })),
}));
jest.mock('./git/bitbucket', () => ({
  BitbucketApi: jest.fn().mockImplementation(() => ({
    getReferences: jest.fn(() => Promise.resolve(['main'])),
    listRepos: jest.fn(() => Promise.resolve(['repo1'])),
    getBranches: jest.fn(() => Promise.resolve(['main'])),
    getPullrequests: jest.fn(() => Promise.resolve([{ id: 5 }])),
    connectRepo: jest.fn(() => Promise.resolve({ connected: true })),
    disconnectRepo: jest.fn(() => Promise.resolve({ disconnected: true })),
    getWebhook: jest.fn(() => ({
      event: 'push',
      branch: 'main',
      repo: { ssh_url: 'ssh://repo' },
    })),
  })),
}));

describe('RepoService', () => {
  let service: RepoService;
  let notificationsService: any;
  let appsService: any;

  beforeEach(() => {
    notificationsService = { send: jest.fn() };
    appsService = {
      getAppsByRepoAndBranch: jest.fn(() =>
        Promise.resolve([{ name: 'app1', pipeline: 'pipe1', phase: 'dev' }]),
      ),
      rebuildApp: jest.fn(),
      createPRApp: jest.fn(),
      deletePRApp: jest.fn(),
    };
    service = new RepoService(notificationsService, appsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should list references for github', async () => {
    const repoB64 = Buffer.from('repo1').toString('base64');
    const refs = await service.listReferences('github', repoB64);
    expect(refs).toEqual(['main', 'dev']);
  });

  it('should list repositories by provider', async () => {
    const repos = await service.listRepositoriesByProvider('github');
    expect(repos).toEqual(['repo1', 'repo2']);
  });

  it('should connect and disconnect repo', async () => {
    const connect = await service.connectRepo('github', 'repo1');
    expect(connect).toEqual({ connected: true });
    const disconnect = await service.disconnectRepo('github', 'repo1');
    expect(disconnect).toEqual({ disconnected: true });
  });

  it('should list branches', async () => {
    const repoB64 = Buffer.from('repo1').toString('base64');
    const branches = await service.listBranches('github', repoB64);
    expect(branches).toEqual(['main', 'dev']);
  });

  it('should list pullrequests', async () => {
    const repoB64 = Buffer.from('repo1').toString('base64');
    const pulls = await service.listPullrequests('github', repoB64);
    expect(pulls).toEqual([{ id: 1 }]);
  });

  it('should return repositories status', () => {
    process.env.GITHUB_PERSONAL_ACCESS_TOKEN = 'token';
    const repos = service.listRepositories();
    expect(repos.github).toBe(true);
    expect(repos.docker).toBe(true);
    delete process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
  });

  it('should handle github webhook push', async () => {
    const headers = {
      'x-github-event': 'push',
      'x-github-delivery': 'delivery',
      'x-hub-signature-256': 'sig',
    };
    const body = {};
    await service.handleWebhook('github', headers, body);
    expect(notificationsService.send).toHaveBeenCalled();
    expect(appsService.rebuildApp).toHaveBeenCalled();
  });

  describe('handleWebhookPullRequest', () => {
    let originalConsoleLog: any;

    beforeEach(() => {
      // Mock console.log to avoid output during tests
      originalConsoleLog = console.log;
      console.log = jest.fn();
    });

    afterEach(() => {
      // Restore console.log
      console.log = originalConsoleLog;
      jest.clearAllMocks();
    });

    it('should create PR app when pull request is opened', async () => {
      // Mock the webhook response for pull request opened
      service['githubApi'].getWebhook = jest.fn(() => ({
        event: 'pull_request',
        action: 'opened',
        branch: 'feature-branch',
        repo: { ssh_url: 'git@github.com:user/repo.git' },
        repoprovider: 'github',
        delivery: 'delivery-id',
        verified: true,
        body: {},
      }));

      const headers = {
        'x-github-event': 'pull_request',
        'x-github-delivery': 'delivery-id',
        'x-hub-signature-256': 'signature',
      };
      const body = { action: 'opened' };

      await service.handleWebhook('github', headers, body);

      expect(appsService.createPRApp).toHaveBeenCalledWith(
        'feature-branch',
        'feature-branch',
        'git@github.com:user/repo.git',
        undefined,
        ['admin'],
      );
    });

    it('should create PR app when pull request is reopened', async () => {
      // Mock the webhook response for pull request reopened
      service['githubApi'].getWebhook = jest.fn(() => ({
        event: 'pull_request',
        action: 'reopened',
        branch: 'feature-branch',
        repo: { ssh_url: 'git@github.com:user/repo.git' },
        repoprovider: 'github',
        delivery: 'delivery-id',
        verified: true,
        body: {},
      }));

      const headers = {
        'x-github-event': 'pull_request',
        'x-github-delivery': 'delivery-id',
        'x-hub-signature-256': 'signature',
      };
      const body = { action: 'reopened' };

      await service.handleWebhook('github', headers, body);

      expect(appsService.createPRApp).toHaveBeenCalledWith(
        'feature-branch',
        'feature-branch',
        'git@github.com:user/repo.git',
        undefined,
        ['admin'],
      );
    });

    it('should delete PR app when pull request is closed', async () => {
      // Mock the webhook response for pull request closed
      service['githubApi'].getWebhook = jest.fn(() => ({
        event: 'pull_request',
        action: 'closed',
        branch: 'feature-branch',
        repo: { ssh_url: 'git@github.com:user/repo.git' },
        repoprovider: 'github',
        delivery: 'delivery-id',
        verified: true,
        body: {},
      }));

      const headers = {
        'x-github-event': 'pull_request',
        'x-github-delivery': 'delivery-id',
        'x-hub-signature-256': 'signature',
      };
      const body = { action: 'closed' };

      await service.handleWebhook('github', headers, body);

      expect(appsService.deletePRApp).toHaveBeenCalledWith(
        'feature-branch',
        'feature-branch',
        'git@github.com:user/repo.git',
        ['admin'],
      );
    });

    it('should log unhandled pull request actions', async () => {
      // Mock the webhook response for an unhandled action (using undefined as it's allowed)
      service['githubApi'].getWebhook = jest.fn(() => ({
        event: 'pull_request',
        action: undefined,
        branch: 'feature-branch',
        repo: { ssh_url: 'git@github.com:user/repo.git' },
        repoprovider: 'github',
        delivery: 'delivery-id',
        verified: true,
        body: {},
      }));

      const headers = {
        'x-github-event': 'pull_request',
        'x-github-delivery': 'delivery-id',
        'x-hub-signature-256': 'signature',
      };
      const body = { action: 'synchronize' };

      await service.handleWebhook('github', headers, body);

      expect(console.log).toHaveBeenCalledWith(
        'webhook pull request action not handled: undefined',
      );
      expect(appsService.createPRApp).not.toHaveBeenCalled();
      expect(appsService.deletePRApp).not.toHaveBeenCalled();
    });

    it('should handle pull request webhook from different providers', async () => {
      // Test with Gitea
      service['giteaApi'].getWebhook = jest.fn(() => ({
        event: 'pull_request',
        action: 'opened',
        branch: 'pr-branch',
        repo: { ssh_url: 'git@gitea.example.com:user/repo.git' },
        repoprovider: 'gitea',
        delivery: 'gitea-delivery',
        verified: true,
        body: {},
      }));

      const giteaHeaders = {
        'x-gitea-event': 'pull_request',
        'x-gitea-delivery': 'gitea-delivery',
        'x-hub-signature-256': 'gitea-signature',
      };

      await service.handleWebhook('gitea', giteaHeaders, {});

      expect(appsService.createPRApp).toHaveBeenCalledWith(
        'pr-branch',
        'pr-branch',
        'git@gitea.example.com:user/repo.git',
        undefined,
        ['admin'],
      );
    });

    it('should handle undefined action gracefully', async () => {
      // Mock webhook with undefined action
      service['githubApi'].getWebhook = jest.fn(() => ({
        event: 'pull_request',
        action: undefined,
        branch: 'feature-branch',
        repo: { ssh_url: 'git@github.com:user/repo.git' },
        repoprovider: 'github',
        delivery: 'delivery-id',
        verified: true,
        body: {},
      }));

      const headers = {
        'x-github-event': 'pull_request',
        'x-github-delivery': 'delivery-id',
        'x-hub-signature-256': 'signature',
      };

      await service.handleWebhook('github', headers, {});

      expect(console.log).toHaveBeenCalledWith(
        'webhook pull request action not handled: undefined',
      );
      expect(appsService.createPRApp).not.toHaveBeenCalled();
      expect(appsService.deletePRApp).not.toHaveBeenCalled();
    });

    it('should not call appsService methods when webhook is boolean false', async () => {
      // Mock webhook returning false (invalid webhook)
      service['githubApi'].getWebhook = jest.fn(() => false);

      const headers = {
        'x-github-event': 'pull_request',
        'x-github-delivery': 'delivery-id',
        'x-hub-signature-256': 'signature',
      };

      await service.handleWebhook('github', headers, {});

      expect(appsService.createPRApp).not.toHaveBeenCalled();
      expect(appsService.deletePRApp).not.toHaveBeenCalled();
    });

    it('should log unhandled pull request actions with direct function call', async () => {
      // Test the private method directly with an action not in the enum
      const mockWebhook = {
        event: 'pull_request',
        action: 'synchronize' as any, // Force a non-standard action
        branch: 'feature-branch',
        repo: { ssh_url: 'git@github.com:user/repo.git' },
        repoprovider: 'github' as const,
        delivery: 'delivery-id',
        verified: true,
        body: {},
      };

      // Call the private method directly
      await (service as any).handleWebhookPullRequest(mockWebhook);

      expect(console.log).toHaveBeenCalledWith(
        'webhook pull request action not handled: synchronize',
      );
      expect(appsService.createPRApp).not.toHaveBeenCalled();
      expect(appsService.deletePRApp).not.toHaveBeenCalled();
    });
  });

  it('should handle unknown repo provider', async () => {
    const spy = jest.spyOn(service['logger'], 'debug');
    await service.handleWebhook('unknown', {}, {});
    expect(spy).toHaveBeenCalledWith('unknown repoprovider: unknown');
    spy.mockRestore();
  });
});
