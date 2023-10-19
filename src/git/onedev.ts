import debug from 'debug';
import * as crypto from "crypto"
import { Repo } from "./repo";
import { IWebhook, IRepository, IWebhookR, IDeploykeyR, IPullrequest} from './types';
import axios from 'axios';
import { OneDevWrapper } from '../wrappers/onedev';
debug('app:kubero:onedev:api')

export class OneDevApi extends Repo {
  private onedev: OneDevWrapper;

  constructor(baseURL: string, username: string, token: string) {
    super("onedev");
    this.onedev = new OneDevWrapper(baseURL, username, token);
  }

  private async getProjectIdFromURL(oneDevUrl: string): Promise<number | null> {
    let projectNameWithParents = '';
    const parts = oneDevUrl.split('/');

    for (let i = 1; i < parts.length; ++i) { // starting from 1 since 0th element would be baseURL
      if (parts[i].startsWith('~')) break;
      projectNameWithParents += '/' + parts[i];
    }

    projectNameWithParents = projectNameWithParents.slice(1);

    // getting projectIds of all the parents since there can be multiple projects with a single name
    let parentId: number | null = null;

    projectNameWithParents.split('/').forEach(async (projectName: string, idx: number): Promise<void> => {
      // no need of try-catch here since the wrapper handles that
      const projects = await this.onedev.getProjectsFromName(projectName, parentId); // since the parentId of a top level project is null
      console.log('projects', projects);

      if (!projects || projects.length === 0) throw new Error(`Project with name ${projectName} and parentId ${parentId} not found`);
      else if (projects.length > 1) throw new Error(`Multilple projects with name ${projectName} and parentId ${parentId} found, kindly provide the projectId directly.`);

      parentId = projects[0].id;
    });

    return parentId;
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
      }
    }

    const projectId = await this.getProjectIdFromURL(gitrepo);

    if (projectId === null || projectId === undefined) {
      ret.status = 404;
      ret.statusText = 'not found';
      return ret;
    };

    const projectInfo = await this.onedev.getProjectInfoByProjectId(projectId);

    // TODO: Need to discuss this with kubero's maintainer and if possible review onedev's API with them to make sure we get everything we need
    ret = {
      status: 200,
      statusText: 'found',
      data: {
        id: projectId,
        name: projectInfo.name,
        description: projectInfo.description,
        owner: this.onedev.username,
        push: true,
        admin: true,
        default_branch: await this.onedev.getRepositoryDefaultBranch(projectId),
      }
    }

    return ret;
  }

  protected async addWebhook(owner: string, repo: string, url: string, secret: string): Promise<IWebhookR> {

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
      }
    }

    //https://try.gitea.io/api/swagger#/repository/repoListHooks
    const webhooksList = await this.onedev.repoListHooks(owner, repo) //TODO: Needs to be implemented
      .catch((error: any) => {
        console.log(error)
        return ret;
      })

    // try to find the webhook
    for (let webhook of webhooksList.data) {
      if (webhook.config.url === url &&
        webhook.config.content_type === 'json' &&
        webhook.active === true) {
        ret = {
          status: 422,
          statusText: 'found',
          data: webhook,
        }
        return ret;
      }
    }
    //console.log(webhooksList)

    // create the webhook since it does not exist
    try {

      let res = await this.onedev.repoCreateHook(owner, repo, { //TODO: Needs to be implemented
        active: true,
        config: {
          url: url,
          content_type: "json",
          secret: secret,
          insecure_ssl: '0'
        },
        events: [
          "push",
          "pull_request"
        ],
        type: "gitea"
      });

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
        }
      }
    } catch (e) {
      console.log(e)
    }
    return ret;
  }


  protected async addDeployKey(owner: string, repo: string): Promise<IDeploykeyR> {

    const keyPair = this.createDeployKeyPair();

    const title: string = "bot@kubero." + crypto.randomBytes(4).toString('hex');

    let ret: IDeploykeyR = {
      status: 500,
      statusText: 'error',
      data: {
        id: 0,
        title: title,
        verified: false,
        created_at: new Date().toISOString(),
        url: '',
        read_only: true,
        pub: keyPair.pubKeyBase64,
        priv: keyPair.privKeyBase64
      }
    }

    try {
      let res = await this.onedev.repoCreateKey(owner, repo, {  // TODO: repo and owner are the same in onedev
        title: title,
        key: keyPair.pubKey,
        read_only: true
      });

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
          priv: keyPair.privKeyBase64
        }
      }
    } catch (e) {
      console.log(e)
    }

    return ret
  }

  public getWebhook(event: string, delivery: string, signature: string, body: any): IWebhook | boolean {
    //https://docs.github.com/en/developers/webhooks-and-events/webhooks/securing-your-webhooks
    let secret = process.env.KUBERO_WEBHOOK_SECRET as string;
    let hash = 'sha256=' + crypto.createHmac('sha256', secret).update(JSON.stringify(body, null, '  ')).digest('hex')

    let verified = false;
    if (hash === signature) {
      debug.debug('Gitea webhook signature is valid for event: ' + delivery);
      verified = true;
    } else {
      debug.log('ERROR: invalid signature for event: ' + delivery);
      debug.log('Hash:      ' + hash);
      debug.log('Signature: ' + signature);
      verified = false;
      return false;
    }

    let branch: string = 'main';
    let ssh_url: string = '';
    let action;
    if (body.pull_request == undefined) {
      let ref = body.ref
      let refs = ref.split('/')
      branch = refs[refs.length - 1]
      ssh_url = body.repository.ssh_url
    } else if (body.pull_request != undefined) {
      action = body.action,
        branch = body.pull_request.head.ref
      ssh_url = body.pull_request.head.repo.ssh_url
    } else {
      ssh_url = body.repository.ssh_url
    }

    try {
      let webhook: IWebhook = {
        repoprovider: 'gitea',
        action: action,
        event: event,
        delivery: delivery,
        body: body,
        branch: branch,
        verified: verified,
        repo: {
          ssh_url: ssh_url,
        }
      }

      return webhook;
    } catch (error) {
      console.log(error)
      return false;
    }
  }

  public async getBranches(gitrepo: string): Promise<string[]> {
    // no need of try-catch here since the wrapper takes care of that
    let projectId = await this.getProjectIdFromURL(gitrepo);
    if (projectId === null || projectId === undefined) throw new Error('Failed to get projectId for project');

    return await this.onedev.getProjectBranches(projectId as number);
  }

  public async listRepos(): Promise<string[]> {
    let ret: string[] = [];
    try {
        const repos = await this.onedev.userCurrentListRepos() // TODO: needs to be implemented
        for (let repo of repos.data) {
            ret.push(repo.ssh_url)
        }
    } catch (error) {
        console.log(error)
    }
    return ret;
}

  public async getPullrequests(gitrepo: string): Promise<IPullrequest[]>{

    // send an empty list for now
    let ret: IPullrequest[] = [];

    return ret;
  }

}
