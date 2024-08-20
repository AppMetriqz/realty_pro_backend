import { FindAttributeOptions, Includeable } from 'sequelize';
import * as _ from 'lodash';

export const ModelProperties: {
  attributes?: FindAttributeOptions;
  include?: Includeable | Includeable[];
} = {};

export const getPaidAmountByPlanNumber = (
  total_amount: number,
  amount: number,
): number[] => {
  const length = Math.floor(total_amount / amount);
  const diff = total_amount % amount;
  const result = Array(length).fill(_.toNumber(amount));
  if (diff !== 0) {
    result.push(_.toNumber(diff));
  }
  return result;
};
