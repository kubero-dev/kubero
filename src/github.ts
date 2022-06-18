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

//export const GithubWebhooksMiddleware = createNodeMiddleware(webhooks, { path: "/" });
export const GithubWebhooksMiddleware = createNodeMiddleware(webhooks);
