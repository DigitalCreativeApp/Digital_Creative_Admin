import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ErrorState, LoadingState } from '../../components/AsyncState';
import { adminService } from '../../services/admin.service';
import type { PlatformAgreement } from '../../types/admin.types';

const statusLabel = { DRAFT:'Bản nháp', SCHEDULED:'Đã lên lịch', ACTIVE:'Đang áp dụng', SUPERSEDED:'Phiên bản cũ', ARCHIVED:'Lưu trữ' } as const;

export function AgreementListPage() {
  const [agreements, setAgreements] = useState<PlatformAgreement[] | null>(null);
  const [error, setError] = useState('');
  const load = () => { setError(''); adminService.platformAgreements().then(setAgreements).catch(cause => setError(cause.message)); };
  useEffect(load, []);
  if (error) return <ErrorState message={error} retry={load}/>;
  if (!agreements) return <LoadingState/>;
  const agreement = agreements.find(item => item.agreementType === 'SERVICE_PROVIDER');
  return <div className="agreements-page">
    <header className="agreement-heading">
      <div><span className="eyebrow">Pháp lý / Thỏa thuận nền tảng</span><h1>Thỏa thuận Người cung cấp dịch vụ</h1><p>Quản lý nội dung, hiệu lực và bằng chứng xác nhận theo từng phiên bản.</p></div>
      {agreement ? <Link className="agreement-primary" to={`/admin/agreements/${agreement.id}/versions/new`}>+ Tạo phiên bản mới</Link> : null}
    </header>
    {!agreement ? <section className="agreement-empty"><strong>Chưa có thỏa thuận gốc</strong><p>Backend sẽ khởi tạo phiên bản pháp lý ban đầu khi triển khai migration.</p></section> : <>
      <section className="agreement-summary"><div><span>Mã quản lý</span><strong>{agreement.code}</strong></div><div><span>Tổng phiên bản</span><strong>{agreement.versions.length}</strong></div><div><span>Tổng xác nhận</span><strong>{agreement.versions.reduce((sum, item) => sum + item.acceptanceCount, 0).toLocaleString('vi-VN')}</strong></div></section>
      <section className="agreement-version-list" aria-label="Lịch sử phiên bản">
        {agreement.versions.map(version => <article key={version.id}>
          <div className="version-main"><span className={`agreement-status ${version.status.toLowerCase()}`}>{statusLabel[version.status]}</span><h2>Phiên bản {version.version}</h2><p>Hiệu lực {new Date(version.effectiveFrom).toLocaleDateString('vi-VN')} · {version.requiresReAcceptance ? 'Yêu cầu xác nhận lại' : 'Không yêu cầu xác nhận lại'}</p></div>
          <div className="version-count"><strong>{version.acceptanceCount.toLocaleString('vi-VN')}</strong><span>người đã xác nhận</span></div>
          <div className="version-actions"><Link to={`/admin/agreement-versions/${version.id}`}>Xem {version.status === 'DRAFT' ? '& chỉnh sửa' : 'nội dung'}</Link><Link to={`/admin/agreement-versions/${version.id}/acceptances`}>Danh sách xác nhận</Link></div>
        </article>)}
        {agreement.versions.length === 0 ? <div className="agreement-empty"><strong>Chưa có phiên bản</strong><p>Tạo bản nháp đầu tiên để bắt đầu.</p></div> : null}
      </section>
    </>}
  </div>;
}
