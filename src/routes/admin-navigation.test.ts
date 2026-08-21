import { describe, expect, it } from 'vitest';
import { adminRecordPath, adminResourcePath } from './admin-navigation';

describe('admin withdrawal navigation', () => {
  it('opens the dedicated withdrawal workflow instead of the generic resource page', () => {
    expect(adminResourcePath('withdrawalrequests')).toBe('/admin/withdrawals');
    expect(adminRecordPath('withdrawalrequests', 'withdrawal-id')).toBe('/admin/withdrawals/withdrawal-id');
  });

  it('keeps other resources on the generic admin pages', () => {
    expect(adminResourcePath('accounts')).toBe('/resources/accounts');
    expect(adminRecordPath('accounts', 'account-id')).toBe('/resources/accounts/account-id');
  });
});
