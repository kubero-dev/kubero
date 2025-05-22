import { GithubApi } from './github';
import { Repo } from './repo';

jest.mock('@octokit/core', () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    request: jest.fn(),
  })),
}));

jest.mock('git-url-parse', () => jest.fn(() => ({
  name: 'repo',
  owner: 'owner',
})));

describe('GithubApi', () => {
  let github: GithubApi;
  let octokitMock: any;

  beforeEach(() => {
    github = new GithubApi('https://api.github.com', 'token');
    octokitMock = github['octokit'];
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(github).toBeInstanceOf(Repo);
  });

  describe('getRepository', () => {
    it('should return repository data', async () => {
      octokitMock.request.mockResolvedValueOnce({
        status: 200,
        data: {
          id: 1,
          node_id: 'node1',
          name: 'repo',
          description: 'desc',
          owner: { login: 'owner' },
          private: false,
          ssh_url: 'ssh://repo',
          clone_url: 'https://repo',
          language: 'ts',
          homepage: '',
          permissions: { admin: true, push: true },
          visibility: 'public',
          default_branch: 'main',
        },
      });
      const result = await github['getRepository']('git@host:owner/repo.git');
      expect(result.status).toBe(200);
      expect(result.data.owner).toBe('owner');
      expect(result.data.name).toBe('repo');
    });

    it('should handle repository not found', async () => {
      octokitMock.request.mockRejectedValueOnce({ status: 404 });
      const result = await github['getRepository']('git@host:owner/repo.git');
      expect(result.status).toBe(404);
      expect(result.statusText).toBe('not found');
    });
  });

  describe('addWebhook', () => {
    it('should create a webhook', async () => {
      octokitMock.request
        .mockResolvedValueOnce({
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
      const result = await github['addWebhook']('owner', 'repo', 'http://webhook', 'secret');
      expect(result.status).toBe(201);
      expect(result.statusText).toBe('created');
      expect(result.data.url).toBe('http://webhook');
    });

    it('should handle existing webhook (422)', async () => {
      octokitMock.request
        .mockRejectedValueOnce({ status: 422 })
        .mockResolvedValueOnce({
          data: [
            {
              id: 2,
              active: true,
              created_at: '2020-01-01T00:00:00Z',
              config: { url: 'http://webhook', insecure_ssl: false },
              events: ['push'],
            },
          ],
        });
      const result = await github['addWebhook']('owner', 'repo', 'http://webhook', 'secret');
      expect(result.status).toBe(422);
      expect(result.data.url).toBe('http://webhook');
    });
  });

  describe('addDeployKey', () => {
    it('should create a deploy key', async () => {
      github['createDeployKeyPair'] = jest.fn(() => ({
        fingerprint: 'fingerprint123',
        pubKey: 'pub',
        privKey: 'priv',
        pubKeyBase64: 'pub64',
        privKeyBase64: 'priv64',
      }));
      octokitMock.request.mockResolvedValueOnce({
        status: 201,
        data: {
          id: 1,
          title: 'bot@kubero',
          verified: true,
          created_at: '2020-01-01T00:00:00Z',
          url: 'url',
          read_only: true,
        },
      });
      const result = await github['addDeployKey']('owner', 'repo');
      expect(result.status).toBe(201);
      expect(result.statusText).toBe('created');
      expect(result.data.pub).toBe('pub64');
      expect(result.data.priv).toBe('priv64');
    });
  });

  describe('getWebhook', () => {
    it('should return false if signature is invalid', () => {
      process.env.KUBERO_WEBHOOK_SECRET = 'secret';
      const result = github.getWebhook('push', 'delivery', 'invalidsig', { foo: 'bar' });
      expect(result).toBe(false);
    });

    it('should return a webhook object if signature is valid', () => {
      process.env.KUBERO_WEBHOOK_SECRET = 'secret';
      const crypto = require('crypto');
      const body = { repository: { ssh_url: 'ssh://repo' }, ref: 'refs/heads/main' };
      const hash = 'sha256=' + crypto.createHmac('sha256', 'secret').update(JSON.stringify(body)).digest('hex');
      const result = github.getWebhook('push', 'delivery', hash, body);
      expect(result).toHaveProperty('verified', true);
      expect(result).toHaveProperty('repo');
    });
  });

  describe('listRepos', () => {
    it('should return a list of repo ssh_urls', async () => {
      octokitMock.request.mockResolvedValueOnce({
        data: [{ ssh_url: 'ssh://repo1' }, { ssh_url: 'ssh://repo2' }],
      });
      const result = await github.listRepos();
      expect(result).toEqual(['ssh://repo1', 'ssh://repo2']);
    });
  });

  describe('getBranches', () => {
    it('should return a list of branch names', async () => {
      octokitMock.request.mockResolvedValueOnce({
        data: [{ name: 'main' }, { name: 'dev' }],
      });
      const result = await github.getBranches('git@host:owner/repo.git');
      expect(result).toEqual(['main', 'dev']);
    });
  });

  describe('getReferences', () => {
    it('should return a list of branch, tag, and commit names', async () => {
      octokitMock.request
        .mockResolvedValueOnce({ data: [{ name: 'main' }] }) // branches
        .mockResolvedValueOnce({ data: [{ name: 'v1.0.0' }] }) // tags
        .mockResolvedValueOnce({ data: [{ sha: 'abc123' }] }); // commits
      const result = await github.getReferences('git@host:owner/repo.git');
      expect(result).toEqual(['main', 'v1.0.0', 'abc123']);
    });
  });

  describe('getPullrequests', () => {
    it('should return a list of pull requests', async () => {
      octokitMock.request.mockResolvedValueOnce({
        data: [
          {
            html_url: 'url',
            number: 1,
            title: 'PR',
            state: 'open',
            draft: false,
            user: { login: 'user', avatar_url: 'avatar' },
            created_at: '2020-01-01T00:00:00Z',
            updated_at: '2020-01-01T00:00:00Z',
            closed_at: null,
            merged_at: null,
            locked: false,
            head: { ref: 'main', repo: { ssh_url: 'ssh://repo' } },
          },
        ],
      });
      const result = await github.getPullrequests('git@host:owner/repo.git');
      expect(result.length).toBe(1);
      expect(result[0].number).toBe(1);
      expect(result[0].branch).toBe('main');
    });
  });
});