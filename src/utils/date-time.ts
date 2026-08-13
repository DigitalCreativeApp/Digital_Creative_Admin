export const VIETNAM_TIME_ZONE = 'Asia/Ho_Chi_Minh';

const vietnamOffset = '+07:00';

export function fromVietnamDateTimeInput(value: string) {
  if (!value) return value;
  return new Date(`${value}:00${vietnamOffset}`).toISOString();
}

export function toVietnamDateTimeInput(value: unknown) {
  if (typeof value !== 'string' || !value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const parts = partsInVietnam(date);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function formatVietnamDateTime(value: unknown) {
  if (typeof value !== 'string' || !value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', hour: '2-digit', hour12: false, minute: '2-digit',
    month: '2-digit', timeZone: VIETNAM_TIME_ZONE, year: 'numeric',
  }).format(date);
}

export function isIsoDateTime(value: unknown) {
  return typeof value === 'string'
    && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)
    && !Number.isNaN(new Date(value).getTime());
}

function partsInVietnam(date: Date) {
  const values = new Intl.DateTimeFormat('en-CA', {
    day: '2-digit', hour: '2-digit', hour12: false, minute: '2-digit',
    month: '2-digit', timeZone: VIETNAM_TIME_ZONE, year: 'numeric',
  }).formatToParts(date);
  return Object.fromEntries(values.map(part => [part.type, part.value])) as Record<string, string>;
}
