import express, { Request, Response } from 'express';
import { Auth } from '../modules/auth';

const Router = express.Router();
export const RouterRepo = Router;
export const auth = new Auth();
auth.init();
export const authMiddleware = auth.getAuthMiddleware();

// connect pipeline with repository
Router.get('/repo/:repoprovider/list', async function (req: Request, res: Response) {
    let repolist = await req.app.locals.kubero.listRepos(req.params.repoprovider);
    res.send(repolist);
});

// connect pipeline with repository
Router.post('/repo/:repoprovider/connect', async function (req: Request, res: Response) {
    let con = await req.app.locals.kubero.connectRepo(req.params.repoprovider, req.body.gitrepo);
    res.send(con);
});

// get github webhook events
Router.all('/repo/webhooks/:repoprovider', async function (req: Request, res: Response) {

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
            //let hookId = req.headers['x-github-hook-id']
            let gitea_signature = req.headers['x-hub-signature-256']
            let gitea_body = req.body

            req.app.locals.kubero.handleWebhook('gitea', gitea_event, gitea_delivery, gitea_signature, gitea_body);
            break;
        case "gitlab":
            let gitlab_event = req.headers['x-gitlab-event']
            let gitlab_delivery = req.headers['x-gitlab-event-uuid']
            //let hookId = req.headers['x-github-hook-id']
            let gitlab_signature = req.headers['x-gitlab-token']
            let gitlab_body = req.body
            req.app.locals.kubero.handleWebhook('gitlab', gitlab_event, gitlab_delivery, gitlab_signature, gitlab_body);
            break;
        case "bitbucket":
            //req.app.locals.kubero.handleBitbucketWebhook(req.body);
            break;
        default:
            ret = "unknown repoprovider "+encodeURI(req.params.repoprovider);
            break;
    }
    res.send(ret);
});
