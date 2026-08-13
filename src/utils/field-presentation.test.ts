import { describe, expect, it } from 'vitest';
import { campaignDateError, defaultEditorValue, fieldGroup, isImageField, isImageUrl, isResourceFormField } from './field-presentation';

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

  it('keeps campaign forms focused on banner configuration', () => {
    expect(isResourceFormField('campaigns', 'CoverUrl')).toBe(true);
    expect(isResourceFormField('campaigns', 'StartsAt')).toBe(true);
    expect(isResourceFormField('campaigns', 'Title')).toBe(false);
    expect(isResourceFormField('campaigns', 'Description')).toBe(false);
    expect(isResourceFormField('campaigns', 'CallToAction')).toBe(false);
    expect(isResourceFormField('services', 'Title')).toBe(true);
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
