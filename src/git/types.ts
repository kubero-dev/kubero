export interface IWebhook {
    repoprovider: 'gitea' | 'gitlab' | 'github' | 'bitbucket' | 'gogs' | 'onedev',
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
        clone_url?: string,
        language?: string,
        homepage?: string,
        admin: boolean,
        push: boolean,
        visibility?: string,
        default_branch?: string
    }
}

export interface IWebhookR {
    status: number,
    statusText: 'error' | 'created' | 'not found' | 'found',
    data: {
        id?: number,
        active: boolean,
        created_at: string,
        url: string,
        insecure: boolean,
        events: string[],
    }
}

export interface IDeploykeyR {
    status: number,
    statusText: 'error' | 'created' | 'not found' | 'found',
    data: {
        id?: number,
        title: string,
        verified: boolean,
        created_at: string,
        url: string,
        read_only: boolean,
        pub: string,
        priv: string
    }
}