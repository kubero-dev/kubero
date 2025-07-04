import { IRunpack, ISecurityContext } from '../config.interface';

export class Runpack implements IRunpack {
  public id: string;
  public name: string;
  public language: string;
  public fetch: {
    repository: string;
    tag: string;
    command?: string;
    readOnlyAppStorage: boolean;
    securityContext: ISecurityContext;
  };
  public build: {
    repository: string;
    tag: string;
    command?: string;
    readOnlyAppStorage: boolean;
    securityContext: ISecurityContext;
  };
  public run: {
    repository: string;
    tag: string;
    command?: string;
    readOnlyAppStorage: boolean;
    securityContext: ISecurityContext;
  };
  public tag: string;

  constructor(bp: IRunpack) {
    this.id = bp.id || '';
    this.name = bp.name;
    this.language = bp.language;
    this.fetch = bp.fetch;
    this.build = bp.build;
    this.run = bp.run;
    this.tag = bp.tag;

    this.fetch.securityContext = Runpack.SetSecurityContext(
      this.fetch.securityContext,
    );
    this.build.securityContext = Runpack.SetSecurityContext(
      this.build.securityContext,
    );
    this.run.securityContext = Runpack.SetSecurityContext(
      this.run.securityContext,
    );
  }

  // function to set security context, required for backwards compatibility
  // Added in v1.11.0
  public static SetSecurityContext(s: any): ISecurityContext {
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
          drop: [],
        },
      };
    }

    const securityContext: ISecurityContext = {
      runAsUser: s.runAsUser || 0,
      runAsGroup: s.runAsGroup || 0,
      //fsGroup: s.fsGroup || 0,
      allowPrivilegeEscalation: s.allowPrivilegeEscalation || false,
      readOnlyRootFilesystem: s.readOnlyRootFilesystem || false,
      runAsNonRoot: s.runAsNonRoot || false,
      capabilities: s.capabilities || {
        add: [],
        drop: [],
      },
    };

    if (securityContext.capabilities.add == undefined) {
      securityContext.capabilities.add = [];
    }
    if (securityContext.capabilities.drop == undefined) {
      securityContext.capabilities.drop = [];
    }

    return securityContext;
  }
}
