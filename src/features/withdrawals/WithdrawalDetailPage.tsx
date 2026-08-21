import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ErrorState, LoadingState } from '../../components/AsyncState';
import { adminService } from '../../services/admin.service';
import type { WithdrawalDetail } from '../../types/admin.types';
import { formatAdminDate, formatVnd } from './withdrawal-format';
import { withdrawalAuditLabel, withdrawalStatusLabel, withdrawalStatusTone } from './withdrawal-status';

type Dialog = 'start' | 'reject' | 'fail' | 'complete' | null;

export function WithdrawalDetailPage() {
  const { id = '' } = useParams();
  const [data, setData] = useState<WithdrawalDetail>();
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [busy, setBusy] = useState(false);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [reason, setReason] = useState('');
  const [bankReference, setBankReference] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [fundsMayHaveTransferred, setFundsMayHaveTransferred] = useState(false);

  const load = () => {
    setError('');
    adminService.withdrawal(id).then(setData).catch(cause => setError(cause.message));
  };

  useEffect(load, [id]);

  const act = async (work: () => Promise<WithdrawalDetail>, message: string) => {
    setBusy(true);
    setError('');
    try {
      setData(await work());
      setToast(message);
      setDialog(null);
      setReason('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể thực hiện thao tác.');
    } finally {
      setBusy(false);
    }
  };

  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setToast(`Đã sao chép ${label}.`);
    } catch {
      setError(`Không thể sao chép ${label}.`);
    }
  };

  const upload = async (file?: File) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type) || file.size > 8 * 1024 * 1024) {
      setError('Biên lai chỉ hỗ trợ JPG, PNG hoặc PDF tối đa 8 MB.');
      return;
    }
    await act(() => adminService.uploadWithdrawalReceipt(id, file), 'Đã tải biên lai.');
  };

  if (error && !data) return <ErrorState message={error} retry={load}/>;
  if (!data) return <LoadingState/>;

  const confirm = () => {
    if (dialog === 'start') void act(() => adminService.startWithdrawal(id), 'Đã tiếp nhận xử lý yêu cầu.');
    if (dialog === 'reject') void act(() => adminService.rejectWithdrawal(id, reason), 'Đã từ chối và hoàn tiền về ví.');
    if (dialog === 'fail') void act(() => adminService.failWithdrawal(id, reason, fundsMayHaveTransferred), 'Đã ghi nhận xử lý thất bại.');
    if (dialog === 'complete') void act(() => adminService.completeWithdrawal(id, bankReference, adminNote), 'Đã xác nhận chuyển tiền thành công.');
  };

  return <div className="withdrawal-detail">
    <Link className="detail-back" to="/admin/withdrawals">← Danh sách yêu cầu</Link>

    <header className="withdrawal-detail-head">
      <div>
        <div className="detail-title-line">
          <span className="eyebrow">Chi tiết rút tiền</span>
          <span className={`withdrawal-badge large ${withdrawalStatusTone[data.status]}`}>{withdrawalStatusLabel[data.status]}</span>
        </div>
        <h1>{data.withdrawalCode}</h1>
        <p>Gửi lúc {formatAdminDate(data.requestedAt)} · {data.creativeName}</p>
      </div>
    </header>

    {toast ? <Notice tone="success" message={toast} onClose={() => setToast('')}/> : null}
    {error ? <Notice tone="error" message={error} onClose={() => setError('')}/> : null}
    {data.requiresManualReview ? <div className="manual-review-warning">
      <strong>Cần đối soát thủ công</strong>
      <span>Giao dịch có thể đã rời tài khoản ngân hàng công ty. Không hoàn tiền tự động trước khi kiểm tra.</span>
    </div> : null}

    <div className="withdrawal-workspace">
      <div className="withdrawal-main-column">
        <BankPanel data={data} onCopy={copy}/>

        {data.status === 'PENDING' ? <section className="withdrawal-panel pending-guide">
          <SectionHeading index="02" title="Tiếp nhận yêu cầu" description="Kiểm tra thông tin người nhận trước khi bắt đầu xử lý."/>
          <div className="check-list">
            <span>1</span><p><strong>Đối chiếu người nhận</strong>Ngân hàng, số tài khoản và tên chủ tài khoản phải trùng khớp.</p>
            <span>2</span><p><strong>Giữ một người xử lý</strong>Sau khi tiếp nhận, yêu cầu sẽ được gán cho tài khoản Admin hiện tại.</p>
          </div>
        </section> : null}

        {data.status === 'PROCESSING' ? <ProcessingPanel
          data={data}
          bankReference={bankReference}
          adminNote={adminNote}
          busy={busy}
          onBankReference={setBankReference}
          onNote={setAdminNote}
          onCopy={copy}
          onComplete={() => {
            if (bankReference.trim().length < 3) {
              setError('Vui lòng nhập mã giao dịch ngân hàng.');
              return;
            }
            setDialog('complete');
          }}
          onFail={() => setDialog('fail')}
          onUpload={upload}
        /> : null}

        {['COMPLETED', 'REJECTED', 'FAILED', 'CANCELLED'].includes(data.status) ? <ResultPanel data={data}/> : null}
        <Timeline data={data}/>
      </div>

      <aside className="withdrawal-summary-card">
        <span className="summary-label">Số tiền thực nhận</span>
        <strong className="summary-total">{formatVnd(data.netAmount)}</strong>
        <div className="amount-breakdown">
          <SummaryRow label="Số tiền yêu cầu" value={formatVnd(data.amount)}/>
          <SummaryRow label="Phí xử lý" value={formatVnd(data.fee)}/>
        </div>
        <div className="summary-divider"/>
        <SummaryRow label="Creative" value={data.creativeName}/>
        <SummaryRow label="Email" value={data.email}/>
        <SummaryRow label="Người xử lý" value={data.processor ?? 'Chưa tiếp nhận'}/>
        <SummaryRow label="Bắt đầu xử lý" value={formatAdminDate(data.processingAt)}/>

        {data.status === 'PENDING' ? <div className="summary-actions">
          <button type="button" className="primary-action" onClick={() => setDialog('start')}>Tiếp nhận xử lý</button>
          <button type="button" className="danger-outline" onClick={() => setDialog('reject')}>Từ chối yêu cầu</button>
        </div> : null}

        {data.receiptUrl ? <a className="receipt-link" href={data.receiptUrl} target="_blank" rel="noreferrer">Xem biên lai chuyển khoản ↗</a> : null}
      </aside>
    </div>

    {dialog ? <Confirmation
      dialog={dialog}
      data={data}
      reason={reason}
      fundsMayHaveTransferred={fundsMayHaveTransferred}
      busy={busy}
      bankReference={bankReference}
      onReason={setReason}
      onFunds={setFundsMayHaveTransferred}
      onClose={() => setDialog(null)}
      onConfirm={confirm}
    /> : null}
  </div>;
}

function BankPanel({ data, onCopy }: { data: WithdrawalDetail; onCopy(value: string, label: string): Promise<void> }) {
  return <section className="withdrawal-panel bank-panel">
    <SectionHeading index="01" title="Tài khoản nhận tiền" description="Thông tin đã được người dùng lưu khi tạo yêu cầu."/>
    <div className="bank-identity">
      <span className="bank-mark">{data.bankName.slice(0, 2).toUpperCase()}</span>
      <div><small>Ngân hàng</small><strong>{data.bankName}</strong></div>
    </div>
    <div className="bank-details">
      <DetailRow label="Số tài khoản" value={data.bankAccountNumber} action="Sao chép" onAction={() => void onCopy(data.bankAccountNumber, 'số tài khoản')}/>
      <DetailRow label="Tên chủ tài khoản" value={data.bankAccountName}/>
      <DetailRow label="Nội dung chuyển khoản" value={data.transferContent} action="Sao chép" onAction={() => void onCopy(data.transferContent, 'nội dung chuyển khoản')}/>
    </div>
  </section>;
}

function ProcessingPanel({ data, bankReference, adminNote, busy, onBankReference, onNote, onCopy, onComplete, onFail, onUpload }: {
  data: WithdrawalDetail; bankReference: string; adminNote: string; busy: boolean;
  onBankReference(value: string): void; onNote(value: string): void;
  onCopy(value: string, label: string): Promise<void>; onComplete(): void; onFail(): void; onUpload(file?: File): Promise<void>;
}) {
  return <section className="withdrawal-panel processing-panel">
    <SectionHeading index="02" title="Thực hiện chuyển khoản" description="Quét QR, đối chiếu lần cuối và lưu bằng chứng giao dịch."/>
    <div className="processing-workbench">
      <div className="qr-zone">
        <img alt={`Mã QR chuyển khoản ${data.withdrawalCode}`} src={data.qrCodeUrl}/>
        <strong>{formatVnd(data.netAmount)}</strong>
        <button type="button" onClick={() => void onCopy(data.transferContent, 'nội dung chuyển khoản')}>Sao chép nội dung</button>
      </div>
      <div className="transfer-form">
        <label><span>Mã giao dịch ngân hàng *</span><input autoComplete="off" placeholder="Ví dụ: FT2408..." value={bankReference} onChange={event => onBankReference(event.target.value)}/></label>
        <label><span>Biên lai chuyển khoản</span><input accept="image/jpeg,image/png,application/pdf" disabled={busy} type="file" onChange={event => void onUpload(event.target.files?.[0])}/><small>JPG, PNG hoặc PDF · tối đa 8 MB</small></label>
        <label><span>Ghi chú nội bộ</span><textarea maxLength={2000} placeholder="Thông tin cần lưu cho bộ phận đối soát..." value={adminNote} onChange={event => onNote(event.target.value)}/></label>
        <div className="transfer-warning">Chỉ xác nhận hoàn tất sau khi ứng dụng ngân hàng báo giao dịch thành công.</div>
        <div className="transfer-actions">
          <button type="button" className="danger-outline" onClick={onFail}>Giao dịch thất bại</button>
          <button type="button" className="primary-action" disabled={busy} onClick={onComplete}>Xác nhận đã chuyển</button>
        </div>
      </div>
    </div>
  </section>;
}

function ResultPanel({ data }: { data: WithdrawalDetail }) {
  const reason = data.rejectReason ?? data.failureReason;
  return <section className="withdrawal-panel result-panel">
    <SectionHeading index="02" title="Kết quả xử lý" description="Thông tin cuối cùng của yêu cầu rút tiền."/>
    <div className="result-grid">
      <DetailRow label="Trạng thái" value={withdrawalStatusLabel[data.status]}/>
      <DetailRow label="Mã giao dịch ngân hàng" value={data.bankTransactionReference ?? '—'}/>
      <DetailRow label="Hoàn tất lúc" value={formatAdminDate(data.completedAt ?? data.rejectedAt ?? data.failedAt)}/>
      <DetailRow label="Lý do / ghi chú" value={reason ?? data.adminNote ?? 'Không có ghi chú'}/>
    </div>
  </section>;
}

function Timeline({ data }: { data: WithdrawalDetail }) {
  return <section className="withdrawal-panel timeline">
    <SectionHeading index="03" title="Lịch sử xử lý" description="Các thay đổi được ghi nhận theo thời gian."/>
    {data.timeline.length ? data.timeline.map((item, index) => <div className="timeline-row" key={`${item.createdAt}-${index}`}>
      <time>{formatAdminDate(item.createdAt)}</time><span/><div><strong>{withdrawalAuditLabel[item.action] ?? item.action}</strong><small>{item.actor}</small></div>
    </div>) : <p className="timeline-empty">Chưa có lịch sử thao tác.</p>}
  </section>;
}

function Confirmation({ dialog, data, reason, fundsMayHaveTransferred, busy, bankReference, onReason, onFunds, onClose, onConfirm }: {
  dialog: Exclude<Dialog, null>; data: WithdrawalDetail; reason: string; fundsMayHaveTransferred: boolean; busy: boolean; bankReference: string;
  onReason(value: string): void; onFunds(value: boolean): void; onClose(): void; onConfirm(): void;
}) {
  const reasonDialog = dialog === 'reject' || dialog === 'fail';
  const title = dialog === 'start' ? 'Tiếp nhận xử lý yêu cầu?' : dialog === 'reject' ? 'Từ chối yêu cầu?' : dialog === 'fail' ? 'Đánh dấu giao dịch thất bại?' : 'Xác nhận đã chuyển tiền?';
  return <div className="withdrawal-modal" role="dialog" aria-modal="true" aria-labelledby="withdrawal-confirm-title">
    <section>
      <span className="eyebrow">Xác nhận thao tác</span>
      <h2 id="withdrawal-confirm-title">{title}</h2>
      <div className="confirm-summary"><strong>{formatVnd(data.netAmount)}</strong><span>{data.withdrawalCode} · {data.creativeName}</span>{dialog === 'complete' ? <span>{data.bankName} · {data.bankAccountNumber}<br/>Mã giao dịch: {bankReference}</span> : null}</div>
      {reasonDialog ? <label><span>{dialog === 'reject' ? 'Lý do từ chối *' : 'Lý do thất bại *'}</span><textarea autoFocus maxLength={2000} value={reason} onChange={event => onReason(event.target.value)}/></label> : null}
      {dialog === 'fail' ? <label className="review-checkbox"><input checked={fundsMayHaveTransferred} type="checkbox" onChange={event => onFunds(event.target.checked)}/><span>Tiền có thể đã rời tài khoản ngân hàng — giữ hold và yêu cầu đối soát thủ công</span></label> : null}
      {dialog === 'reject' ? <p>Số tiền đang giữ sẽ được hoàn lại vào số dư khả dụng của người dùng.</p> : null}
      <div className="modal-actions"><button type="button" onClick={onClose}>Quay lại</button><button type="button" className={reasonDialog ? 'danger-action' : 'primary-action'} disabled={busy || (reasonDialog && reason.trim().length < 3)} onClick={onConfirm}>{busy ? 'Đang xử lý…' : 'Xác nhận'}</button></div>
    </section>
  </div>;
}

function Notice({ tone, message, onClose }: { tone: 'success' | 'error'; message: string; onClose(): void }) {
  return <div className={`withdrawal-toast ${tone === 'error' ? 'error' : ''}`} role={tone === 'error' ? 'alert' : 'status'}>{message}<button type="button" aria-label="Đóng thông báo" onClick={onClose}>×</button></div>;
}

function SectionHeading({ index, title, description }: { index: string; title: string; description: string }) {
  return <header className="section-heading-detail"><span>{index}</span><div><h2>{title}</h2><p>{description}</p></div></header>;
}

function DetailRow({ label, value, action, onAction }: { label: string; value: string; action?: string; onAction?: () => void }) {
  return <div className="detail-row"><span>{label}</span><strong>{value}</strong>{action ? <button type="button" onClick={onAction}>{action}</button> : null}</div>;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return <div className="summary-row"><span>{label}</span><strong>{value}</strong></div>;
}
