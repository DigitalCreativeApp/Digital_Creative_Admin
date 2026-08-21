import { describe, expect, it } from 'vitest';
import { campaignDateError, defaultEditorValue, fieldGroup, isImageField, isImageUrl, isResourceFormField, recordDisplayName } from './field-presentation';

describe('field presentation', () => {
  it('recognizes image URL fields without treating every URL as an image', () => {
    expect(isImageField('AvatarUrl')).toBe(true);
    expect(isImageField('ThumbnailUrl')).toBe(true);
    expect(isImageField('WebsiteUrl')).toBe(false);
  });

  it('recognizes image delivery URLs with or without file extensions', () => {
    expect(isImageUrl('https://cdn.example.com/artwork.webp')).toBe(true);
    expect(isImageUrl('https://images.unsplash.com/photo-123')).toBe(true);
    expect(isImageUrl('https://example.com/profile')).toBe(false);
  });

  it('groups fields for a scannable record view', () => {
    expect(fieldGroup('CoverUrl')).toBe('media');
    expect(fieldGroup('Description')).toBe('content');
    expect(fieldGroup('CreatedAt')).toBe('system');
  });

  it('uses a human-readable value as the record heading', () => {
    expect(recordDisplayName({ Id: 'technical-id', DisplayName: 'Nguyễn Minh' }, 'Tài khoản')).toBe('Nguyễn Minh');
    expect(recordDisplayName({ Id: 'technical-id', Name: 'Thiết kế đồ họa' }, 'Ngành nghề')).toBe('Thiết kế đồ họa');
    expect(recordDisplayName({ Id: 'technical-id' }, 'Bản ghi')).toBe('Bản ghi');
  });

  it('keeps campaign forms focused on banner configuration', () => {
    expect(isResourceFormField('campaigns', 'CoverUrl')).toBe(true);
    expect(isResourceFormField('campaigns', 'StartsAt')).toBe(true);
    expect(isResourceFormField('campaigns', 'Title')).toBe(false);
    expect(isResourceFormField('campaigns', 'Description')).toBe(false);
    expect(isResourceFormField('campaigns', 'CallToAction')).toBe(false);
    expect(isResourceFormField('services', 'Title')).toBe(true);
  });

  it('keeps profession forms limited to name, optional icon and status', () => {
    expect(isResourceFormField('professions', 'SortOrder')).toBe(false);
    expect(isResourceFormField('professions', 'Slug')).toBe(false);
    expect(isResourceFormField('professions', 'Description')).toBe(false);
    expect(isResourceFormField('professions', 'Name')).toBe(true);
    expect(isResourceFormField('professions', 'IconUrl')).toBe(true);
    expect(isResourceFormField('professions', 'Status')).toBe(true);
  });

  it('requires campaign end time to be after start time', () => {
    expect(campaignDateError('2026-08-31T09:37', '2026-08-13T09:26')).toBe('Ngày kết thúc phải sau ngày bắt đầu.');
    expect(campaignDateError('2026-08-13T09:26', '2026-08-31T09:37')).toBe('');
  });

  it('keeps displayed create-form defaults in React state', () => {
    expect(defaultEditorValue('Boolean', null, undefined)).toBe('true');
    expect(defaultEditorValue('CampaignStatus', ['Draft', 'Active'], undefined)).toBe('Draft');
    expect(defaultEditorValue('String', null, undefined)).toBe('');
  });
});
