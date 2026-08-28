import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ErrorState, LoadingState } from '../../components/AsyncState';
import { adminService } from '../../services/admin.service';
import type { DisputeDetail, DisputeResolution } from '../../types/admin.types';
import { activeDisputeStatuses, disputeCategoryLabel, disputeResolutionLabel, disputeStatusLabel, disputeStatusTone, formatDate, formatVnd } from './dispute-presentation';

const resolutions: DisputeResolution[] = ['CONTINUE_WORK','CANCEL_AND_REFUND','PAY_CREATOR_AND_CLOSE','CANCEL_AND_PARTIAL_SETTLEMENT'];

export function DisputeDetailPage() {
  const { id = '' } = useParams();
  const [item,setItem] = useState<DisputeDetail|null>(null);
  const [loading,setLoading] = useState(true);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const [resolution,setResolution] = useState<DisputeResolution>('CONTINUE_WORK');
  const [creatorAmount,setCreatorAmount] = useState('');
  const [reason,setReason] = useState('');
  const load = useCallback(() => {
    setLoading(true); setError('');
    adminService.dispute(id).then(setItem).catch(cause => setError(cause instanceof Error ? cause.message : 'Không thể tải tranh chấp.')).finally(() => setLoading(false));
  },[id]);
  useEffect(load,[load]);
  const gross = resolution === 'CANCEL_AND_REFUND' || resolution === 'CONTINUE_WORK' ? 0 : resolution === 'PAY_CREATOR_AND_CLOSE' ? item?.heldAmount ?? 0 : Number(creatorAmount.replace(/\D/g,''));
  const preview = useMemo(() => { const fee=Math.round(gross*(item?.platformFeeRate ?? 0)); return { refund:Math.max(0,(item?.heldAmount ?? 0)-gross),fee,net:Math.max(0,gross-fee) }; },[gross,item]);
  const active = item ? activeDisputeStatuses.has(item.status) : false;
  async function run(action:()=>Promise<unknown>) { if (busy) return; setBusy(true); setError(''); try { await action(); setReason(''); await adminService.dispute(id).then(setItem); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể thực hiện thao tác.'); } finally { setBusy(false); } }
  if (loading && !item) return <LoadingState/>;
  if (error && !item) return <ErrorState message={error} retry={load}/>;
  if (!item) return null;
  return <div className="dispute-page dispute-detail">
    <Link className="dispute-back" to="/admin/disputes">← Danh sách tranh chấp</Link>
    <header className="dispute-heading"><div><span className="eyebrow">Hồ sơ {item.code}</span><h1>{item.workOrderTitle}</h1><p>{disputeCategoryLabel[item.category]} · Mở {formatDate(item.openedAt)}</p></div><span className={`dispute-badge ${disputeStatusTone(item.status)}`}>{disputeStatusLabel[item.status]}</span></header>
    {error ? <div className="dispute-alert" role="alert">{error}</div>:null}
    <div className="dispute-detail-grid"><main className="dispute-detail-main">
      <section className="dispute-card"><h2>Công việc và các bên</h2><dl className="dispute-kv"><div><dt>Người thuê</dt><dd>{item.buyerName}</dd></div><div><dt>Nhà sáng tạo</dt><dd>{item.creativeName}</dd></div><div><dt>WorkOrder</dt><dd>{item.workOrderId}</dd></div><div><dt>Hợp đồng</dt><dd><a href={`/api/work-orders/${item.workOrderId}/contract`} target="_blank" rel="noreferrer">Xem hợp đồng ↗</a></dd></div></dl></section>
      <section className="dispute-card"><h2>Yêu cầu người mở</h2><strong>{item.title}</strong><p>{item.description}</p><small>Người mở: {item.openedByUserId === item.buyerUserId ? item.buyerName : item.creativeName}</small></section>
      <section className="dispute-card"><h2>Phản hồi hai bên</h2>{item.messages.length ? item.messages.map(message => <article className="dispute-entry" key={message.id}><strong>{message.senderUserId === item.buyerUserId ? item.buyerName : item.creativeName}</strong><p>{message.content}</p><small>{formatDate(message.createdAt)}</small></article>) : <p className="dispute-muted">Chưa có phản hồi.</p>}</section>
      <section className="dispute-card"><h2>Bằng chứng hai bên</h2>{item.evidence.length ? <ul className="dispute-files">{item.evidence.map(file => <li key={file.id}><span><strong>{file.fileName ?? 'Tệp bằng chứng'}</strong><small>{file.mimeType} · {Math.ceil(file.fileSize/1024).toLocaleString('vi-VN')} KB</small></span>{file.url ? <a href={file.url} target="_blank" rel="noreferrer">Mở tệp ↗</a> : <span>Riêng tư</span>}</li>)}</ul> : <p className="dispute-muted">Chưa có bằng chứng.</p>}</section>
      {item.cancellationRequest ? <section className="dispute-card"><h2>Lịch sử đề nghị hủy</h2><p>{item.cancellationRequest.reason}</p><small>{item.cancellationRequest.status} · Nhà sáng tạo {formatVnd(item.cancellationRequest.creatorGrossAmount)} · Hoàn {formatVnd(item.cancellationRequest.clientRefundAmount)}</small></section>:null}
      <section className="dispute-card"><h2>Lịch sử phương án</h2>{item.offers.length ? item.offers.map(offer => <article className="dispute-entry" key={offer.id}><strong>Nhà sáng tạo {formatVnd(offer.creatorGrossAmount)} · Người thuê {formatVnd(offer.clientRefundAmount)}</strong><p>Phí {formatVnd(offer.platformFee)} · Thực nhận {formatVnd(offer.creatorNetAmount)}</p><small>{offer.status} · {formatDate(offer.createdAt)}</small></article>) : <p className="dispute-muted">Chưa có phương án tài chính.</p>}</section>
      <section className="dispute-card"><h2>Lịch sử trạng thái</h2><ol className="dispute-history">{item.history.map(entry => <li key={entry.id}><strong>{disputeStatusLabel[entry.toStatus]}</strong><span>{entry.action}{entry.note ? ` · ${entry.note}`:''}</span><small>{formatDate(entry.createdAt)}</small></li>)}</ol></section>
    </main><aside className="dispute-detail-side">
      <section className="dispute-card dispute-finance"><h2>Tài chính</h2><dl><div><dt>Giá trị công việc / Tiền đã thanh toán</dt><dd>{formatVnd(item.heldAmount)}</dd></div><div><dt>Tiền đang giữ</dt><dd>{formatVnd(active ? item.heldAmount : 0)}</dd></div><div><dt>Phí nền tảng dự kiến</dt><dd>{formatVnd(item.originalPlatformFee)}</dd></div><div><dt>Pending Creator Income</dt><dd>{formatVnd(item.originalCreatorIncome)}</dd></div></dl>{active ? <p>Tiền đang bị khóa cho đến khi có kết quả cuối cùng.</p>:null}</section>
      <section className="dispute-card dispute-actions"><h2>Xử lý tranh chấp</h2>{active ? <><label><span>Lý do xử lý *</span><textarea value={reason} onChange={event => setReason(event.target.value)} rows={4}/></label><button className="ghost" disabled={busy || reason.trim().length < 3} onClick={() => void run(() => adminService.requestDisputeEvidence(id,reason.trim()))}>Yêu cầu bổ sung bằng chứng</button><fieldset><legend>Quyết định cuối cùng</legend>{resolutions.map(value => <label className="dispute-radio" key={value}><input checked={resolution===value} name="resolution" onChange={() => setResolution(value)} type="radio"/><span>{value==='CANCEL_AND_REFUND' ? 'Hoàn toàn bộ cho Người thuê' : disputeResolutionLabel[value]}</span></label>)}</fieldset>{resolution==='CANCEL_AND_PARTIAL_SETTLEMENT' ? <label><span>Nhà sáng tạo nhận trước phí *</span><input inputMode="numeric" value={creatorAmount} onChange={event => setCreatorAmount(event.target.value)}/></label>:null}{resolution!=='CONTINUE_WORK' ? <div className="dispute-preview"><span>Nhà sáng tạo trước phí <strong>{formatVnd(gross)}</strong></span><span>Phí nền tảng <strong>{formatVnd(preview.fee)}</strong></span><span>Nhà sáng tạo thực nhận <strong>{formatVnd(preview.net)}</strong></span><span>Người thuê được hoàn <strong>{formatVnd(preview.refund)}</strong></span></div>:<p className="dispute-muted">Không payout/refund; WorkOrder trở về trạng thái trước tranh chấp.</p>}<button disabled={busy || reason.trim().length < 3 || (resolution==='CANCEL_AND_PARTIAL_SETTLEMENT' && (!creatorAmount || gross > item.heldAmount))} onClick={() => void run(() => adminService.resolveDispute(id,resolution,resolution==='CANCEL_AND_PARTIAL_SETTLEMENT'?gross:null,reason.trim()))}>Giải quyết tranh chấp</button></>:<p>Hồ sơ đã có kết quả cuối cùng.</p>}</section>
    </aside></div>
  </div>;
}
