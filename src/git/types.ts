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

export interface IRepository {
    status: number,
    statusText: 'error' | 'not found' | 'found',
    data: {
        id?: number,
        node_id?: string,
        name: string,
        description?: string,
        owner: string,
        private?: boolean,
        ssh_url?: string,
        language?: string,
    }
}