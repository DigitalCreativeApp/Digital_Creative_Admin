export type OperationsNavItem = { label: string; to: string; icon: string; disputeFeature?: boolean };
export type OperationsNavGroup = { label: string; items: OperationsNavItem[] };

export const operationsNavigation: OperationsNavGroup[] = [
  { label: 'Điều hành', items: [
    { label: 'Tổng quan', to: '/', icon: 'dashboard' },
    { label: 'Người dùng', to: '/resources/accounts', icon: 'users' },
    { label: 'Dự án', to: '/resources/projects', icon: 'projects' },
    { label: 'Dịch vụ', to: '/resources/services', icon: 'content' },
    { label: 'Work Orders', to: '/resources/workorders', icon: 'projects' },
  ] },
  { label: 'Tài chính & rủi ro', items: [
    { label: 'Tài chính', to: '/resources/wallettransactions', icon: 'finance' },
    { label: 'Rút tiền', to: '/admin/withdrawals', icon: 'finance' },
    { label: 'Tranh chấp', to: '/admin/disputes', icon: 'operations', disputeFeature: true },
    { label: 'Báo cáo', to: '/resources/reports', icon: 'operations' },
  ] },
  { label: 'Pháp lý & hệ thống', items: [
    { label: 'Hợp đồng & pháp lý', to: '/admin/agreements', icon: 'system' },
    { label: 'Nhật ký', to: '/resources/auditlogs', icon: 'system' },
    { label: 'Phí nền tảng', to: '/settings/platform-fee', icon: 'finance' },
    { label: 'Danh mục nghề', to: '/resources/professions', icon: 'database' },
    { label: 'Chiến dịch', to: '/resources/campaigns', icon: 'content' },
  ] },
];

export function operationsRouteLabel(pathname: string) {
  return operationsNavigation.flatMap(group => group.items)
    .filter(item => item.to === '/' ? pathname === '/' : pathname.startsWith(item.to))
    .sort((a, b) => b.to.length - a.to.length)[0]?.label ?? 'Admin Center';
}
