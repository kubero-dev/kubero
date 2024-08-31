import debug from 'debug';
import { GithubApi } from '../git/github';
import { BitbucketApi } from '../git/bitbucket';
import { GiteaApi } from '../git/gitea';
import { GogsApi } from '../git/gogs';
import { GitlabApi } from '../git/gitlab';
import { IPullrequest } from '../git/types';

export class Repositories {
    private githubApi: GithubApi;
    private giteaApi: GiteaApi;
    private gogsApi: GogsApi;
    private gitlabApi: GitlabApi;
    private bitbucketApi: BitbucketApi;

    constructor() {
        this.giteaApi = new GiteaApi(process.env.GITEA_BASEURL as string, process.env.GITEA_PERSONAL_ACCESS_TOKEN as string);
        this.gogsApi = new GogsApi(process.env.GOGS_BASEURL as string, process.env.GOGS_PERSONAL_ACCESS_TOKEN as string);
        this.githubApi = new GithubApi(process.env.GITHUB_PERSONAL_ACCESS_TOKEN as string);
        this.gitlabApi = new GitlabApi(process.env.GITLAB_BASEURL as string, process.env.GITLAB_PERSONAL_ACCESS_TOKEN as string);
        this.bitbucketApi = new BitbucketApi(process.env.BITBUCKET_USERNAME as string, process.env.BITBUCKET_APP_PASSWORD as string);
    }

    public async listReferences(repoProvider: string, repoB64: string ): Promise<string[]> {
        //return this.git.listRepoBranches(repo, repoProvider);
        let ref: Promise<string[]> = new Promise((resolve, reject) => {
            resolve([]);
        });

        const repo = Buffer.from(repoB64, 'base64').toString('ascii');

        switch (repoProvider) {
            case 'github':
                ref = this.githubApi.getReferences(repo);
                break;
            case 'gitea':
                ref = this.giteaApi.getReferences(repo);
                break;
            case 'gogs':
                ref = this.gogsApi.getReferences(repo);
                break;
            case 'gitlab':
                ref = this.gitlabApi.getReferences(repo);
                break;
            case 'bitbucket':
                ref = this.bitbucketApi.getReferences(repo);
                break;
            case 'onedev':
            default:
                break;
        }

        return ref
    }

    public async listRepos(repoProvider: string) {
        debug.log('listRepos: '+repoProvider);

        switch (repoProvider) {
            case 'github':
                return this.githubApi.listRepos();
            case 'gitea':
                return this.giteaApi.listRepos();
            case 'gogs':
                return this.gogsApi.listRepos();
            case 'gitlab':
                return this.gitlabApi.listRepos();
            case 'bitbucket':
                return this.bitbucketApi.listRepos();
            case 'onedev':
            default:
                return {'error': 'unknown repo provider'};
        }
    }

    public async connectRepo(repoProvider: string, repoAddress: string) {
        debug.log('connectRepo: '+repoProvider+' '+repoAddress);

        switch (repoProvider) {
            case 'github':
                return this.githubApi.connectRepo(repoAddress);
            case 'gitea':
                return this.giteaApi.connectRepo(repoAddress);
            case 'gogs':
                return this.gogsApi.connectRepo(repoAddress);
            case 'gitlab':
                return this.gitlabApi.connectRepo(repoAddress);
            case 'bitbucket':
                return this.bitbucketApi.connectRepo(repoAddress);
            case 'onedev':
            default:
                return {'error': 'unknown repo provider'};
        }
    }

    public async listRepoBranches(repoProvider: string, repoB64: string ): Promise<string[]> {
        //return this.git.listRepoBranches(repo, repoProvider);
        let branches: Promise<string[]> = new Promise((resolve, reject) => {
            resolve([]);
        });

        const repo = Buffer.from(repoB64, 'base64').toString('ascii');

        switch (repoProvider) {
            case 'github':
                branches = this.githubApi.getBranches(repo);
                break;
            case 'gitea':
                branches = this.giteaApi.getBranches(repo);
                break;
            case 'gogs':
                branches = this.gogsApi.getBranches(repo);
                break;
            case 'gitlab':
                branches = this.gitlabApi.getBranches(repo);
                break;
            case 'bitbucket':
                branches = this.bitbucketApi.getBranches(repo);
                break;
            case 'onedev':
            default:
                break;
        }

        return branches
    }

    public async listRepoPullrequests(repoProvider: string, repoB64: string ): Promise<IPullrequest[]> {
        //return this.git.listRepoBranches(repo, repoProvider);
        let pulls: Promise<IPullrequest[]> = new Promise((resolve, reject) => {
            resolve([]);
        });

        const repo = Buffer.from(repoB64, 'base64').toString('ascii');

        switch (repoProvider) {
            case 'github':
                pulls = this.githubApi.getPullrequests(repo);
                break;
            case 'gitea':
                pulls = this.giteaApi.getPullrequests(repo);
                break;
            case 'gogs':
                pulls = this.gogsApi.getPullrequests(repo);
                break;
            case 'gitlab':
                pulls = this.gitlabApi.getPullrequests(repo);
                break;
            case 'bitbucket':
                pulls = this.bitbucketApi.getPullrequests(repo);
                break;
            case 'onedev':
            default:
                break;
        }

        return pulls
    }
}