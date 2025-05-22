import { Repo } from './repo';
import { IDeploykeyR, IRepository, IWebhookR } from './types';
import { GithubApi } from './github';
import { GogsApi } from './gogs';
import { GitlabApi } from './gitlab';
import { BitbucketApi } from './bitbucket';
import { GiteaApi } from './gitea';
class TestRepo extends Repo {
  public addDeployKey = jest.fn().mockResolvedValue({ status: 201, statusText: 'created', data: {} });
  public getRepository = jest.fn().mockResolvedValue({
    status: 200,
    data: { admin: true, owner: 'owner', name: 'repo' },
  });
  public addWebhook = jest.fn().mockResolvedValue({ status: 201, statusText: 'created', data: {} });
  public getWebhook = jest.fn();
  public getBranches = jest.fn();
  public getReferences = jest.fn();
  public getPullrequests = jest.fn();
}

describe('Repo', () => {
  let repo: TestRepo;

  beforeEach(() => {
    repo = new TestRepo('test');
    process.env.KUBERO_WEBHOOK_SECRET = 'secret';
    process.env.KUBERO_WEBHOOK_URL = 'http://webhook.url';
  });

  afterEach(() => {
    delete process.env.KUBERO_WEBHOOK_SECRET;
    delete process.env.KUBERO_WEBHOOK_URL;
    jest.clearAllMocks();
  });

  it('should set repoProvider', () => {
    expect(repo['repoProvider']).toBe('test');
  });

  it('should create a deploy key pair', () => {
    const keyPair = repo['createDeployKeyPair']();
    expect(keyPair).toHaveProperty('pubKey');
    expect(keyPair).toHaveProperty('privKey');
    expect(keyPair).toHaveProperty('pubKeyBase64');
    expect(keyPair).toHaveProperty('privKeyBase64');
    expect(keyPair).toHaveProperty('fingerprint');
  });

  it('should throw if KUBERO_WEBHOOK_SECRET is not set', async () => {
    delete process.env.KUBERO_WEBHOOK_SECRET;
    await expect(repo.connectRepo('git@host:owner/repo.git')).rejects.toThrow('KUBERO_WEBHOOK_SECRET is not defined');
  });

  it('should throw if KUBERO_WEBHOOK_URL is not set', async () => {
    delete process.env.KUBERO_WEBHOOK_URL;
    await expect(repo.connectRepo('git@host:owner/repo.git')).rejects.toThrow('KUBERO_WEBHOOK_URL is not defined');
  });

  it('should connectRepo and return keys, repository, webhook', async () => {
    const result = await repo.connectRepo('git@host:owner/repo.git');
    expect(result.keys).toBeDefined();
    expect(result.repository).toBeDefined();
    expect(result.webhook).toBeDefined();
    expect(repo.getRepository).toHaveBeenCalled();
    expect(repo.addWebhook).toHaveBeenCalled();
    expect(repo.addDeployKey).toHaveBeenCalled();
  });

  it('should disconnectRepo and return true', async () => {
    const result = await repo.disconnectRepo('git@host:owner/repo.git');
    expect(result).toBe(true);
  });

  it('should parse repo correctly', () => {
    const parsed = repo['parseRepo']('git@github.com:owner/repo.git');
    expect(parsed.owner).toBe('owner');
    expect(parsed.repo).toBe('repo');
  });
});

describe('GithubApi', () => {
  it('should load config', () => {
    const github = new GithubApi('', 'token');
    expect(github).toBeTruthy();
  });
});

describe('GogsApi', () => {
  it('should load config', () => {
    const gogs = new GogsApi('http://localhost:3000', 'token');
    expect(gogs).toBeTruthy();
  });
});

describe('GitlabApi', () => {
  it('should load config', () => {
    const gitlab = new GitlabApi('https://gitlab.com', 'token');
    expect(gitlab).toBeTruthy();
  });
});

describe('GiteaApi', () => {
  it('should load config', () => {
    const gitea = new GiteaApi('https://codeberg.org', 'token');
    expect(gitea).toBeTruthy();
  });
});

describe('Bitbucket', () => {
  it('should load config', () => {
    const bitbucket = new BitbucketApi('username', 'password');
    expect(bitbucket).toBeTruthy();
  });
});
