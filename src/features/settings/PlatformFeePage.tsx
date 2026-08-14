import { FormEvent, useEffect, useState } from 'react';
import { AppIcon } from '../../components/AppIcon';
import { ErrorState, LoadingState } from '../../components/AsyncState';
import { adminService } from '../../services/admin.service';
import type { PlatformFeeSetting } from '../../types/admin.types';

const exampleAmount = 1_000_000;

export function PlatformFeePage() {
  const [setting, setSetting] = useState<PlatformFeeSetting>();
  const [percentage, setPercentage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const load = () => { setError(''); adminService.platformFee().then(value => { setSetting(value); setPercentage(formatInput(value.percentage)); }).catch(reason => setError(reason.message)); };
  useEffect(load, []);
  if (error && !setting) return <ErrorState message={error} retry={load}/>;
  if (!setting) return <LoadingState/>;
  const numeric = Number(percentage);
  const valid = Number.isFinite(numeric) && numeric >= 0 && numeric <= 100;
  const fee = valid ? Math.round(exampleAmount * numeric / 100) : 0;

  async function submit(event: FormEvent) {
    event.preventDefault(); if (!valid) return;
    setSaving(true); setSaved(false); setError('');
    try { const value = await adminService.updatePlatformFee(numeric); setSetting(value); setPercentage(formatInput(value.percentage)); setSaved(true); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Không thể cập nhật phí nền tảng.'); }
    finally { setSaving(false); }
  }

  return <div className="fee-page">
    <section className="fee-heading"><div><span className="section-kicker">Tài chính nền tảng</span><h1>Cấu hình phí</h1><p>Điều chỉnh tỷ lệ khấu trừ khi thanh toán dự án cho Creative.</p></div><div className="fee-current"><span>Đang áp dụng</span><strong>{formatPercent(setting.percentage)}</strong><small>Cho giao dịch mới</small></div></section>
    <div className="fee-grid"><form className="fee-form" onSubmit={submit}><div className="fee-form-title"><span className="fee-icon"><AppIcon name="finance"/></span><div><h2>Phí nền tảng dự án</h2><p>Thay đổi chỉ áp dụng cho khoản thanh toán được tạo sau khi lưu.</p></div></div><label htmlFor="platform-fee">Tỷ lệ phí</label><div className="fee-input"><input id="platform-fee" inputMode="decimal" min="0" max="100" step="0.01" value={percentage} onChange={event => { setPercentage(event.target.value); setSaved(false); }} aria-describedby="fee-help"/><span>%</span></div><small id="fee-help">Cho phép từ 0% đến 100%, tối đa 2 chữ số thập phân.</small>{!valid && percentage ? <p className="fee-error" role="alert">Nhập tỷ lệ trong khoảng 0–100%.</p> : null}{error ? <p className="fee-error" role="alert">{error}</p> : null}{saved ? <p className="fee-success" role="status">Đã cập nhật mức phí mới thành công.</p> : null}<button disabled={!valid || saving} type="submit">{saving ? 'Đang lưu…' : 'Cập nhật mức phí'}</button><p className="fee-audit"><AppIcon name="system"/> Mọi thay đổi đều được ghi vào nhật ký quản trị.</p></form>
      <aside className="fee-preview"><span className="section-kicker">Mô phỏng phân bổ</span><h2>Với dự án 1.000.000đ</h2><div className="fee-chart"><div style={{ width: `${valid ? Math.max(0, 100 - numeric) : 100}%` }}/><div style={{ width: `${valid ? numeric : 0}%` }}/></div><div className="fee-row"><span><i className="creative-dot"/>Creative thực nhận</span><strong>{money(exampleAmount - fee)}</strong></div><div className="fee-row"><span><i className="platform-dot"/>Phí nền tảng</span><strong>{money(fee)}</strong></div><div className="fee-note"><AppIcon name="system"/><p><strong>Không hồi tố</strong><br/>Các khoản thanh toán đã tạo tiếp tục sử dụng tỷ lệ đã lưu trước đó.</p></div>{setting.updatedAt ? <small className="fee-updated">Cập nhật gần nhất: {new Date(setting.updatedAt).toLocaleString('vi-VN')}</small> : null}</aside></div>
  </div>;
}

function formatInput(value: number) { return Number(value.toFixed(2)).toString(); }
function formatPercent(value: number) { return `${formatInput(value)}%`; }
function money(value: number) { return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value); }
