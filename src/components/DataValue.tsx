import { valueLabel } from '../config/admin-i18n';
import { isImageField, isImageUrl } from '../utils/field-presentation';
import { formatVietnamDateTime, isIsoDateTime } from '../utils/date-time';

export function DataValue({ value, fieldName, expanded = false }: { value: unknown; fieldName?: string; expanded?: boolean }) {
  if (value === null || value === undefined || value === '') return <span className="muted">—</span>;
  if (typeof value === 'boolean') return <span className={`status ${value ? 'positive' : ''}`}>{value ? 'Có' : 'Không'}</span>;
  if (typeof value === 'object') return <code>{JSON.stringify(value)}</code>;
  const text = String(valueLabel(value));
  if (isIsoDateTime(text)) return <span title={text}>{formatVietnamDateTime(text)}</span>;
  if ((isImageField(fieldName) || isImageUrl(text)) && /^https?:\/\//.test(text)) return <a className={`media-value ${expanded ? 'expanded' : ''}`} href={text} target="_blank" rel="noreferrer"><img src={text} alt={fieldName || 'Hình ảnh'} loading="lazy"/><span>Xem ảnh gốc</span></a>;
  if (/^https?:\/\//.test(text)) return <a href={text} target="_blank" rel="noreferrer">Mở liên kết</a>;
  return <span title={text}>{text}</span>;
}
