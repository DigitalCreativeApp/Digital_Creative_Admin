import { describe, expect, it } from 'vitest'; import { toCsv } from './csv';
describe('toCsv', () => { it('escapes quotes and commas', () => expect(toCsv([{ Name: 'A, "B"' }], ['Name'])).toContain('"A, ""B"""')); });
