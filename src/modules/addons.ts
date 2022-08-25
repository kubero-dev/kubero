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
    public addonsList: IAddon[] = []
    private operatorsList: any;

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
            rediscluster.crd = this.getOperatorCRD(rediscluster)
            //console.log(rediscluster.crd)
        }
        this.addonsList.push(rediscluster)

        let redis = new Redis()
        if (operatorsAvailable.includes(rediscluster.operator)) {
            redis.enabled = true
            redis.crd = this.getOperatorCRD(redis)
        }
        this.addonsList.push(redis)

        let crunchyPostgresCluster = new CrunchyPostgresqlCluster()
        if (operatorsAvailable.includes(crunchyPostgresCluster.operator)) {
            crunchyPostgresCluster.enabled = true
            crunchyPostgresCluster.crd = this.getOperatorCRD(crunchyPostgresCluster)
            //console.log(crunchyPostgresCluster.crd)
        }
        this.addonsList.push(crunchyPostgresCluster)

    }

    // get the CRD from the installed operator
    private getOperatorCRD(addon: IAddon): KubernetesObject {
        let operatorCRD;
        let operatorCRDList;

        for (const crd of this.operatorsList) {
            //console.log('-------------------------')
            //console.log(crd.metadata.name, addon.operator)
            if (crd.metadata.name.includes(addon.operator)) {
                operatorCRDList = crd.metadata.annotations['alm-examples'];
                
                for (const op of JSON.parse(operatorCRDList)) {

                    //console.log(op.kind, addon.CRDkind)
                    //console.log(op.kind)
                    if (op.kind === addon.CRDkind) {
                        operatorCRD = op;
                        break;
                    }
                }
            } 
        }
        return operatorCRD
    }

    private loadOperators(): void {
        this.kubectl.getOperators()
        .then(operators => {
            
            this.operatorsList = operators;

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

    public getOperatorsList(): string[] {
        return this.operatorsAvailable
    }
}