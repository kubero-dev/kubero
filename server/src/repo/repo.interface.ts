export interface IDeployKeyPair {
  fingerprint: string;
  pubKey: string;
  pubKeyBase64: string;
  privKey: string;
  privKeyBase64: string;
}
export interface IWebhook {
  repoprovider: 'gitea' | 'gitlab' | 'github' | 'bitbucket' | 'gogs' | 'onedev';
  action: 'opened' | 'reopened' | 'closed' | undefined;
  event: string;
  delivery: string;
  body: any;
  branch: string;
  verified: boolean;
  repo: {
    ssh_url: string;
  };
}
