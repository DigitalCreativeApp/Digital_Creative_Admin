export function LoadingState() { return <div className="state" role="status"><span className="loader" />Đang tải dữ liệu…</div>; }
export function ErrorState({ message, retry }: { message: string; retry: () => void }) { return <div className="state error" role="alert"><p>{message}</p><button onClick={retry}>Thử lại</button></div>; }
export function EmptyState({ message }: { message: string }) { return <div className="state"><p>{message}</p></div>; }
