import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ErrorState, LoadingState } from '../../components/AsyncState';
import { adminService } from '../../services/admin.service';
import type { AgreementVersionInput, PlatformAgreementVersion } from '../../types/admin.types';

const empty: AgreementVersionInput = { version:'', summaryContent:'', fullContent:'', effectiveFrom:'', requiresReAcceptance:false };

export function AgreementVersionPage() {
  const { agreementId, versionId } = useParams();
  const creating = !versionId;
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [saved, setSaved] = useState<PlatformAgreementVersion | null>(null);
  const [loading, setLoading] = useState(!creating);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [cloneVersion, setCloneVersion] = useState('');
  useEffect(() => { if (!versionId) return; adminService.agreementVersion(versionId).then(item => { setSaved(item); setForm({ version:item.version,summaryContent:item.summaryContent,fullContent:item.fullContent,effectiveFrom:toLocalInput(item.effectiveFrom),requiresReAcceptance:item.requiresReAcceptance }); }).catch(cause => setError(cause.message)).finally(() => setLoading(false)); }, [versionId]);
  const editable = creating || saved?.status === 'DRAFT';
  async function save(event: FormEvent) { event.preventDefault(); if (!editable) return; setBusy(true); setError(''); try { const payload = { ...form, effectiveFrom:new Date(form.effectiveFrom).toISOString() }; const result = creating ? await adminService.createAgreementVersion(agreementId!, payload) : await adminService.updateAgreementVersion(versionId!, payload); navigate(`/admin/agreement-versions/${result.id}`, { replace:true }); setSaved(result); } catch (cause) { setError((cause as Error).message); } finally { setBusy(false); } }
  async function publish() { if (!saved || !window.confirm(`Xuất bản phiên bản ${saved.version}? Nội dung sẽ không thể chỉnh sửa sau thao tác này.`)) return; setBusy(true); setError(''); try { setSaved(await adminService.publishAgreementVersion(saved.id)); } catch (cause) { setError((cause as Error).message); } finally { setBusy(false); } }
  async function clone() { if (!saved || !cloneVersion.trim()) return; setBusy(true); setError(''); try { const draft = await adminService.cloneAgreementVersion(saved.id, cloneVersion.trim()); navigate(`/admin/agreement-versions/${draft.id}`); } catch (cause) { setError((cause as Error).message); } finally { setBusy(false); } }
  if (loading) return <LoadingState/>;
  if (error && !editable) return <ErrorState message={error} retry={() => window.location.reload()}/>;
  return <div className="agreement-editor-page">
    <Link className="detail-back" to="/admin/agreements">← Lịch sử phiên bản</Link>
    <header className="agreement-heading"><div><span className="eyebrow">{creating ? 'Tạo bản nháp' : `Phiên bản ${saved?.version}`}</span><h1>{creating ? 'Tạo phiên bản thỏa thuận' : saved?.status === 'DRAFT' ? 'Chỉnh sửa bản nháp' : 'Nội dung đã xuất bản'}</h1><p>{editable ? 'Soạn Markdown an toàn và kiểm tra bản xem trước trước khi xuất bản.' : 'Phiên bản đã công bố là bất biến. Hãy nhân bản để sửa đổi.'}</p></div>{saved?.status === 'DRAFT' ? <button className="agreement-publish" disabled={busy} onClick={publish}>Xuất bản</button> : null}</header>
    {error ? <div className="agreement-alert" role="alert">{error}</div> : null}
    <form className="agreement-editor" onSubmit={save}>
      <div className="agreement-fields">
        <label>Phiên bản<input required maxLength={40} disabled={!creating} value={form.version} onChange={event => setForm(value => ({...value,version:event.target.value}))} placeholder="1.1"/></label>
        <label>Ngày hiệu lực<input required type="datetime-local" disabled={!editable} value={form.effectiveFrom} onChange={event => setForm(value => ({...value,effectiveFrom:event.target.value}))}/></label>
        <label className="agreement-check"><input type="checkbox" disabled={!editable} checked={form.requiresReAcceptance} onChange={event => setForm(value => ({...value,requiresReAcceptance:event.target.checked}))}/><span><strong>Yêu cầu người cũ xác nhận lại</strong><small>Chỉ khóa quyền nhận công việc mới, không ảnh hưởng nghĩa vụ đang thực hiện.</small></span></label>
        <label>Tóm tắt điều khoản<textarea required maxLength={10000} disabled={!editable} rows={8} value={form.summaryContent} onChange={event => setForm(value => ({...value,summaryContent:event.target.value}))}/></label>
        <label>Nội dung đầy đủ<textarea required maxLength={200000} disabled={!editable} rows={28} value={form.fullContent} onChange={event => setForm(value => ({...value,fullContent:event.target.value}))}/></label>
        {editable ? <button className="agreement-primary" disabled={busy} type="submit">{busy ? 'Đang lưu…' : 'Lưu bản nháp'}</button> : null}
        {!editable ? <div className="agreement-clone"><label>Phiên bản mới<input maxLength={40} value={cloneVersion} onChange={event => setCloneVersion(event.target.value)} placeholder="1.2"/></label><button className="agreement-primary" disabled={busy || !cloneVersion.trim()} type="button" onClick={clone}>Nhân thành bản nháp</button></div> : null}
      </div>
      <AgreementPreview title="Bản xem trước" content={form.fullContent}/>
    </form>
  </div>;
}

function AgreementPreview({ title, content }: { title:string;content:string }) { return <section className="agreement-preview"><header><span className="eyebrow">Preview</span><h2>{title}</h2></header><div>{content.split(/\r?\n/).filter(Boolean).map((line,index) => /^(#{1,3}\s|ĐIỀU\s|CHƯƠNG\s)/i.test(line.trim()) ? <h3 key={index}>{line.replace(/^#{1,3}\s*/, '')}</h3> : <p key={index}>{line}</p>)}</div></section>; }
function toLocalInput(value: string) { const date = new Date(value); const offset = date.getTimezoneOffset() * 60000; return new Date(date.getTime() - offset).toISOString().slice(0,16); }
