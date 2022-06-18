const { Webhooks, createNodeMiddleware } = require("@octokit/webhooks");
const webhooks = new Webhooks({
    secret: "mysecret"
});


webhooks.onAny(({ id, name, payload}: any) => {
    console.log(name, "event received");
    console.log(id);
    console.log(payload);
});

webhooks.onError(({ id, name, payload}: any) => {
    console.log(name, "ERROR");
    console.log(id);
    console.log(payload);
});

webhooks.on("push", async ({ id, name, payload}: any) => {
    console.log(name, "event received");
    console.log(id);
    console.log(payload);
});

webhooks.on("pull_request", async ({ id, name, payload}: any) => {
    console.log(name, "event received");
    console.log(id);
    console.log(payload);
});


//export const GithubWebhooksMiddleware = createNodeMiddleware(webhooks, { path: "/" });
export const GithubWebhooksMiddleware = createNodeMiddleware(webhooks);


/* https://docs.github.com/en/rest/deploy-keys#create-a-deploy-key
// Octokit.js
// https://github.com/octokit/core.js#readme
const octokit = new Octokit({
    auth: 'personal-access-token123'
})

await octokit.request('POST /repos/{owner}/{repo}/keys', {
    owner: 'OWNER',
    repo: 'REPO',
    title: 'octocat@octomac',
    key: 'ssh-rsa AAA...',
    read_only: true
})
*/