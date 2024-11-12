import express, { Request, Response } from 'express';
import { Auth } from '../modules/auth';

const Router = express.Router();
export const RouterRepo = Router;
export const auth = new Auth();
auth.init();
export const authMiddleware = auth.getAuthMiddleware();

Router.get('/repo/:repoprovider/list', async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Get a list of available repositories'
    let repolist = await req.app.locals.repositories.listRepos(req.params.repoprovider);
    res.send(repolist);
});

Router.post('/repo/:repoprovider/disconnect', async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Disconnect a repository from a pipeline by removing the webhook and deployment key'
    let con = await req.app.locals.repositories.disconnectRepo(req.params.repoprovider, req.body.gitrepo);
    res.send(con);
});

Router.post('/repo/:repoprovider/connect', async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Connect a repository to a pipeline'
    let con = await req.app.locals.repositories.connectRepo(req.params.repoprovider, req.body.gitrepo);
    res.send(con);
});

Router.get('/repo/:repoprovider/:gitrepob64/branches/list', async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Get a list of available branches'
    // #swagger.parameters['gitrepob64'] = { description: 'Base64 encoded git repository url' }
    // #swagger.parameters['repoprovider'] = { description: 'Repository provider', schema: { '@enum': ['github', 'gitlab', 'bitbucket', 'gitea', 'gogs'] }}
    let branches = await req.app.locals.repositories.listRepoBranches(req.params.repoprovider, req.params.gitrepob64);
    res.send(branches);
});

Router.get('/repo/:repoprovider/:gitrepob64/references/list', async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Get a list of available branches'
    // #swagger.parameters['gitrepob64'] = { description: 'Base64 encoded git repository url' }
    // #swagger.parameters['repoprovider'] = { description: 'Repository provider', schema: { '@enum': ['github', 'gitlab', 'bitbucket', 'gitea', 'gogs'] }}
    let branches = await req.app.locals.repositories.listReferences(req.params.repoprovider, req.params.gitrepob64);
    res.send(branches);
});

Router.get('/repo/:repoprovider/:gitrepob64/pullrequests', async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Get a list of available Pull requests'
    // #swagger.parameters['gitrepob64'] = { description: 'Base64 encoded git repository url' }
    // #swagger.parameters['repoprovider'] = { description: 'Repository provider', schema: { '@enum': ['github', 'gitlab', 'bitbucket', 'gitea', 'gogs'] }}
    let branches = await req.app.locals.repositories.listRepoPullrequests(req.params.repoprovider, req.params.gitrepob64);
    res.send(branches);
});

Router.post('/repo/pullrequest/start', async function (req: Request, res: Response) {
    req.app.locals.kubero.createPRApp(req.body.branch, req.body.branch, req.body.ssh_url, req.body.pipelineName)
    res.send('ok');
});

Router.all('/repo/webhooks/:repoprovider', async function (req: Request, res: Response) {
    // #swagger.tags = ['UI']
    // #swagger.summary = 'Webhooks endpoint for repository providers'
    // #swagger.parameters['repoprovider'] = { description: 'Repository provider' }
    // #swagger.parameters['repoprovider'] = { description: 'Repository provider', schema: { '@enum': ['github', 'gitlab', 'bitbucket', 'gitea', 'gogs'] }}

    let ret: string = 'ok';
    switch (req.params.repoprovider){
        case "github":
            let github_event = req.headers['x-github-event']
            let github_delivery = req.headers['x-github-delivery']
            //let hookId = req.headers['x-github-hook-id']
            let github_signature = req.headers['x-hub-signature-256']
            let github_body = req.body

            //req.app.locals.kubero.handleGithubWebhook(github_event, github_delivery, github_signature, github_body);
            req.app.locals.kubero.handleWebhook('github', github_event, github_delivery, github_signature, github_body);
            break;
        case "gitea":
            //console.log(req.headers)
            let gitea_event = req.headers['x-gitea-event']
            let gitea_delivery = req.headers['x-gitea-delivery']
            let gitea_signature = req.headers['x-hub-signature-256']
            let gitea_body = req.body

            req.app.locals.kubero.handleWebhook('gitea', gitea_event, gitea_delivery, gitea_signature, gitea_body);
            break;
        case "gogs":
            //console.log(req.headers)
            let gogs_event = req.headers['x-gogs-event']
            let gogs_delivery = req.headers['x-gogs-delivery']
            let gogs_signature = req.headers['x-gogs-signature']
            let gogs_body = req.body

            req.app.locals.kubero.handleWebhook('gogs', gogs_event, gogs_delivery, gogs_signature, gogs_body);
            break;
        case "gitlab":
            let gitlab_event = req.headers['x-gitlab-event']
            let gitlab_delivery = req.headers['x-gitlab-event-uuid']
            let gitlab_signature = req.headers['x-gitlab-token']
            let gitlab_body = req.body
            req.app.locals.kubero.handleWebhook('gitlab', gitlab_event, gitlab_delivery, gitlab_signature, gitlab_body);
            break;
        case "ondev":
        case "bitbucket":
            case "gitlab":
                console.log(req.headers)
                let bitbucket_event = req.headers['x-event-key']
                let bitbucket_delivery = req.headers['x-request-uuid']
                let bitbucket_body = req.body
                req.app.locals.kubero.handleWebhook('bitbucket', bitbucket_event, bitbucket_delivery, "", bitbucket_body);
            break;
        default:
            ret = "unknown repoprovider "+encodeURI(req.params.repoprovider);
            break;
    }
    res.send(ret);
});
