import { FormEvent, useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ErrorState, LoadingState } from '../../components/AsyncState';
import { adminService } from '../../services/admin.service';
import type { AgreementAcceptancePage } from '../../types/admin.types';

export function AgreementAcceptancesPage() {
  const { versionId } = useParams();
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get('page') || 1));
  const search = params.get('search') || '';
  const [draft, setDraft] = useState(search);
  const [data, setData] = useState<AgreementAcceptancePage | null>(null);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState<string | null>(null);
  useEffect(() => { setError(''); setData(null); adminService.agreementAcceptances(versionId!, page, 20, search).then(setData).catch(cause => setError(cause.message)); }, [versionId,page,search]);
  function submit(event: FormEvent) { event.preventDefault(); const next = new URLSearchParams(); if (draft.trim()) next.set('search', draft.trim()); setParams(next); }
  async function download(id: string) { setDownloading(id); setError(''); try { const blob = await adminService.agreementDocument(id); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `NTS-AGREEMENT-${id}.pdf`; anchor.click(); URL.revokeObjectURL(url); } catch (cause) { setError((cause as Error).message); } finally { setDownloading(null); } }
  if (error) return <ErrorState message={error} retry={() => setParams(current => new URLSearchParams(current))}/>;
  return <div className="agreement-acceptances">
    <Link className="detail-back" to={`/admin/agreement-versions/${versionId}`}>← Nội dung phiên bản</Link>
    <header className="agreement-heading"><div><span className="eyebrow">Bằng chứng xác nhận</span><h1>Người đã xác nhận</h1><p>Danh sách phân trang, chỉ dành cho quản trị viên pháp lý.</p></div><span className="agreement-total">{data?.totalItems.toLocaleString('vi-VN') ?? '—'} xác nhận</span></header>
    <form className="agreement-search" onSubmit={submit}><label htmlFor="acceptance-search">Tìm theo họ tên hoặc email</label><div><input id="acceptance-search" value={draft} onChange={event => setDraft(event.target.value)} placeholder="Nhập từ khóa…"/><button type="submit">Tìm kiếm</button></div></form>
    {!data ? <LoadingState/> : data.data.length === 0 ? <section className="agreement-empty"><strong>Chưa có kết quả</strong><p>Thử thay đổi từ khóa tìm kiếm.</p></section> : <>
      <div className="agreement-table-wrap"><table><thead><tr><th>Người xác nhận</th><th>Thời gian</th><th>Phương thức</th><th>PDF</th></tr></thead><tbody>{data.data.map(item => <tr key={item.id}><td><strong>{item.signerName}</strong><small>{item.email}</small></td><td>{new Date(item.acceptedAt).toLocaleString('vi-VN')}</td><td>{item.acceptanceMethod}</td><td>{item.documentStatus === 'AVAILABLE' ? <button className="agreement-download" disabled={downloading === item.id} onClick={() => void download(item.id)}>{downloading === item.id ? 'Đang tải…' : 'Tải PDF'}</button> : <span className="muted">{item.documentStatus}</span>}</td></tr>)}</tbody></table></div>
      <div className="withdrawal-pagination"><span>Trang {data.page}/{data.totalPages || 1}</span><button disabled={page <= 1} onClick={() => setParams(current => { const next=new URLSearchParams(current);next.set('page',String(page-1));return next; })}>Trước</button><button disabled={page >= data.totalPages} onClick={() => setParams(current => { const next=new URLSearchParams(current);next.set('page',String(page+1));return next; })}>Sau</button></div>
    </>}
  </div>;
}
