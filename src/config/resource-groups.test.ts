import { describe, expect, it } from 'vitest';

import { primaryResources } from './admin-i18n';
import { resourceGroup } from './resource-groups';

describe('profession administration navigation', () => {
  it('shows professions as a primary system catalog', () => {
    expect(primaryResources.has('professions')).toBe(true);
    expect(resourceGroup('professions')).toBe('Danh mục hệ thống');
  });
});
