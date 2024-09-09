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

export const getImageBase64 = (buffer: Buffer, mimetype: string) => {
  if (!buffer){
    return null;
  }
  return `data:${mimetype};base64,${buffer.toString('base64')}`;
};


export function onRemoveCircularReferences(obj: any) {
  const seen = new WeakSet();
  return JSON.parse(
    JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return;
        }
        seen.add(value);
      }
      return value;
    }),
  );
}
