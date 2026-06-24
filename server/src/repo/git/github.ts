import debug from 'debug';
import * as crypto from 'crypto';
import {
  IWebhook,
  IRepository,
  IWebhookR,
  IDeploykeyR,
  IPullrequest,
} from './types';
import { Repo } from './repo';
import gitUrlParse = require('git-url-parse');
debug('app:kubero:github:api');

//const { Octokit } = require("@octokit/core");
import { Octokit } from '@octokit/core';
import { RequestError } from '@octokit/types';

export class GithubApi extends Repo {
  private octokit: any;

  constructor(baseUrl: string, token: string) {
    super('github');

    if (baseUrl === '') {
      baseUrl = 'https://api.github.com';
    }

    this.octokit = new Octokit({
      auth: token,
      baseUrl: baseUrl,
    });
  }

  protected async getRepository(gitrepo: string): Promise<IRepository> {
    let ret: IRepository = {
      status: 500,
      statusText: 'error',
      data: {
        owner: 'unknown',
        name: 'unknown',
        admin: false,
        push: false,
      },
    };

    const parsed = gitUrlParse(gitrepo);
    const repo = parsed.name;
    const owner = parsed.owner;

    try {
      const res = await this.octokit.request('GET /repos/{owner}/{repo}', {
        owner: owner,
        repo: repo,
      });
      //console.log(res.data);

      ret = {
        status: res.status,
        statusText: 'found',
        data: {
          id: res.data.id,
          node_id: res.data.node_id,
          name: res.data.name,
          description: res.data.description,
          owner: res.data.owner.login,
          private: res.data.private,
          ssh_url: res.data.ssh_url,
          clone_url: res.data.clone_url,
          language: res.data.language,
          homepage: res.data.homepage,
          admin: res.data.permissions.admin,
          push: res.data.permissions.push,
          visibility: res.data.visibility,
          default_branch: res.data.default_branch,
        },
      };
    } catch (e) {
      const res = e as RequestError;
      this.logger.log('Repository not found: ' + gitrepo);
      ret = {
        status: res.status,
        statusText: 'not found',
        data: {
          owner: owner,
          name: repo,
          admin: false,
          push: false,
        },
      };
    }
    return ret;
  }

  public async getRepositories() {
    const res = await this.octokit.request('GET /user/repos', {});
    return res.data;
  }

  /*

    public async getRepositoryCommits(owner: string, repo: string, branch: string) {
        return await this.octokit.git.listCommits({
            owner: owner,
            repo: repo,
            sha: branch
        });
    }
*/
  protected async addWebhook(
    owner: string,
    repo: string,
    url: string,
    secret: string,
  ): Promise<IWebhookR> {
    let ret: IWebhookR = {
      status: 500,
      statusText: 'error',
      data: {
        id: 0,
        active: false,
        created_at: '2020-01-01T00:00:00Z',
        url: '',
        insecure: true,
        events: [],
      },
    };

    try {
      const res = await this.octokit.request(
        'POST /repos/{owner}/{repo}/hooks',
        {
          owner: owner,
          repo: repo,
          active: true,
          config: {
            url: url,
            content_type: 'json',
            secret: secret,
            insecure_ssl: '0',
          },
          events: ['push', 'pull_request'],
        },
      );

      ret = {
        status: res.status,
        statusText: 'created',
        data: {
          id: res.data.id,
          active: res.data.active,
          created_at: res.data.created_at,
          url: res.data.url,
          insecure: res.data.config.insecure_ssl,
          events: res.data.events,
        },
      };
    } catch (e) {
      const res = e as RequestError;
      if (res.status === 422) {
        const existingWebhooksRes = await this.octokit.request(
          'GET /repos/{owner}/{repo}/hooks',
          {
            owner: owner,
            repo: repo,
          },
        );
        for (const webhook of existingWebhooksRes.data) {
          if (webhook.config.url === url) {
            this.logger.debug('Webhook already exists');

            ret = {
              status: res.status,
              statusText: 'created',
              data: {
                id: webhook.id,
                active: webhook.active,
                created_at: webhook.created_at,
                url: webhook.config.url,
                insecure: webhook.config.insecure_ssl,
                events: webhook.events,
              },
            };
          }
        }
      }
    }

    return ret;
  }

  protected async addDeployKey(
    owner: string,
    repo: string,
  ): Promise<IDeploykeyR> {
    const keyPair = this.createDeployKeyPair();

    let ret: IDeploykeyR = {
      status: 500,
      statusText: 'error',
      data: {
        id: 0,
        title: 'bot@kubero',
        verified: false,
        created_at: '2020-01-01T00:00:00Z',
        url: '',
        read_only: true,
        pub: keyPair.pubKeyBase64,
        priv: keyPair.privKeyBase64,
      },
    };

    try {
      const res = await this.octokit.request(
        'POST /repos/{owner}/{repo}/keys',
        {
          owner: owner,
          repo: repo,
          title: 'bot@kubero',
          key: keyPair.pubKey,
          read_only: true,
        },
      );

      ret = {
        status: res.status,
        statusText: 'created',
        data: {
          id: res.data.id,
          title: res.data.title,
          verified: res.data.verified,
          created_at: res.data.created_at,
          url: res.data.url,
          read_only: res.data.read_only,
          pub: keyPair.pubKeyBase64,
          priv: keyPair.privKeyBase64,
        },
      };
    } catch (e) {
      const res = e as RequestError;
      this.logger.log('Error adding deploy key: ' + res);
    }

    return ret;
  }

  public getWebhook(
    event: string,
    delivery: string,
    signature: string,
    body: any,
  ): IWebhook | boolean {
    //https://docs.github.com/en/developers/webhooks-and-events/webhooks/securing-your-webhooks
    const secret = process.env.KUBERO_WEBHOOK_SECRET as string;
    const hash =
      'sha256=' +
      crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(body))
        .digest('hex');

    let verified = false;
    if (hash === signature) {
      debug.debug('Github webhook signature is valid for event: ' + delivery);
      verified = true;
    } else {
      this.logger.log('ERROR: invalid signature for event: ' + delivery);
      this.logger.log('Hash:      ' + hash);
      this.logger.log('Signature: ' + signature);
      verified = false;
      return false;
    }

    let branch: string = 'main';
    let ssh_url: string = '';
    let action;
    if (body.ref != undefined) {
      const ref = body.ref;
      const refs = ref.split('/');
      branch = refs[refs.length - 1];
      ssh_url = body.repository.ssh_url;
    } else if (body.pull_request != undefined) {
      ((action = body.action), (branch = body.pull_request.head.ref));
      ssh_url = body.pull_request.head.repo.ssh_url;
    } else {
      ssh_url = body.repository.ssh_url;
    }

    try {
      const webhook: IWebhook = {
        repoprovider: 'github',
        action: action,
        event: event,
        delivery: delivery,
        body: body,
        branch: branch,
        verified: verified,
        repo: {
          ssh_url: ssh_url,
        },
      };

      return webhook;
    } catch (error) {
      this.logger.log(error);
      return false;
    }
  }

  public async listRepos(): Promise<string[]> {
    const ret: string[] = [];
    try {
      const repos = await this.octokit.request('GET /user/repos', {
        visibility: 'all',
        per_page: 100,
        sort: 'updated',
      });
      for (const repo of repos.data) {
        ret.push(repo.ssh_url);
      }
    } catch (error) {
      this.logger.log(error);
    }
    return ret;
  }

  public async getBranches(gitrepo: string): Promise<string[]> {
    const ret: string[] = [];

    const { repo, owner } = this.parseRepo(gitrepo);

    try {
      const branches = await this.octokit.request(
        'GET /repos/{owner}/{repo}/branches',
        {
          owner: owner,
          repo: repo,
        },
      );
      for (const branch of branches.data) {
        ret.push(branch.name);
      }
    } catch (error) {
      this.logger.log(error);
    }

    return ret;
  }

  public async getReferences(gitrepo: string): Promise<string[]> {
    const ret: string[] = [];

    const { repo, owner } = this.parseRepo(gitrepo);

    try {
      const branches = await this.octokit.request(
        'GET /repos/{owner}/{repo}/branches',
        {
          owner: owner,
          repo: repo,
        },
      );
      for (const branch of branches.data) {
        ret.push(branch.name);
      }
    } catch (error) {
      this.logger.log(error);
    }

    try {
      const tags = await this.octokit.request(
        'GET /repos/{owner}/{repo}/tags',
        {
          owner: owner,
          repo: repo,
        },
      );
      for (const tag of tags.data) {
        ret.push(tag.name);
      }
    } catch (error) {
      this.logger.log(error);
    }

    try {
      const commits = await this.octokit.request(
        'GET /repos/{owner}/{repo}/commits',
        {
          owner: owner,
          repo: repo,
        },
      );
      for (const commit of commits.data) {
        ret.push(commit.sha);
      }
    } catch (error) {
      this.logger.log(error);
    }

    return ret;
  }

  public async getPullrequests(gitrepo: string): Promise<IPullrequest[]> {
    const ret: IPullrequest[] = [];

    const { repo, owner } = this.parseRepo(gitrepo);

    try {
      const pulls = await this.octokit.request(
        'GET /repos/{owner}/{repo}/pulls',
        {
          owner: owner,
          repo: repo,
          state: 'open',
        },
      );
      //console.log(pulls)
      for (const pr of pulls.data) {
        const p: IPullrequest = {
          html_url: pr.html_url,
          number: pr.number,
          title: pr.title,
          state: pr.state,
          draft: pr.draft,
          user: {
            login: pr.user.login,
            avatar_url: pr.user.avatar_url,
          },
          created_at: pr.created_at,
          updated_at: pr.updated_at,
          closed_at: pr.closed_at,
          merged_at: pr.merged_at,
          locked: pr.locked,
          branch: pr.head.ref,
          ssh_url: pr.head.repo.ssh_url,
        };
        ret.push(p);
      }
    } catch (error) {
      this.logger.log(error);
    }

    return ret;
  }
}
