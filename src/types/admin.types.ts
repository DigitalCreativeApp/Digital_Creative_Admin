export type AdminUser = { id: string; displayName: string; email: string; role: string };
export type LoginResponse = { accessToken: string; user: AdminUser | null };
export type AdminField = { name: string; type: string; nullable: boolean; editable: boolean; maxLength: number | null; options: string[] | null };
export type AdminResource = { key: string; name: string; table: string; keyField: string; canCreate: boolean; canEdit: boolean; canSoftDelete: boolean; canRestore: boolean; fields: AdminField[] };
export type AdminPage = { resource: string; page: number; pageSize: number; total: number; items: Record<string, unknown>[] };
export type AdminRecord = { resource: string; data: Record<string, unknown> };
export type Dashboard = { resourceCount: number; totalRecords: number; activeAccounts: number; users: number; projects: number; services: number; portfolios: number; reports: number; transactions: number };
export type BulkResult = { requested: number; succeeded: number; failed: number };
