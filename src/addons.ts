import debug from 'debug';
debug('app:addons')
import { Kubectl } from './kubectl';
import { KubernetesListObject, KubernetesObject } from '@kubernetes/client-node'
import { RedisCluster } from './addons/redis';

export interface AddonOptions {
    kubectl: Kubectl;
}
export interface IAddonMinimal {
    group: string;
    version: string;
    namespace: string;
    plural: string;
    id: string;
}

export interface IAddonFormFields {
    type: string,
    label: string,
    name: string,
    required: boolean,
    default: string | number | boolean,
    description?: string,
    value?: string | number | boolean,
}

export interface IAddon {
    id: string
    name: string, 
    version: string
    plural: string;
    description?: string,
    formfields: IAddonFormFields[],
    crd: KubernetesObject
}

interface IUniqueAddons {
    [key: string]: IAddon
}

export class Addons {
    private kubectl: Kubectl;
    public addonsList: Promise<IAddon[]>;

    private addonsWhitelist = [
        'redis-operator',
        'mariadb-operator-app',
        'postgres-operator',
        //'mongodb-atlas-kubernetes',
        'percona-server-mongodb-operator',
        'percona-xtradb-cluster-operator',
    ]

    constructor(
        options: AddonOptions
    ) {
        this.kubectl = options.kubectl
        this.addonsList = this.loadAvailableAddons()
    }

    private async loadAvailableAddons(): Promise<IAddon[]> {
        const addons = await this.kubectl.getAddons()
        
        //console.log(addons)

        let uniqueAddons:IUniqueAddons = {};
        for (const addon of addons) {
            let name = addon.metadata.name.split(".")[0]

            if (this.addonsWhitelist.includes(name)) {

                switch (name) {
                    case 'redis-operator':
                        uniqueAddons['redis-cluster'] = new RedisCluster(addon.spec.version, addon.spec.description)
                        break;
                    default:
                        break;
                }
    
            }
        }
        //console.log(Object.values(uniqueAddons))

        return Object.values(uniqueAddons)
    }

    public async getAddonsList(): Promise<IAddon[]> {
        return this.addonsList
    }

    // delete a addon in a namespace
    public async deleteAddon(addon: IAddonMinimal): Promise<void> {
        console.log(`Deleting addon ${addon.id}`)
        await this.kubectl.deleteAddon(addon)
    }
}