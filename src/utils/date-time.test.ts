import { describe, expect, it } from 'vitest';

import { formatVietnamDateTime, fromVietnamDateTimeInput, toVietnamDateTimeInput } from './date-time';

describe('Vietnam date time', () => {
  it('converts Vietnam local input to a UTC instant', () => {
    expect(fromVietnamDateTimeInput('2026-08-13T09:30')).toBe('2026-08-13T02:30:00.000Z');
  });

  it('converts UTC values back to Vietnam form time', () => {
    expect(toVietnamDateTimeInput('2026-08-13T02:30:00Z')).toBe('2026-08-13T09:30');
  });

  it('formats values in Vietnam regardless of runtime timezone', () => {
    expect(formatVietnamDateTime('2026-08-13T02:30:00Z')).toBe('09:30 13/08/2026');
  });
});
