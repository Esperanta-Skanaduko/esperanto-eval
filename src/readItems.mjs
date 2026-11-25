import { readFileSync } from 'node:fs';

/**
 * Reads a JSON Lines benchmark file.
 *
 * @param filePath - Path of the `.jsonl` file.
 * @returns The items.
 */
export const readItems = (filePath) =>
  readFileSync(filePath, 'utf-8')
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => JSON.parse(line));
