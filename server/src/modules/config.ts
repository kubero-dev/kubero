import { IBuildpack, IKuberoConfig, IPodSize, ISecurityContext} from '../types';

export class Buildpack implements IBuildpack {
    public name: string;
    public language: string;
    public fetch: {
        repository: string;
        tag: string;
        readOnlyAppStorage: boolean;
        securityContext: ISecurityContext
    };
    public build: {
        repository: string;
        tag: string;
        readOnlyAppStorage: boolean;
        securityContext: ISecurityContext
    };
    public run: {
        repository: string;
        tag: string;
        readOnlyAppStorage: boolean;
        securityContext: ISecurityContext
    };
    public tag: string;

    constructor(
        bp: IBuildpack,
    ) {
        this.name = bp.name;
        this.language = bp.language;
        this.fetch = bp.fetch;
        this.build = bp.build;
        this.run = bp.run;
        this.tag = bp.tag;

        this.fetch.securityContext = Buildpack.SetSecurityContext(this.fetch.securityContext)
        this.build.securityContext = Buildpack.SetSecurityContext(this.build.securityContext)
        this.run.securityContext = Buildpack.SetSecurityContext(this.run.securityContext)

    }

    // function to set security context, required for backwards compatibility
    // Added in v1.11.0
    public static SetSecurityContext(s: any) : ISecurityContext {

        if (s == undefined) {
            return {
                runAsUser: 0,
                runAsGroup: 0,
                //fsGroup: 0,
                allowPrivilegeEscalation: false,
                readOnlyRootFilesystem: false,
                runAsNonRoot: false,
                capabilities: {
                    add: [],
                    drop: []
                }
            }
        }
    
        let securityContext: ISecurityContext = {
            runAsUser: s.runAsUser || 0,
            runAsGroup: s.runAsGroup || 0,
            //fsGroup: s.fsGroup || 0,
            allowPrivilegeEscalation: s.allowPrivilegeEscalation || false,
            readOnlyRootFilesystem: s.readOnlyRootFilesystem || false,
            runAsNonRoot: s.runAsNonRoot || false,
            capabilities: s.capabilities || {
                add: [],
                drop: []
            }
        }

        if (securityContext.capabilities.add == undefined) {
            securityContext.capabilities.add = []
        }
        if (securityContext.capabilities.drop == undefined) {
            securityContext.capabilities.drop = []
        }
    
        return securityContext
    }


}

export class KuberoConfig {
    public podSizeList: IPodSize[];
    public buildpacks: IBuildpack[];
    public clusterissuer: string;
    public templates: {  // introduced v1.11.0
        enabled: boolean;
        catalogs: [
            {
                name: string;
                description: string;
                templateBasePath?: string; // deprecated v2.4.4
                index: {
                    url: string;
                    format: string;
                }
            }
        ]
    }
    public kubero: {
        namespace?: string; // deprecated v1.9.0
        console: {
            enabled: boolean;
        }
        readonly: boolean;
        banner: {
            message: string;
            bgcolor: string;
            fontcolor: string;
            show: boolean;
        }
    }
    constructor(kc: IKuberoConfig) {
        
        this.podSizeList = kc.podSizeList;
        this.buildpacks = kc.buildpacks;
        this.clusterissuer = kc.clusterissuer;
        this.templates = kc.templates;
        this.kubero = kc.kubero;

        for (let i = 0; i < this.buildpacks.length; i++) {
            this.buildpacks[i] = new Buildpack(kc.buildpacks[i]);
        }

        for (let i = 0; i < this.podSizeList.length; i++) {
            this.podSizeList[i] = new PodSize(kc.podSizeList[i]);
        }
    }
}

export class PodSize implements IPodSize {
    public name: string;
    public description: string;
    public default?: boolean | undefined;
    public resources: { 
        requests?: { 
            memory: string; 
            cpu: string; 
        } | undefined; 
        limits?: { 
            memory: string; 
            cpu: string; 
        } | undefined; 
    };
    constructor(ps: IPodSize) {
        this.name = ps.name;
        this.description = ps.description;
        this.default = ps.default;
        this.resources = {
            requests: {
                memory: ps.resources.requests?.memory || "",
                cpu: ps.resources.requests?.cpu || ""
            },
            limits: {
                memory: ps.resources.limits?.memory || "",
                cpu: ps.resources.limits?.cpu || ""
            }
        }
    }
}