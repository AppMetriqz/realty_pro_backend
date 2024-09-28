import { IsNotEmpty, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';
import * as _ from 'lodash';

export class FindAllDto {
  @IsNotEmpty()
  @Transform((value) =>
    _.map(
      _.split(value.value, ',').filter((item) => item !== ''),
      (n) => _.toNumber(n),
    ),
  )
  @IsArray()
  projectIds: number[];
}
