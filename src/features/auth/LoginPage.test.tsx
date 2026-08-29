import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { LoginView } from './LoginPage';

const renderLogin = (overrides: Partial<Parameters<typeof LoginView>[0]> = {}) => renderToStaticMarkup(
  <LoginView
    busy={false}
    email=""
    error=""
    onEmailChange={vi.fn()}
    onPasswordChange={vi.fn()}
    onSubmit={vi.fn()}
    onTogglePassword={vi.fn()}
    password=""
    passwordVisible={false}
    {...overrides}
  />,
);

describe('Admin login presentation', () => {
  it('presents a semantic backoffice entry point with labeled credentials', () => {
    const markup = renderLogin();

    expect(markup).toContain('login-story');
    expect(markup).toContain('login-panel');
    expect(markup).toContain('id="admin-email"');
    expect(markup).toContain('for="admin-email"');
    expect(markup).toContain('id="admin-password"');
    expect(markup).toContain('autoComplete="current-password"');
    expect(markup).toContain('Khu vực quản trị nội bộ');
    expect(markup).toContain('<h1 id="login-title">Chào mừng trở lại</h1>');
  });

  it('exposes password visibility and submit states accessibly', () => {
    expect(renderLogin()).toContain('aria-label="Hiện mật khẩu"');
    expect(renderLogin({ passwordVisible: true })).toContain('type="text"');

    const busyMarkup = renderLogin({ busy: true });
    expect(busyMarkup).toContain('aria-busy="true"');
    expect(busyMarkup).toContain('Đang xác thực');
  });

  it('announces authentication errors without replacing the form', () => {
    const markup = renderLogin({ error: 'Tài khoản không hợp lệ.' });

    expect(markup).toContain('role="alert"');
    expect(markup).toContain('Tài khoản không hợp lệ.');
    expect(markup).toContain('<form');
  });
});
