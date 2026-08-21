const WITHDRAWAL_RESOURCE = 'withdrawalrequests';

export function adminResourcePath(resource: string) {
  return resource.toLowerCase() === WITHDRAWAL_RESOURCE
    ? '/admin/withdrawals'
    : `/resources/${resource}`;
}

export function adminRecordPath(resource: string, id: string) {
  return resource.toLowerCase() === WITHDRAWAL_RESOURCE
    ? `/admin/withdrawals/${id}`
    : `/resources/${resource}/${id}`;
}
