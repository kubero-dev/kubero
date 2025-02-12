import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OKDTO {
  
  @ApiProperty()
  status: string;
  
  @ApiPropertyOptional()
  message?: string;
}