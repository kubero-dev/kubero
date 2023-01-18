import {Plugin, IPlugin, IPluginFormFields} from './plugin';

// Classname must be same as the CRD's Name
export class KuberoMysql extends Plugin implements IPlugin {
    public id: string = 'kubero-operator';//same as operator name
    public displayName = 'Kubero MySQL'
    public icon = '/img/addons/MySQL.png'
    public install: string = ''
    public artifact_url = 'https://artifacthub.io/api/v1/packages/olm/kubero/kubero-operator'
    public beta: boolean = false;

    public formfields: {[key: string]: IPluginFormFields} = {
        'KuberoMysql.metadata.name':{
            type: 'text',
            label: 'MySQL DB Name',
            name: 'metadata.name',
            required: true,
            default: 'mysql',
            description: 'The name of the MySQL instance'
        },
        'KuberoMysql.spec.mysql.global.storageClass':{
            type: 'select-storageclass',
            label: 'Storage Class',
            // options: ['default', 'local-path', 'nfs-client', 'rook-ceph-block'],
            name: 'spec.mysql.global.storageClass',
            default: 'default',
            required: true
        },
        'KuberoMysql.spec.mysql.primary.persistence.size':{
            type: 'text',
            label: 'Sorage Size*',
            name: 'spec.mysql.primary.persistence.size',
            default: '1Gi',
            required: true,
            description: 'Size of the storage'
        },
        'KuberoMysql.spec.mysql.auth.createDatabase':{
            type: 'switch',
            label: 'Create a Database*',
            name: 'spec.mysql.auth.createDatabase',
            default: false,
            required: true,
            description: 'Create a database on MySQL startup'
        },
        'KuberoMysql.spec.mysql.auth.database':{
            type: 'text',
            label: 'Database Name*',
            name: 'spec.mysql.auth.database',
            default: '',
            required: true,
            description: 'Name of the database to create'
        },
        'KuberoMysql.spec.mysql.auth.rootPassword':{
            type: 'text',
            label: 'Root Password*',
            name: 'spec.mysql.auth.rootPassword',
            default: '',
            required: true,
            description: 'Root Password'
        },
        'KuberoMysql.spec.mysql.auth.username':{
            type: 'text',
            label: 'Username*',
            name: 'spec.mysql.auth.username',
            default: '',
            required: true,
            description: 'Additional username'
        },
        'KuberoMysql.spec.mysql.auth.password':{
            type: 'text',
            label: 'User Password*',
            name: 'spec.mysql.auth.password',
            default: '',
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