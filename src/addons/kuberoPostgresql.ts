import {Plugin, IPlugin, IPluginFormFields} from './plugin';

// Classname must be same as the CRD's Name
export class KuberoPostgresql extends Plugin implements IPlugin {
    public id: string = 'kubero-operator';//same as operator name
    public displayName = 'Kubero Postgresql'
    public icon = '/img/addons/postgresql.png'
    public install: string = ''
    public artifact_url = 'https://artifacthub.io/api/v1/packages/olm/kubero/kubero-operator'
    public beta: boolean = false;

    public formfields: {[key: string]: IPluginFormFields} = {
        'KuberoPostgresql.metadata.name':{
            type: 'text',
            label: 'PostgreSQL DB Name',
            name: 'metadata.name',
            required: true,
            default: 'postgresql',
            description: 'The name of the PostgreSQL instance'
        },
        'KuberoPostgresql.spec.postgresql.global.storageClass':{
            type: 'select-storageclass',
            label: 'Storage Class',
            // options: ['default', 'local-path', 'nfs-client', 'rook-ceph-block'],
            name: 'spec.postgresql.global.storageClass',
            default: 'default',
            required: true
        },
        'KuberoPostgresql.spec.postgresql.primary.persistence.size':{
            type: 'text',
            label: 'Sorage Size*',
            name: 'spec.postgresql.primary.persistence.size',
            default: '1Gi',
            required: true,
            description: 'Size of the storage'
        },
        'KuberoPostgresql.spec.postgresql.global.postgresql.auth.postgresPassword':{
            type: 'text',
            label: 'Postgresql Password*',
            name: 'spec.postgresql.global.postgresql.auth.postgresPassword',
            default: '',
            required: true,
            description: 'Root Password'
        },
        'KuberoPostgresql.spec.postgresql.global.postgresql.auth.username':{
            type: 'text',
            label: 'Username*',
            name: 'spec.postgresql.global.postgresql.auth.username',
            default: '',
            required: true,
            description: 'Additional username'
        },
        'KuberoPostgresql.spec.postgresql.global.postgresql.auth.password':{
            type: 'text',
            label: 'User Password*',
            name: 'spec.postgresql.global.postgresql.auth.password',
            default: '',
            required: true,
            description: 'Password for the additional user'
        },
        'KuberoPostgresql.spec.postgresql.global.postgresql.auth.database':{
            type: 'text',
            label: 'User Password*',
            name: 'spec.postgresql.global.postgresql.auth.database',
            default: 'postgresql',
            required: true,
            description: 'Password for the additional user'
        },
    };

    public env: any[] = []

    protected additionalResourceDefinitions: Object = {}

    constructor(availableOperators: any) {
        super();
        super.init(availableOperators);
    }

}