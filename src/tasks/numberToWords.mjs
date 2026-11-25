const ONES = ['nul', 'unu', 'du', 'tri', 'kvar', 'kvin', 'ses', 'sep', 'ok', 'naŭ'];

/**
 * Writes a whole number from 0 to 9999 in Esperanto words. Hundreds and tens are
 * one word (`ducent`, `okdek`), and thousands and the parts are separate words:
 * 1987 is `mil naŭcent okdek sep`, 2024 is `du mil dudek kvar`.
 *
 * @param number - An integer from 0 to 9999.
 * @returns The number in words, parts separated by single spaces.
 * @throws When the number is outside the supported range.
 */
export const numberToWords = (number) => {
  if (!Number.isInteger(number) || number < 0 || number > 9999) throw new RangeError(`unsupported number: ${number}`);
  if (number === 0) return 'nul';
  const parts = [];
  const thousands = Math.floor(number / 1000);
  if (thousands > 0) parts.push(thousands === 1 ? 'mil' : `${ONES[thousands]} mil`);
  const hundreds = Math.floor((number % 1000) / 100);
  if (hundreds > 0) parts.push(hundreds === 1 ? 'cent' : `${ONES[hundreds]}cent`);
  const tens = Math.floor((number % 100) / 10);
  if (tens === 1) parts.push('dek');
  else if (tens > 1) parts.push(`${ONES[tens]}dek`);
  const units = number % 10;
  if (units > 0) parts.push(ONES[units]);
  return parts.join(' ');
};
