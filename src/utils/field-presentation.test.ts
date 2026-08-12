import { describe, expect, it } from 'vitest';
import { fieldGroup, isImageField, isImageUrl } from './field-presentation';

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
});
