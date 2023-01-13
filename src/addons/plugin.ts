import axios from 'axios';
import { KubernetesListObject, KubernetesObject } from '@kubernetes/client-node'

export interface IPluginFormFields {
    type: 'text' | 'number' |'switch' | 'select' | 'select-storageclass',
    label: string,
    name: string,
    required: boolean,
    default: string | number | boolean,
    description?: string,
}

export interface IPlugin {
    id: string
    enabled: boolean,
    beta: boolean,
    version: {
        latest: string,
        installed: string,
    },
    description: string,
    install: string,
    formfields: {[key: string]: IPluginFormFields},
    //crd: KubernetesObject,
    resourceDefinitions: any,
    artifact_url: string;
}

export abstract class Plugin {
    public plugin?: any;
    public id: string = ''; //same as operator name
    public enabled: boolean = false; // true if installed
    public version: {
        latest:string,
        installed: string
        } = {
            'latest': '0.0.0', // version fetched from artifacthub
            'installed': '0.0.0', // loaded if avialable from local operators
        };
    public displayName: string = '';
    public description: string = '';
    public maintainers: Object[] = [];
    public links: Object[] = [];
    public readme: string = '';
    //public crd: KubernetesObject = {}; // ExampleCRD which will be used as template
    protected additionalResourceDefinitions: Object = {};
    public resourceDefinitions: any = {}; // List of CRD to apply

    public artifact_url: string = ''; // Example: https://artifacthub.io/api/v1/packages/olm/community-operators/postgresql
    public artefact_data: any = {};
    public kind: string;

    constructor() {
        this.kind = this.constructor.name;
    }

    public async init(availableCRDs: any) {

        console.log("init : "+this.id, this.constructor.name)

        // load data from artifacthub
        const response = await axios.get(this.artifact_url)
            .catch(error => {
                console.log('Error loading data from artifacthub')
                //console.log(error);
            }
        );

        //this.displayName = response?.data.displayName;
        this.description = response?.data.description;
        this.maintainers = response?.data.maintainers;
        this.links = response?.data.links;
        this.readme = response?.data.readme;
        this.version.latest = response?.data.version;
        this.artefact_data = response?.data;
/*
        // Load data from local Operators
        for (const operator of availableOperators) {
            const operatorName = operator.metadata.name.split(".")[0]
            if (operatorName === this.id) {
                this.enabled = true;
                this.version.installed = operator.spec.version

                const operatorCRDList = operator.metadata.annotations['alm-examples'];

                for (const op of JSON.parse(operatorCRDList)) {
                    if (op.kind === this.constructor.name) {
                        //this.crd = op;
                        this.resourceDefinitions[op.kind] = op;
                        break;
                    }
                }

                for (const [key, value] of Object.entries(this.additionalResourceDefinitions)) {
                    this.resourceDefinitions[key] = value;
                }


            }
        }
*/

        for (const crd of availableCRDs) {
            if (crd.spec.names.kind === this.constructor.name) {
                this.enabled = true;
                this.version.installed = this.artefact_data.version;

                for (const artefactCRD of this.artefact_data.crds) {
                    if (artefactCRD.kind === crd.spec.names.kind) {
                        // search in artefact data for the crd
                        const exampleCRD = this.artefact_data.crds_examples.find((crd: any) => crd.kind === artefactCRD.kind);

                        this.resourceDefinitions[crd.spec.names.kind] = exampleCRD;

                        this.displayName = artefactCRD.displayName;
                        this.description = artefactCRD.description;
                        break;
                    }
                }

            }
        }

    }
}