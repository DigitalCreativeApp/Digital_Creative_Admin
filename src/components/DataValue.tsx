export function DataValue({ value }: { value: unknown }) {
  if (value === null || value === undefined || value === '') return <span className="muted">—</span>;
  if (typeof value === 'boolean') return <span className={`status ${value ? 'positive' : ''}`}>{value ? 'Có' : 'Không'}</span>;
  if (typeof value === 'object') return <code>{JSON.stringify(value)}</code>;
  const text = String(value);
  if (/^https?:\/\//.test(text)) return <a href={text} target="_blank" rel="noreferrer">Mở tệp</a>;
  return <span title={text}>{text}</span>;
}
