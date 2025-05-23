import { GogsApi } from './gogs';
import { Repo } from './repo';

jest.mock('gitea-js', () => ({
  giteaApi: jest.fn(() => ({
    repos: {
      repoGet: jest.fn(),
      repoListHooks: jest.fn(),
      repoCreateHook: jest.fn(),
      repoCreateKey: jest.fn(),
      repoListBranches: jest.fn(),
      repoListTags: jest.fn(),
      repoListCommits: jest.fn(),
    },
    user: {
      userCurrentListRepos: jest.fn(),
    },
  })),
}));

jest.mock('cross-fetch', () => ({
  fetch: jest.fn(),
}));

jest.mock('git-url-parse', () =>
  jest.fn(() => ({
    name: 'repo',
    owner: 'owner',
  })),
);

describe('GogsApi', () => {
  let gogs: GogsApi;

  beforeEach(() => {
    gogs = new GogsApi('http://localhost', 'token');
  });

  it('should be defined', () => {
    expect(gogs).toBeInstanceOf(Repo);
  });

  describe('getRepository', () => {
    it('should return repository data', async () => {
      const mockRes = {
        status: 200,
        data: {
          id: 1,
          node_id: 'node1',
          name: 'repo',
          description: 'desc',
          owner: { login: 'owner' },
          private: false,
          ssh_url: 'ssh://repo',
          language: 'ts',
          homepage: '',
          permissions: { admin: true, push: true },
          visibility: 'public',
          default_branch: 'main',
        },
      };
      gogs['gitea'].repos.repoGet = jest.fn().mockResolvedValue(mockRes);

      const result = await gogs['getRepository']('git@host:owner/repo.git');
      expect(result.status).toBe(200);
      expect(result.data.owner).toBe('owner');
      expect(result.data.name).toBe('repo');
    });

    it('should handle missing owner or repo', async () => {
      const gitUrlParse = require('git-url-parse');
      gitUrlParse.mockReturnValueOnce({ name: undefined, owner: undefined });
      await expect(gogs['getRepository']('invalid')).rejects.toThrow();
    });
  });

  describe('addWebhook', () => {
    it('should return 422 if webhook already exists', async () => {
      gogs['gitea'].repos.repoListHooks = jest.fn().mockResolvedValue({
        data: [
          {
            config: { url: 'http://webhook', content_type: 'json' },
            active: true,
          },
        ],
      });
      const result = await gogs['addWebhook'](
        'owner',
        'repo',
        'http://webhook',
        'secret',
      );
      expect(result.status).toBe(422);
      expect(result.statusText).toBe('found');
    });

    it('should create a webhook if not exists', async () => {
      gogs['gitea'].repos.repoListHooks = jest
        .fn()
        .mockResolvedValue({ data: [] });
      gogs['gitea'].repos.repoCreateHook = jest.fn().mockResolvedValue({
        status: 201,
        data: {
          id: 1,
          active: true,
          created_at: '2020-01-01T00:00:00Z',
          url: 'http://webhook',
          config: { insecure_ssl: false },
          events: ['push'],
        },
      });
      const result = await gogs['addWebhook'](
        'owner',
        'repo',
        'http://webhook',
        'secret',
      );
      expect(result.status).toBe(201);
      expect(result.statusText).toBe('created');
      expect(result.data.url).toBe('http://webhook');
    });
  });

  describe('addDeployKey', () => {
    it('should create a deploy key', async () => {
      gogs['createDeployKeyPair'] = jest.fn(() => ({
        fingerprint: 'fingerprint123',
        pubKey: 'pub',
        privKey: 'priv',
        pubKeyBase64: 'pub64',
        privKeyBase64: 'priv64',
      }));
      gogs['gitea'].repos.repoCreateKey = jest.fn().mockResolvedValue({
        status: 201,
        data: {
          id: 1,
          title: 'title',
          verified: true,
          created_at: '2020-01-01T00:00:00Z',
          url: 'url',
          read_only: true,
        },
      });
      const result = await gogs['addDeployKey']('owner', 'repo');
      expect(result.status).toBe(201);
      expect(result.statusText).toBe('created');
      expect(result.data.pub).toBe('pub64');
      expect(result.data.priv).toBe('priv64');
    });
  });

  describe('getWebhook', () => {
    it('should return false if signature is invalid', () => {
      process.env.KUBERO_WEBHOOK_SECRET = 'secret';
      const result = gogs.getWebhook('push', 'delivery', 'invalidsig', {
        foo: 'bar',
      });
      expect(result).toBe(false);
    });
  });

  describe('listRepos', () => {
    it('should return a list of repo ssh_urls', async () => {
      gogs['gitea'].user.userCurrentListRepos = jest.fn().mockResolvedValue({
        data: [{ ssh_url: 'ssh://repo1' }, { ssh_url: 'ssh://repo2' }],
      });
      const result = await gogs.listRepos();
      expect(result).toEqual(['ssh://repo1', 'ssh://repo2']);
    });
  });

  describe('getBranches', () => {
    it('should return a list of branch names', async () => {
      gogs['gitea'].repos.repoListBranches = jest.fn().mockResolvedValue({
        data: [{ name: 'main' }, { name: 'dev' }],
      });
      const result = await gogs.getBranches('git@host:owner/repo.git');
      expect(result).toEqual(['main', 'dev']);
    });
  });

  describe('getReferences', () => {
    it('should return a list of branch, tag, and commit names', async () => {
      gogs['gitea'].repos.repoListBranches = jest.fn().mockResolvedValue({
        data: [{ name: 'main' }],
      });
      gogs['gitea'].repos.repoListTags = jest.fn().mockResolvedValue({
        data: [{ name: 'v1.0.0' }],
      });
      gogs['gitea'].repos.repoListCommits = jest.fn().mockResolvedValue({
        data: [{ sha: 'abc123' }],
      });
      const result = await gogs.getReferences('git@host:owner/repo.git');
      expect(result).toEqual(['main', 'v1.0.0', 'abc123']);
    });
  });

  describe('getPullrequests', () => {
    it('should return an empty array', async () => {
      const result = await gogs.getPullrequests('git@host:owner/repo.git');
      expect(result).toEqual([]);
    });
  });
});
