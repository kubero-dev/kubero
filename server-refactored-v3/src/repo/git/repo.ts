import debug from 'debug';
import * as crypto from "crypto"
import sshpk from 'sshpk';
import { IWebhook, IRepository, IWebhookR, IDeploykeyR, IPullrequest} from './types';
import { IDeployKeyPair} from '../repo.interface';
debug('app:kubero:git:repo')

export abstract class Repo {

    protected repoProvider: string;

    constructor(repoProvider: string) {
        this.repoProvider = repoProvider;
    }

    protected createDeployKeyPair(): IDeployKeyPair{
        debug.debug('createDeployKeyPair');

        const keyPair = crypto.generateKeyPairSync('ed25519', {
            //modulusLength: 4096,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem',
                //cipher: 'aes-256-cbc',
                //passphrase: ''
            }
        });
        debug.debug(JSON.stringify(keyPair));

        const pubKeySsh = sshpk.parseKey(keyPair.publicKey, 'pem');
        const pubKeySshString = pubKeySsh.toString('ssh');
        const fingerprint = pubKeySsh.fingerprint('sha256').toString('hex');
        console.debug(pubKeySshString);

        const privKeySsh = sshpk.parsePrivateKey(keyPair.privateKey, 'pem');
        const privKeySshString = privKeySsh.toString('ssh');
        console.debug(privKeySshString);

        return {
            fingerprint: fingerprint,
            pubKey: pubKeySshString,
            pubKeyBase64: Buffer.from(pubKeySshString).toString('base64'),
            privKey: privKeySshString,
            privKeyBase64: Buffer.from(privKeySshString).toString('base64')
        };
    }

    public async connectRepo(gitrepo: string): Promise<{keys: IDeploykeyR | undefined, repository: IRepository, webhook: IWebhookR | undefined}> {
        debug.log('connectPipeline: '+gitrepo);

        if (process.env.KUBERO_WEBHOOK_SECRET == undefined) {
            debug.log("KUBERO_WEBHOOK_SECRET is not defined")
            throw new Error("KUBERO_WEBHOOK_SECRET is not defined");
        }
        if (process.env.KUBERO_WEBHOOK_URL == undefined) {
            debug.log("KUBERO_WEBHOOK_URL is not defined")
            throw new Error("KUBERO_WEBHOOK_URL is not defined");
        }

        const repository = await this.getRepository(gitrepo)
        console.debug(repository);

        let keys: IDeploykeyR = {
            status: 500,
            statusText: 'error',
            data: {
                id: 0,
                title: "bot@kubero",
                verified: false,
                created_at: '2020-01-01T00:00:00Z',
                url: '',
                read_only: true,
                pub: '',
                priv: '',
            }
        }
        let webhook: IWebhookR = {
            status: 500,
            statusText: 'error',
            data: {
                id: 0,
                active: false,
                created_at: '2020-01-01T00:00:00Z',
                url: '',
                insecure: true,
                events: [],
            }
        }
        if (repository.status == 200 && repository.data.admin == true) {

            webhook = await this.addWebhook(
                repository.data.owner,
                repository.data.name,
                process.env.KUBERO_WEBHOOK_URL+'/'+this.repoProvider,
                process.env.KUBERO_WEBHOOK_SECRET,
            );

            keys = await this.addDeployKey(repository.data.owner, repository.data.name);
        }

        return {keys: keys, repository: repository, webhook: webhook};

    }

    public async disconnectRepo(gitrepo: string): Promise<boolean> {
        debug.log('disconnectPipeline: '+gitrepo);

        const {owner, repo} = this.parseRepo(gitrepo);

        // TODO: implement remove deploy key and webhook for all providers
        //this.removeDeployKey(owner, repo, 0);
        //this.removeWebhook(owner, repo, 0);

        return true;
    }

    protected parseRepo(gitrepo: string): {owner: string, repo: string} {
        let owner = gitrepo.match(/^git@.{0,100}:(.{0,100})\/.{0,100}$/)?.[1] as string;
        let repo = gitrepo.match(/^git@.{0,100}:.{0,100}\/(.{0,100}).git$/)?.[1] as string;
        return { owner: owner, repo: repo };
    }

    protected abstract addDeployKey(owner: string, repo: string): Promise<IDeploykeyR>
    //protected abstract removeDeployKey(owner: string, repo: string, id: number): Promise<boolean>
    protected abstract getRepository(gitrepo: string): Promise<IRepository>;
    protected abstract addWebhook(owner: string, repo: string, url: string, secret: string): Promise<IWebhookR>;
    protected abstract getWebhook(event: string, delivery: string, signature: string, body: any): IWebhook | boolean;
    //protected abstract removeWebhook(owner: string, repo: string, id: number): Promise<boolean>;
    protected abstract getBranches(repo: string): Promise<string[]> | undefined;
    protected abstract getReferences(repo: string): Promise<string[]> | undefined;
    protected abstract getPullrequests(repo: string): Promise<IPullrequest[]> | undefined;
}