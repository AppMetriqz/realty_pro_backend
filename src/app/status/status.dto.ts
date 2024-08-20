import { ApiProperty } from '@nestjs/swagger';

export class StatusDto {
  @ApiProperty()
  status_id?: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description?: string;
}

export interface FindAllDto {
  pageSize: number;
  pageIndex: number;
}
