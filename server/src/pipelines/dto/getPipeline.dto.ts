import { ApiProperty } from '@nestjs/swagger';

export class GetPipelineDTO {
  @ApiProperty({ type: () => App, isArray: true })
  items: Array<App>;
}

class App {
  @ApiProperty()
  buildpack: {
    build: {
      command: string;
      readOnlyAppStorage?: boolean;
      repository: string;
      securityContext: {
        allowPrivilegeEscalation: boolean;
        capabilities: {
          add: Array<any>;
          drop: Array<any>;
        };
        readOnlyRootFilesystem: boolean;
        runAsGroup: number;
        runAsNonRoot: boolean;
        runAsUser: number;
      };
      tag: string;
    };
    fetch: {
      readOnlyAppStorage?: boolean;
      repository: string;
      securityContext: {
        allowPrivilegeEscalation: boolean;
        capabilities: {
          add: Array<any>;
          drop: Array<any>;
        };
        readOnlyRootFilesystem: boolean;
        runAsGroup: number;
        runAsNonRoot: boolean;
        runAsUser: number;
      };
      tag: string;
    };
    language: string;
    name: string;
    run: {
      command: string;
      readOnlyAppStorage: boolean;
      repository: string;
      securityContext: {
        allowPrivilegeEscalation: boolean;
        capabilities: {
          add: Array<any>;
          drop: Array<any>;
        };
        readOnlyRootFilesystem: boolean;
        runAsGroup: number;
        runAsNonRoot: boolean;
        runAsUser: number;
      };
      tag: string;
    };
  };

  @ApiProperty()
  buildstrategy: string;

  @ApiProperty()
  deploymentstrategy: string;

  @ApiProperty()
  dockerimage: string;

  @ApiProperty()
  domain: string;

  @ApiProperty()
  git: {
    keys: {
      priv: string;
      pub: string;
      created_at?: string;
      id?: number;
      read_only?: boolean;
      title?: string;
      url?: string;
      verified?: boolean;
    };
    provider: string;
    repository: {
      admin: boolean;
      clone_url: string;
      ssh_url: string;
      default_branch?: string;
      description?: string;
      homepage?: string;
      id?: number;
      language?: string;
      name?: string;
      node_id?: string;
      owner?: string;
      private?: boolean;
      push?: boolean;
      visibility?: string;
    };
    webhook: {
      active?: boolean;
      created_at?: string;
      events?: Array<string>;
      id?: number;
      insecure?: string;
      url?: string;
    };
  };

  @ApiProperty()
  name: string;

  @ApiProperty()
  phases: Array<{
    context: string;
    defaultEnvvars: Array<any>;
    domain: string;
    enabled: boolean;
    name: string;
  }>;

  @ApiProperty()
  registry: {
    host: string;
    password: string;
    username: string;
  };

  @ApiProperty()
  reviewapps: boolean;
}
