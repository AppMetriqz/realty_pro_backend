import { IsNotEmpty, IsArray, IsEnum, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';
import * as _ from 'lodash';
import { CurrencyEnumDto, CurrencyType } from '../../common/constants';

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

  @ValidateIf((o) => _.isString(o.currencyType) && o.currencyType !== '')
  @IsEnum(CurrencyType, { message: 'values available : US | RD' })
  currencyType: keyof typeof CurrencyEnumDto;
}
