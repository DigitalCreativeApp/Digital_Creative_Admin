# Admin UI refresh handoff

## Scope

- Applied one shared visual system to the dashboard, login, platform-fee, withdrawal, generic list, generic detail, create/edit, loading, empty, and error states.
- Reworked generic resource pages so headings, filters, counts, bulk actions, tables, pagination, field groups, technical metadata, and related records are easier to scan.
- Kept existing routes, permissions, CRUD operations, filters, sorting, pagination, CSV export, and withdrawal workflow intact.

## Implementation

- `src/styles/admin-polish.css`: final presentation layer loaded after existing feature styles.
- `src/features/resources/ResourcePage.tsx`: clearer list hierarchy and controls.
- `src/features/resources/RecordPage.tsx`: business-first details with collapsible system metadata.
- `src/utils/field-presentation.ts`: selects a human-readable record heading.
- `src/components/AsyncState.tsx`: descriptive loading-failure and empty states.

## Withdrawal rejection fix

The backend now marks the original `WithdrawalHold` wallet transaction as `Failed` when an administrator rejects a request, before recording the completed release transaction. The existing app status mapping therefore displays `Thất bại` instead of leaving the transaction at `Đang xử lý`. Repeating the rejection remains idempotent and can repair an older hold left in `Processing`.

## Verification

- Admin: `npm test` — 24 tests passed.
- Admin: `npm run build` — production build passed.
- Backend: `AdminWithdrawalServiceTests` — 9 tests passed.
- Backend: `dotnet build Digital_Crative_BE.sln --no-restore --disable-build-servers` — passed with no warnings or errors.
- Browser visual verification was not available in this environment; responsive behavior is covered by the shared CSS breakpoints and production build validation.

## Working-tree note

`Digital_Crative_BE/appsettings.json` was already modified outside this work and was intentionally not changed.
