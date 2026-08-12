import { describe, expect, it } from 'vitest';
import { resourcePath } from './resource-path';
describe('resourcePath', () => {
  it('encodes untrusted route values', () => expect(resourcePath('users/admin', '../1')).toBe('/api/admin/resources/users%2Fadmin/..%2F1'));
});
