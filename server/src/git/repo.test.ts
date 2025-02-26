import { GithubApi } from './github';
import { GogsApi } from './gogs';
import { GitlabApi } from './gitlab';
import { BitbucketApi } from './bitbucket';
import { GiteaApi } from './gitea';

describe('GithubApi', () => {
    it('should load config', () => {
        const github = new GithubApi('', "token");
        expect(github).toBeTruthy();
    });
});

describe('GogsApi', () => {
    it('should load config', () => {
        const gogs = new GogsApi("http://localhost:3000", "token");
        expect(gogs).toBeTruthy();
    });
});

describe('GitlabApi', () => {
    it('should load config', () => {
        const gitlab = new GitlabApi("https://gitlab.com", "token");
        expect(gitlab).toBeTruthy();
    });
});

describe('GiteaApi', () => {
    it('should load config', () => {
        const gitea = new GiteaApi("https://codeberg.org", "token");
        expect(gitea).toBeTruthy();
    });
});

describe('Bitbucket', () => {
    it('should load config', () => {
        const bitbucket = new BitbucketApi("username", "password");
        expect(bitbucket).toBeTruthy();
    });
});