import debug from 'debug';
import * as crypto from "crypto"
import sshpk from 'sshpk';
import { IWebhook, IRepository, IWebhookR, IDeploykeyR} from './types';
import { IDeployKeyPair} from '../types';
debug('app:kubero:git:repo')

export class Repo {
    constructor() {}

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
}

export interface IRepo extends Repo {
    connectRepo(gitrepo: string): Promise<{keys: IDeploykeyR, repository: IRepository, webhook: IWebhookR}>;
    getRepository(gitrepo: string): Promise<IRepository>;
    addWebhook(owner: string, repo: string, url: string, secret: string): Promise<IWebhookR>;
    addDeployKey(owner: string, repo: string, keyPair: IDeployKeyPair): Promise<IDeploykeyR>;
    getWebhook(event: string, delivery: string, signature: string, body: any): IWebhook | boolean;
}