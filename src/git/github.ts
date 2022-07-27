import { debug } from "debug";
debug('app:kubero:github:api')

//const { Octokit } = require("@octokit/core");
import { Octokit } from "@octokit/core"
import { RequestError } from '@octokit/types';

export class GithubApi {
    private octokit: any;

    constructor(token: string) {
        this.octokit = new Octokit({
            auth: token
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
                language: "",
            }
        }
        // TODO : Improve matching here
        let owner = gitrepo.match(/^git@github.com:(.*)\/.*$/)?.[1] as string;
        let repo = gitrepo.match(/^git@github.com:.*\/(.*).git$/)?.[1] as string;

        let res = await this.octokit.request('GET /repos/{owner}/{repo}', {
            owner: owner,
            repo: repo,
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
                language: res.data.language,
            }
        }
        return ret;
    }

    public async getRepositories() {
        let res = await this.octokit.request('GET /user/repos', {})
        return res.data;
    }

/*
    public async getRepositoryBranches(owner: string, repo: string) {
        return await this.octokit.git.listBranches({
            owner: owner,
            repo: repo
        });
    }

    public async getRepositoryCommits(owner: string, repo: string, branch: string) {
        return await this.octokit.git.listCommits({
            owner: owner,
            repo: repo,
            sha: branch
        });
    }
*/
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
        
        try {
            let res = await this.octokit.request('POST /repos/{owner}/{repo}/hooks', {
                owner: owner,
                repo: repo,
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
                ]
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
            let res = e as RequestError;
            if (res.status === 422) {
                let existingWebhooksRes = await this.octokit.request('GET /repos/{owner}/{repo}/hooks', {
                    owner: owner,
                    repo: repo,
                })
                for (let webhook of existingWebhooksRes.data) {
                    if (webhook.config.url === url) {
                        debug.log("Webhook already exists");
                        
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
                            }
                        }
                    }
                }
            }
            return ret;
        }
    }

    public async addDeployKey(owner: string, repo: string, key: string) {

        let ret = {
            status: 500,
            statusText: 'error',
            data: {
                id: 0,
                title: "bot@kubero",
                verified: false,
                created_at: '2020-01-01T00:00:00Z',
                url: '',
                read_only: true,
            }
        }

        try {
            let res = await this.octokit.request('POST /repos/{owner}/{repo}/keys', {
                owner: owner,
                repo: repo,
                title: "bot@kubero",
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
            let res = e as RequestError;

            if (res.status === 422) {
                let existingKeyres = await this.octokit.request('GET /repos/{owner}/{repo}/keys', {
                    owner: owner,
                    repo: repo,
                })
                for (let key of existingKeyres.data) {
                    if (key.title === "bot@kubero") {
                        debug.log("key already exists");
                        
                        ret = {
                            status: res.status,
                            statusText: 'created',
                            data: {
                                id: key.id,
                                title: key.title,
                                verified: key.verified,
                                created_at: key.created_at,
                                url: key.url,
                                read_only: key.read_only,
                            }
                        }
                    }
                }
            }
        }

        return ret
    }
}