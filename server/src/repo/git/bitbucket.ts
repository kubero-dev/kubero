import debug from 'debug';
import {
  IWebhook,
  IRepository,
  IWebhookR,
  IDeploykeyR,
  IPullrequest,
} from './types';
import { Repo } from './repo';
import gitUrlParse = require('git-url-parse');
debug('app:kubero:bitbucket:api');

import { Bitbucket, APIClient } from 'bitbucket';
import { RequestError } from '@octokit/types';
import { Logger } from '@nestjs/common';

export class BitbucketApi extends Repo {
  private bitbucket: APIClient;

  constructor(username: string, appPassword: string) {
    super('bitbucket');
    const clientOptions = {
      notice: false,
      auth: {
        username: username,
        password: appPassword,
      },
    };

    if (process.env.BITBUCKET_USERNAME && process.env.BITBUCKET_APP_PASSWORD) {
      Logger.log('✅  BitBucket enabled', 'Feature');
      this.bitbucket = new Bitbucket(clientOptions);
    } else {
      this.bitbucket = new Bitbucket();
      Logger.log(
        '☑️ BitBucket disabled: No BITBUCKET_USERNAME or BITBUCKET_APP_PASSWORD set',
        'Feature',
      );
    }
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

    //console.log(owner, repo);
    try {
      // https://bitbucketjs.netlify.app/#api-repositories-repositories_get
      const res = await this.bitbucket.repositories.get({
        repo_slug: repo,
        workspace: owner,
      });
      //console.log(res.data);

      ret = {
        status: res.status,
        statusText: 'found',
        data: {
          id: res.data.uuid,
          node_id: res.data.full_name as string,
          name: res.data.slug as string,
          description: res.data.description,
          owner: res.data.owner?.nickname as string,
          private: res.data.is_private,
          ssh_url: res.data.links?.clone?.find((c: any) => c.name === 'ssh')
            ?.href as string,
          clone_url: res.data.links?.clone?.find((c: any) => c.name === 'https')
            ?.href as string,
          language: res.data.language,
          homepage: res.data.website as string,
          admin: true, // assumed since we ar loading only owned repos
          push: true, // assumed since we ar loading only owned repos
          //visibility: res.data.visibility,
          default_branch: res.data.mainbranch?.name as string,
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
    const res = await this.bitbucket.request('GET /user/repos', {});
    return res.data;
  }

  protected async addWebhook(
    owner: string,
    repo: string,
    url: string,
    _secret: string,
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

    const webhooksList = await this.bitbucket.repositories.listWebhooks({
      repo_slug: repo,
      workspace: owner,
    });

    const webhook = webhooksList.data.values?.find((w: any) => w.url === url);
    if (webhook == undefined) {
      try {
        const res = await this.bitbucket.repositories.createWebhook({
          repo_slug: repo,
          workspace: owner,
          _body: {
            description: 'Kubero webhook',
            url: url,
            active: true,
            //skip_cert_verification: false,
            events: ['pullrequest:created', 'repo:push'],
          },
        });
        ret = {
          status: 201,
          statusText: 'created',
          data: {
            id: res.data.uuid as string,
            active: res.data.active as boolean,
            created_at: res.data.created_at as string,
            url: res.data.url as string,
            insecure: !res.data.skip_cert_verification,
            events: res.data.events as string[],
          },
        };
      } catch (e) {
        this.logger.error(e);
      }
    } else {
      this.logger.debug('Webhook already exists');

      ret = {
        status: 422,
        statusText: 'created',
        data: {
          id: webhook.uuid as string,
          active: webhook.active as boolean,
          created_at: webhook.created_at as string,
          url: webhook.url as string,
          insecure: !webhook.skip_cert_verification,
          events: webhook.events as string[],
        },
      };
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
      // https://bitbucketjs.netlify.app/#api-repositories-repositories_createDeployKey
      const res = await this.bitbucket.repositories.createDeployKey({
        label: 'bot@kubero',
        key: keyPair.pubKey,
        repo_slug: repo,
        workspace: owner,
      });

      //console.log(res);

      ret = {
        status: res.status,
        statusText: 'created',
        data: {
          id: res.data.id as number,
          title: res.data.label as string,
          verified: true,
          created_at: res.data.created_on as string,
          url: '',
          read_only: false,
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
    body: any,
  ): IWebhook | boolean {
    // use github and gitea naming for the event
    let github_event = event;
    if (event === 'repo:push') {
      github_event = 'push';
    } else if (event === 'pullrequest:created') {
      github_event = 'pull_request';
    } else {
      this.logger.log('ERROR: untranslated Bitbucket event: ' + event);
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
        repoprovider: 'bitbucket',
        action: action,
        event: github_event,
        delivery: delivery,
        body: body,
        branch: branch,
        verified: true, // bitbucket does not support verification with signatures :(
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
      // https://bitbucketjs.netlify.app/#api-repositories-repositories_listGlobal
      const repos = await this.bitbucket.repositories.listGlobal({
        role: 'member',
      });

      if (repos.data.values != undefined) {
        for (const repo of repos.data.values) {
          if (repo.links != undefined && repo.links.clone != undefined) {
            ret.push(repo.links.clone[1].href as string);
          }
        }
      }
    } catch (error) {
      this.logger.log(error);
    }
    return ret;
  }

  public async getBranches(gitrepo: string): Promise<string[]> {
    //https://bitbucketjs.netlify.app/#api-repositories-repositories_listBranches

    const { repo, owner } = this.parseRepo(gitrepo);

    try {
      const branches = await this.bitbucket.repositories.listBranches({
        repo_slug: repo,
        workspace: owner,
        sort: '-name',
      });
      if (branches.data.values != undefined) {
        return branches.data.values.map((branch: any) => branch.name);
      }
    } catch (error) {
      this.logger.log(error);
    }

    return [];
  }

  public async getReferences(gitrepo: string): Promise<string[]> {
    let ret: string[] = [];

    const { repo, owner } = this.parseRepo(gitrepo);

    try {
      const branches = await this.bitbucket.repositories.listBranches({
        repo_slug: repo,
        workspace: owner,
        sort: '-name',
      });
      if (branches.data.values != undefined) {
        ret = branches.data.values.map((branch: any) => branch.name);
      }
    } catch (error) {
      this.logger.log(error);
    }

    try {
      const tags = await this.bitbucket.repositories.listTags({
        repo_slug: repo,
        workspace: owner,
        sort: '-name',
      });
      if (tags.data.values != undefined) {
        ret = ret.concat(tags.data.values.map((tag: any) => tag.name));
      }
    } catch (error) {
      this.logger.log(error);
    }

    try {
      const commits = await this.bitbucket.repositories.listCommits({
        repo_slug: repo,
        workspace: owner,
        sort: '-date',
      });
      if (commits.data.values != undefined) {
        ret = ret.concat(commits.data.values.map((commit: any) => commit.hash));
      }
    } catch (error) {
      this.logger.log(error);
    }

    return ret;
  }

  public async getPullrequests(_gitrepo: string): Promise<IPullrequest[]> {
    const ret: IPullrequest[] = [];

    return ret;
  }
}
