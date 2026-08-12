import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../store/auth-context';
export function LoginPage() {
  const { user, signIn } = useAuth(); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/" replace />;
  async function submit(e: FormEvent) { e.preventDefault(); setBusy(true); setError(''); try { await signIn(email, password); } catch (x) { setError(x instanceof Error ? x.message : 'Đăng nhập thất bại.'); } finally { setBusy(false); } }
  return <main className="login"><section><div className="brand login-brand"><span>DC</span><div>Digital Creative<small>ADMIN CONSOLE</small></div></div><h1>Quản trị hệ thống</h1><p>Đăng nhập bằng tài khoản được cấp quyền Admin.</p><form onSubmit={submit}><label>Email<input type="email" required autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} /></label><label>Mật khẩu<input type="password" required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} /></label>{error && <p className="form-error" role="alert">{error}</p>}<button disabled={busy}>{busy ? 'Đang xác thực…' : 'Đăng nhập'}</button></form></section></main>;
}
