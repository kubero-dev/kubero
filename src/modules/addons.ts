import debug from 'debug';
debug('app:addons')
import { Kubectl } from './kubectl';
import { KubernetesListObject, KubernetesObject } from '@kubernetes/client-node'
import { RedisCluster, Redis} from '../addons/redis';
import { CrunchyPostgresqlCluster} from '../addons/postgresql-crunchy';

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
    icon: string,
    version: string
    plural: string;
    description?: string,
    formfields: {[key: string]: IAddonFormFields},
    crd: KubernetesObject
}

interface IUniqueAddons {
    [key: string]: IAddon
}

export class Addons {
    private kubectl: Kubectl;
    private operatorsAvailable: string[] = [];
    public addonsList: IAddon[] = []

    constructor(
        options: AddonOptions
    ) {
        this.kubectl = options.kubectl
        this.loadOperators()
    }

    private loadAddons(operatorsAvailable: string[]): void {

        let rediscluster = new RedisCluster()
        if (operatorsAvailable.includes(rediscluster.operator)) {
            rediscluster.enabled = true
        }
        this.addonsList.push(rediscluster)

        let redis = new Redis()
        if (operatorsAvailable.includes(rediscluster.operator)) {
            redis.enabled = true
        }
        this.addonsList.push(redis)

        let crunchyPostgresCluster = new CrunchyPostgresqlCluster()
        if (operatorsAvailable.includes(crunchyPostgresCluster.operator)) {
            crunchyPostgresCluster.enabled = true
        }
        this.addonsList.push(crunchyPostgresCluster)

    }

    private loadOperators(): void {
        this.kubectl.getOperators()
        .then(operators => {

            let operatorsList:string[] = [];
            for (const operator of operators) {
                let name = operator.metadata.name.split(".")[0]
                operatorsList.push(name)
            }
            this.operatorsAvailable = [...new Set(operatorsList)]

            this.loadAddons(this.operatorsAvailable)
        })
        .catch(err => {
            console.error(err)
        })
    }

    public async getAddonsList(): Promise<IAddon[]> {
        return this.addonsList
    }
}