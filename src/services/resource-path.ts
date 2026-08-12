export function resourcePath(key: string, id?: string) {
  const base = `/api/admin/resources/${encodeURIComponent(key)}`;
  return id === undefined ? base : `${base}/${encodeURIComponent(id)}`;
}
