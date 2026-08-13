import { formatVietnamDateTime, isIsoDateTime } from './date-time';

export function toCsv(rows: Record<string, unknown>[], columns: string[]) {
  const escape = (value: unknown) => `"${String(isIsoDateTime(value) ? formatVietnamDateTime(value) : value ?? '').replaceAll('"', '""')}"`;
  return [columns.map(escape).join(','), ...rows.map(row => columns.map(key => escape(row[key])).join(','))].join('\r\n');
}

export function downloadCsv(name: string, content: string) {
  const url = URL.createObjectURL(new Blob(['\ufeff', content], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = name; anchor.click(); URL.revokeObjectURL(url);
}
