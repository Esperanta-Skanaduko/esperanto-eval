/**
 * Serialises records as JSON Lines, one record per line, with a final newline.
 *
 * @param records - The records to write.
 * @returns The text.
 */
export const toJsonLines = (records) => `${records.map((record) => JSON.stringify(record)).join('\n')}\n`;
