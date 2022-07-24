import { debug } from "debug";
debug('app:kubero:gitea:api')

//https://www.npmjs.com/package/gitea-js
import { giteaApi } from "gitea-js"
import { fetch as fetchGitea } from 'cross-fetch';

export class GiteaApi {
    private gitea: any;

    constructor(baseURL: string, token: string) {
        this.gitea = giteaApi(baseURL, {
            token: token,
            customFetch: fetchGitea,
        });
    }

    public async getRepository(gitrepo: string) {
        let ret = {
            status: 500,
            statusText: 'error',
            data: {
                id: 0,
                node_id: "",
                name: "",
                description: "",
                owner: "",
                private : false,
                ssh_url: "",
            }
        }
        // TODO : Improve matching here
        let owner = gitrepo.match(/^git@.*:(.*)\/.*$/)?.[1] as string;
        let repo = gitrepo.match(/^git@.*:.*\/(.*)\.git$/)?.[1] as string;

        let res = await this.gitea.repos.repoGet(owner, repo)
        .catch((error: any) => {
            console.log(error)
            return ret;
        })

        ret = {
            status: res.status,
            statusText: 'found',
            data: {
                id: res.data.id,
                node_id: res.data.node_id,
                name: res.data.name,
                description: res.data.description,
                owner: res.data.owner.login,
                private : res.data.private,
                ssh_url: res.data.ssh_url,
            }
        }
        return ret;

    }

    public async addWebhook(owner: string, repo: string, url: string, secret: string) {
        
        let ret = {
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
        const webhooksList = await this.gitea.repos.repoListHooks(owner, repo)
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

            //https://try.gitea.io/api/swagger#/repository/repoCreateHook
            let res = await this.gitea.repos.repoCreateHook(owner, repo, {
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


    public async addDeployKey(owner: string, repo: string, key: string) {

        const title: string = "bot@kubero";
        let ret = {
            status: 500,
            statusText: 'error',
            data: {
                id: 0,
                title: title,
                verified: false,
                created_at: '2020-01-01T00:00:00Z',
                url: '',
                read_only: true,
            }
        }
        //https://try.gitea.io/api/swagger#/repository/repoListKeys
        const keysList = await this.gitea.repos.repoListKeys(owner, repo)
        .catch((error: any) => {
            console.log(error)
            return ret;
        })

        // try to find the key
        for (let key of keysList.data) {
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
            //https://try.gitea.io/api/swagger#/repository/repoCreateKey
            let res = await this.gitea.repos.repoCreateKey(owner, repo, {
                title: title,
                key: key,
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
                }
            }
        } catch (e) {
            console.log(e)
        }

        return ret
    }
}
