import * as currency from 'currency.js';

export const getCurrencyFormat = (
  value: number,
  symbol?: string | undefined,
) => {
  return currency(value, {
    symbol,
    separator: ',',
    decimal: '.',
  }).format();
};
