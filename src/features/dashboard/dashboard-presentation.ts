export type AttentionCounts = { overdueWorkOrders:number;pendingReports:number;activeDisputes:number;pendingWithdrawalCount:number };

export function dashboardAttention(data: AttentionCounts) {
  return [
    { label:'Work Order quá hạn', count:data.overdueWorkOrders, to:'/resources/workorders', tone:'danger' as const },
    { label:'Báo cáo chờ xử lý', count:data.pendingReports, to:'/resources/reports', tone:'warning' as const },
    { label:'Tranh chấp đang mở', count:data.activeDisputes, to:'/admin/disputes', tone:'danger' as const },
    { label:'Rút tiền chờ xử lý', count:data.pendingWithdrawalCount, to:'/admin/withdrawals?status=PENDING', tone:'warning' as const },
  ].sort((a,b) => b.count - a.count);
}

export function dashboardActionLabel(action: string) {
  return action.replace(/^admin\./, '').replaceAll('_', ' ').replace(/^./, value => value.toUpperCase());
}
