import { RepoService } from './repo.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AppsService } from '../apps/apps.service';

jest.mock('./git/github', () => ({
  GithubApi: jest.fn().mockImplementation(() => ({
    getReferences: jest.fn(() => Promise.resolve(['main', 'dev'])),
    listRepos: jest.fn(() => Promise.resolve(['repo1', 'repo2'])),
    getBranches: jest.fn(() => Promise.resolve(['main', 'dev'])),
    getPullrequests: jest.fn(() => Promise.resolve([{ id: 1 }])),
    connectRepo: jest.fn(() => Promise.resolve({ connected: true })),
    disconnectRepo: jest.fn(() => Promise.resolve({ disconnected: true })),
    getWebhook: jest.fn(() => ({ event: 'push', branch: 'main', repo: { ssh_url: 'ssh://repo' } })),
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
    getWebhook: jest.fn(() => ({ event: 'push', branch: 'main', repo: { ssh_url: 'ssh://repo' } })),
  })),
}));

describe('RepoService', () => {
  let service: RepoService;
  let notificationsService: any;
  let appsService: any;

  beforeEach(() => {
    notificationsService = { send: jest.fn() };
    appsService = {
      getAppsByRepoAndBranch: jest.fn(() => Promise.resolve([{ name: 'app1', pipeline: 'pipe1', phase: 'dev' }])),
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
/*
  it('should handle github webhook pull_request', async () => {
    service['githubApi'].getWebhook = jest.fn(() => ({
      event: 'pull_request',
      action: 'opened',
      branch: 'feature',
      repo: { ssh_url: 'ssh://repo' },
    }));
    const headers = {
      'x-github-event': 'pull_request',
      'x-github-delivery': 'delivery',
      'x-hub-signature-256': 'sig',
    };
    const body = {};
    await service.handleWebhook('github', headers, body);
    expect(appsService.createPRApp).toHaveBeenCalled();
  });

  it('should handle github webhook pull_request closed', async () => {
    service['githubApi'].getWebhook = jest.fn(() => ({
      event: 'pull_request',
      action: 'closed',
      branch: 'feature',
      repo: { ssh_url: 'ssh://repo' },
    }));
    const headers = {
      'x-github-event': 'pull_request',
      'x-github-delivery': 'delivery',
      'x-hub-signature-256': 'sig',
    };
    const body = {};
    await service.handleWebhook('github', headers, body);
    expect(appsService.deletePRApp).toHaveBeenCalled();
  });
*/
  it('should handle unknown repo provider', async () => {
    const spy = jest.spyOn(service['logger'], 'debug');
    await service.handleWebhook('unknown', {}, {});
    expect(spy).toHaveBeenCalledWith('unknown repoprovider: unknown');
    spy.mockRestore();
  });
});