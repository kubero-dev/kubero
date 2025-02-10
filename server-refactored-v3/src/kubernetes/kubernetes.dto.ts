import { ApiProperty } from '@nestjs/swagger';

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