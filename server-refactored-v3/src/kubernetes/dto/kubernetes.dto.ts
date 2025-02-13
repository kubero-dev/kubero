import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StorageClassDTO {
  @ApiProperty()
  name: string;

  @ApiProperty()
  provisioner: string;

  @ApiProperty()
  reclaimPolicy: string;

  @ApiProperty()
  volumeBindingMode: string;
  //allowVolumeExpansion: boolean;
  //mountOptions: string[];
}

export class ContextDTO {
  @ApiProperty()
  cluster: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  user: string;

  @ApiPropertyOptional()
  namespace?: string;
}

export class GetEventsDTO {
  @ApiProperty()
  count: number;

  @ApiProperty()
  eventTime: any;

  @ApiProperty()
  firstTimestamp: string;

  @ApiProperty()
  involvedObject: {
    apiVersion: string;
    kind: string;
    name: string;
    namespace: string;
    resourceVersion: string;
    uid: string;
  };

  @ApiProperty()
  lastTimestamp: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  metadata: {
    creationTimestamp: string;
    managedFields: Array<{
      apiVersion: string;
      fieldsType: string;
      fieldsV1: {
        'f:count': {};
        'f:firstTimestamp': {};
        'f:involvedObject': {};
        'f:lastTimestamp': {};
        'f:message': {};
        'f:reason': {};
        'f:source': {
          'f:component': {};
        };
        'f:type': {};
        'f:reportingComponent'?: {};
      };
      manager: string;
      operation: string;
      time: string;
    }>;
    name: string;
    namespace: string;
    resourceVersion: string;
    uid: string;
  };

  @ApiProperty()
  reason: string;

  @ApiProperty()
  reportingComponent: string;

  @ApiProperty()
  reportingInstance: string;

  @ApiProperty()
  source: {
    component: string;
  };

  @ApiProperty()
  type: string;
}
