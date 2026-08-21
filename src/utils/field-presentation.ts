const imageFieldPattern = /(avatar|cover|thumbnail|image|logo|icon|photo|banner|poster)(url)?$/i;

export function isImageField(name?: string) {
  return Boolean(name && imageFieldPattern.test(name));
}

export function isImageUrl(value: unknown) {
  if (typeof value !== 'string' || !/^https?:\/\//i.test(value)) return false;
  try {
    const url = new URL(value);
    return /\.(avif|gif|jpe?g|png|svg|webp)$/i.test(url.pathname)
      || /(?:image|images|cloudinary|unsplash|imgix)/i.test(url.hostname + url.pathname);
  } catch { return false; }
}

const campaignFormFields = new Set(['CoverUrl', 'StartsAt', 'EndsAt', 'IsFeatured', 'Status', 'TargetUrl']);
const professionFormFields = new Set(['Name', 'IconUrl', 'Status']);
export function isResourceFormField(resourceKey: string, fieldName: string) {
  if (resourceKey === 'campaigns') return campaignFormFields.has(fieldName);
  if (resourceKey === 'professions') return professionFormFields.has(fieldName);
  return true;
}

export function campaignDateError(startsAt: string, endsAt: string) {
  if (!startsAt || !endsAt) return 'Vui lòng chọn ngày bắt đầu và ngày kết thúc.';
  if (new Date(endsAt).getTime() <= new Date(startsAt).getTime()) return 'Ngày kết thúc phải sau ngày bắt đầu.';
  return '';
}

export function defaultEditorValue(type: string, options: string[] | null, value: unknown) {
  if (value !== null && value !== undefined) return String(value);
  if (options?.length) return options.find(option => option !== 'Deleted') ?? '';
  if (type === 'Boolean') return 'true';
  return '';
}

export type FieldGroup = 'media' | 'primary' | 'content' | 'status' | 'system';

export function fieldGroup(name: string): FieldGroup {
  if (isImageField(name)) return 'media';
  if (/^(id|.*Id|createdAt|updatedAt|deletedAt)$/i.test(name)) return 'system';
  if (/^(status|role|type|is[A-Z]|visibility|priority)/.test(name)) return 'status';
  if (/(description|content|bio|requirements|caption|tagline)/i.test(name)) return 'content';
  return 'primary';
}

const recordHeadingFields = ['DisplayName', 'FullName', 'Name', 'Title', 'Email', 'Code', 'WithdrawalCode'];
export function recordDisplayName(data: Record<string, unknown>, fallback: string) {
  for (const field of recordHeadingFields) {
    const value = data[field];
    if ((typeof value === 'string' || typeof value === 'number') && String(value).trim()) return String(value).trim();
  }
  return fallback;
}
