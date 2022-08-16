export interface IWebhook {
    repoprovider: 'gitea' | 'gitlab' | 'github',
    action: 'opened' | 'reopened' | 'closed' | undefined,
    event: string,
    delivery: string,
    body: any,
    branch: string,
    verified: boolean,
    repo: {
        ssh_url: string,
    }
}