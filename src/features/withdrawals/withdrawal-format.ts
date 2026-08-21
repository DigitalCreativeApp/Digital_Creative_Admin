export const formatVnd = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
export const formatAdminDate = (value: string | null) => value ? new Intl.DateTimeFormat('vi-VN', { day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit' }).format(new Date(value)) : '—';
