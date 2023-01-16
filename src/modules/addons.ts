import debug from 'debug';
debug('app:addons')
import { Kubectl } from './kubectl';
import { KubernetesListObject, KubernetesObject } from '@kubernetes/client-node'
import { PostgresCluster } from '../addons/postgresCluster';
import { RedisCluster } from '../addons/redisCluster';
import { Redis } from '../addons/redis';
//import { PerconaServerMongoDB } from '../addons/perconaServerMongoDB';
import { KuberoMysql } from '../addons/kuberoMysql';
import { KuberoRedis } from '../addons/kuberoRedis';
import { KuberoPostgresql } from '../addons/kuberoPostgresql';
import { KuberoMongoDB } from '../addons/kuberoMongoDB';
import { MongoDB } from '../addons/mongoDB';
import { Minio } from '../addons/minio';
import { IPlugin } from '../addons/plugin';


export interface AddonOptions {
    kubectl: Kubectl;
}
export interface IAddonMinimal {
    group: string;
    version: string;
    namespace: string;
    pipeline: string;
    phase: string;
    plural: string;
    id: string;
}

export interface IAddonFormFields {
    type: 'text' | 'number' |'switch',
    label: string,
    name: string,
    required: boolean,
    default: string | number | boolean,
    description?: string,
    //value?: string | number | boolean,
}

export interface IAddon {
    id: string
    operator: string,
    enabled: boolean,
    name: string,
    CRDkind: string,
    icon: string,
    version: string
    plural: string;
    description?: string,
    install: string,
    formfields: {[key: string]: IAddonFormFields},
    crd: KubernetesObject
}

interface IUniqueAddons {
    [key: string]: IAddon
}

export class Addons {
    private kubectl: Kubectl;
    private operatorsAvailable: string[] = [];
    public addonsList: IPlugin[] = [] // List or possibly installed operators
    private CRDList: any; //List of installed CRDs from kubectl

    constructor(
        options: AddonOptions
    ) {
        this.kubectl = options.kubectl
    }

    public async loadOperators(): Promise<void> {

        this.CRDList = await this.kubectl.getCustomresources()

        const kuberoMysql = new KuberoMysql(this.CRDList)
        this.addonsList.push(kuberoMysql)

        const kuberoRedis = new KuberoRedis(this.CRDList)
        this.addonsList.push(kuberoRedis)

        const kuberoPostgresql = new KuberoPostgresql(this.CRDList)
        this.addonsList.push(kuberoPostgresql)

        const kuberoMongoDB = new KuberoMongoDB(this.CRDList)
        this.addonsList.push(kuberoMongoDB)


        const postgresCluster = new PostgresCluster(this.CRDList)
        this.addonsList.push(postgresCluster)

        const redisCluster = new RedisCluster(this.CRDList)
        this.addonsList.push(redisCluster)

        const redis = new Redis(this.CRDList)
        this.addonsList.push(redis)

        const mongoDB = new MongoDB(this.CRDList)
        this.addonsList.push(mongoDB)

        const minio = new Minio(this.CRDList)
        this.addonsList.push(minio)
    }

    public async getAddonsList(): Promise<IPlugin[]> {
        return this.addonsList
    }

    public getOperatorsList(): string[] {
        return this.operatorsAvailable
    }

    public deleteAddon(addon: IAddonMinimal) {
        console.log(addon)
        //return this.kubectl.deleteResource(addon)
    }
}