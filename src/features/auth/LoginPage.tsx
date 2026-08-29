import { useState, type FormEvent, type FormEventHandler } from 'react';
import { Navigate } from 'react-router-dom';
import { AppIcon } from '../../components/AppIcon';
import { useAuth } from '../../store/auth-context';

type LoginViewProps = {
  busy: boolean;
  email: string;
  error: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onTogglePassword: () => void;
  password: string;
  passwordVisible: boolean;
};

export function LoginView({ busy, email, error, onEmailChange, onPasswordChange, onSubmit, onTogglePassword, password, passwordVisible }: LoginViewProps) {
  return (
    <main className="login">
      <div className="login-frame">
        <aside className="login-story" aria-label="Digital Creative Admin Console">
          <div className="brand login-brand">
            <span className="brand-mark" aria-hidden="true">DC</span>
            <div className="brand-copy">Digital Creative<small>ADMIN CONSOLE</small></div>
          </div>

          <div className="login-story-copy">
            <p className="login-eyebrow">Backoffice / Digital Creative</p>
            <p className="login-story-title">Điều hành nền tảng từ một nơi.</p>
            <p>Theo dõi dữ liệu, xử lý vận hành và quản lý tài khoản trong một không gian dành riêng cho đội ngũ quản trị.</p>
          </div>

          <ul className="login-principles" aria-label="Nguyên tắc vận hành">
            <li><span><AppIcon name="check" /></span><div><strong>Dữ liệu có cấu trúc</strong><small>Thông tin được tổ chức để kiểm tra và ra quyết định nhanh.</small></div></li>
            <li><span><AppIcon name="check" /></span><div><strong>Truy cập có kiểm soát</strong><small>Chỉ tài khoản được cấp quyền mới có thể vào hệ thống.</small></div></li>
            <li><span><AppIcon name="check" /></span><div><strong>Vận hành tập trung</strong><small>Các công cụ quản trị nằm trong cùng một workspace.</small></div></li>
          </ul>

          <p className="login-story-footer">Digital Creative · Internal operations</p>
        </aside>

        <section className="login-panel" aria-labelledby="login-title">
          <div className="login-panel-inner">
            <div className="login-access-label"><span aria-hidden="true" />Khu vực quản trị nội bộ</div>
            <h1 id="login-title">Chào mừng trở lại</h1>
            <p className="login-intro">Sử dụng tài khoản Admin đã được cấp để tiếp tục vào hệ thống.</p>

            <form aria-busy={busy} onSubmit={onSubmit}>
              <div className="login-field">
                <label htmlFor="admin-email">Email quản trị</label>
                <div className="login-control">
                  <AppIcon name="mail" />
                  <input id="admin-email" type="email" required autoComplete="username" inputMode="email" value={email} onChange={(event) => onEmailChange(event.currentTarget.value)} placeholder="admin@digitalcreative.vn" />
                </div>
              </div>

              <div className="login-field">
                <label htmlFor="admin-password">Mật khẩu</label>
                <div className="login-control login-password-control">
                  <AppIcon name="lock" />
                  <input id="admin-password" type={passwordVisible ? 'text' : 'password'} required autoComplete="current-password" value={password} onChange={(event) => onPasswordChange(event.currentTarget.value)} aria-describedby={error ? 'login-error' : undefined} placeholder="Nhập mật khẩu" />
                  <button className="login-password-toggle" type="button" onClick={onTogglePassword} disabled={busy} aria-label={passwordVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} aria-pressed={passwordVisible}>
                    <AppIcon name={passwordVisible ? 'eyeOff' : 'eye'} />
                  </button>
                </div>
              </div>

              {error ? <p className="form-error" id="login-error" role="alert">{error}</p> : null}

              <button className="login-submit" type="submit" disabled={busy}>
                <span>{busy ? 'Đang xác thực…' : 'Đăng nhập hệ thống'}</span>
                {busy ? <span className="login-spinner" aria-hidden="true" /> : <AppIcon name="arrowRight" />}
              </button>
            </form>

            <div className="login-assurance">
              <AppIcon name="lock" />
              <p><strong>Phiên đăng nhập dành riêng cho Admin</strong><span>Không chia sẻ thông tin truy cập. Liên hệ quản trị viên hệ thống nếu bạn cần hỗ trợ.</span></p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export function LoginPage() {
  const { user, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await signIn(email, password);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Đăng nhập thất bại.');
    } finally {
      setBusy(false);
    }
  }

  return <LoginView busy={busy} email={email} error={error} onEmailChange={setEmail} onPasswordChange={setPassword} onSubmit={submit} onTogglePassword={() => setPasswordVisible((visible) => !visible)} password={password} passwordVisible={passwordVisible} />;
}
