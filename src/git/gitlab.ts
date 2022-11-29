// https://www.nerd.vision/post/nerdvision-gitlab-js-an-easier-way-to-access-the-gitlab-api-in-javascript
// https://www.npmjs.com/package/@nerdvision/gitlab-js
import debug from 'debug';
import * as crypto from "crypto"
import { IWebhook, IRepository, IWebhookR, IDeploykeyR} from './types';
import { Repo } from './repo';
import {Client as GitlabClient} from '@nerdvision/gitlab-js';
import {Options} from 'got';


export class GitlabApi extends Repo {
    private gitlab: GitlabClient;
    private opt = {
        headers: {
            'Content-Type': 'application/json',
        },
    } as Options;

    constructor(baseURL: string, token: string) {
        super("gitlab");

        this.gitlab = new GitlabClient({
            token: token,
            host: baseURL,
        });
    }

    protected async getRepository(gitrepo: string): Promise<IRepository> {
        //https://docs.gitlab.com/ee/api/projects.html
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

        // TODO : Improve matching here
        let owner = gitrepo.match(/^git@.*:(.*)\/.*$/)?.[1] as string;
        let repo = gitrepo.match(/^git@.*:.*\/(.*)\.git$/)?.[1] as string;

        let res: any = await this.gitlab.get(`projects/${owner}%2F${repo}`)
        .catch((error: any) => {
            console.log(error)
            return ret;
        })
        //console.log(res)

        res.private = false;
        if (res.visibility === 'private') {
            res.private = true;
        }

        // TODO: this is a workaround since the information is not available
        res.permissions.admin = true;
        res.permissions.push = true;

        ret = {
            status: 200,
            statusText: 'found',
            data: {
                id: res.id,
                node_id: res.path_with_namespace,
                name: res.path,
                description: res.description,
                owner: res.namespace.path,
                private : res.private,
                ssh_url: res.ssh_url_to_repo,
                language: res.language,
                homepage: res.namespace.web_url,
                admin: res.permissions.admin,
                push: res.permissions.push,
                visibility: res.visibility,
                default_branch: res.default_branch,
            }
        }
        return ret;

    }


    protected async addWebhook(owner: string, repo: string, url: string, secret: string): Promise<IWebhookR> {
        // https://docs.gitlab.com/ee/api/projects.html#list-project-hooks
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

        const webhooksList: any = await this.gitlab.get(`projects/${owner}%2F${repo}/hooks`)
        .catch((error: any) => {
            console.log(error)
            return ret;
        })
        // try to find the webhook
        for (let webhook of webhooksList) {
            if (webhook.url === url &&
                webhook.disabled_until === null) {
                ret = {
                    status: 422,
                    statusText: 'found',
                    data: {
                        id: webhook.id,
                        active: true,
                        created_at: webhook.created_at,
                        url: webhook.url,
                        insecure: false, //TODO use the inverted enable_ssl_verification field
                        events: ["pull_request", "push"],
                    }
                }
                return ret;
            }
        }

        // create the webhook since it does not exist
        try {
            let res: any = await this.gitlab.post(`projects/${owner}%2F${repo}/hooks`, JSON.stringify({
                url: url,
                token: secret,
                merge_requests_events: true,
                push_events: true,
            }),
            undefined,
            this.opt,
            );

            ret = {
                status: 201,
                statusText: 'created',
                data: {
                    id: res.id,
                    active: res.active,
                    created_at: res.created_at,
                    url: res.url,
                    insecure: false,
                    events: ["pull_request", "push"],
                }
            }
        } catch (e) {
            console.log("Failed to create Webhook")
            console.log(e)
        }
        return ret;
    }

    async addDeployKey(owner: string, repo: string): Promise<IDeploykeyR> {

        const keyPair = this.createDeployKeyPair();

        const title: string = "bot@kubero";

        let ret: IDeploykeyR = {
            status: 500,
            statusText: 'error',
            data: {
                id: 0,
                title: title,
                verified: false,
                created_at: '2020-01-01T00:00:00Z',
                url: '',
                read_only: true,
                pub: keyPair.pubKeyBase64,
                priv: keyPair.privKeyBase64
            }
        }
        // https://docs.gitlab.com/ee/api/deploy_keys.html#list-deploy-keys-for-project
        const keysList:any = await this.gitlab.get(`projects/${owner}%2F${repo}/deploy_keys`)
        .catch((error: any) => {
            console.log(error)
            return ret;
        })

        // try to find the key
        for (let key of keysList) {
            if (key.title === title &&
                key.read_only === true) {
                ret = {
                    status: 422,
                    statusText: 'found',
                    data: key,
                }
                return ret;
            }
        }

        try {
            // https://docs.gitlab.com/ee/api/deploy_keys.html#add-deploy-key
            let res:any = await this.gitlab.post(`projects/${owner}%2F${repo}/deploy_keys`, JSON.stringify({
                title: title,
                key: keyPair.pubKey,
                can_push: false
            }),
            undefined,
            this.opt,
            );

            console.log(res)

            ret = {
                status: 201,
                statusText: 'created',
                data: {
                    id: res.id,
                    title: res.title,
                    verified: res.verified,
                    created_at: res.created_at,
                    url: res.url,
                    read_only: res.read_only,
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
        let secret = process.env.KUBERO_WEBHOOK_SECRET as string;
        let hash = 'sha256='+crypto.createHmac('sha256', secret).update(JSON.stringify(body)).digest('hex')

        let verified = false;
        if (hash === signature) {
            debug.debug('Gitlab webhook signature is valid for event: '+delivery);
            verified = true;
        } else {
            debug.log('ERROR: invalid signature for event: '+delivery);
            debug.log('Hash:      '+hash);
            debug.log('Signature: '+signature);
            verified = false;
            return false;
        }

        let branch: string = 'main';
        let ssh_url: string = '';
        let action;
        if (body.ref != undefined) {
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
                repoprovider: 'gitlab',
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
            debug.log(error)
            return false;
        }
    }

    public async listRepos(): Promise<string[]> {
        let ret: string[] = [];
        const repos:any = await this.gitlab.get('projects', {})
        .catch((error: any) => {
            console.log(error)
            return ret;
        })

        for (let repo of repos) {
            ret.push(repo.ssh_url_to_repo)
        }
        return ret;
    }

}