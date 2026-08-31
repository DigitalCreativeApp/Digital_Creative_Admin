# Admin Center Operations Redesign Specification

## Objective

Transform Digital Creative Admin Center from a database-oriented viewer into a responsive operations dashboard for administrators while preserving all domain rules, authentication, authorization, database schema, and existing transaction workflows.

## In scope

- Explicit operational navigation and global shell.
- Shared admin design system and presentation utilities.
- Dashboard, Users, Projects, Services, Work Orders, Finance, Withdrawals, Contracts/legal surfaces, Disputes, Reports, Logs, and Settings.
- Specialized read DTOs/endpoints where the generic resource API cannot express business context.
- Query, loading, empty, error, accessibility, and responsive behavior.
- Regression coverage for routing, contracts, formatters, and critical actions.

## Out of scope

- Database-schema changes.
- Changes to customer/creative applications.
- Rewriting payment, withdrawal, dispute, agreement, authentication, or authorization business rules.
- Mock data, hardcoded KPI values, synthetic trends, or a newly invented Contract aggregate.
- Framework migration or addition of a large component library.

## Data truth policy

1. Render values returned by an authorized backend endpoint.
2. Derive presentation-only values from returned fields when the formula is deterministic and documented.
3. If required data is absent, add a minimal bounded endpoint or show an honest unavailable/empty state.
4. Never infer financial values, user identity, status, trends, or activity from placeholders.

## UX requirements

- Information hierarchy follows administrator jobs, not EF resource names.
- Dashboard prioritizes items needing action before historical totals.
- Every list provides module-specific search, filters, explicit columns, server pagination, and a useful empty state.
- UUIDs are secondary and truncated; names, codes, email, and domain identifiers are primary.
- Status uses a single semantic palette: neutral, info, warning, success, and danger.
- Detail pages use summary header, relevant actions, lazy tabs, and collapsed technical metadata.
- Destructive or irreversible actions require a clear confirmation and reason where the existing domain requires it.
- Desktop tables become labelled cards below the narrow breakpoint; no page-level horizontal overflow.
- Default text remains readable at 14–16px, with 12px reserved for metadata.

## Technical requirements

- Keep React, TypeScript, React Router, Vite, and vanilla CSS.
- Use explicit typed DTOs in the frontend and backend.
- Use EF projections and `AsNoTracking` for read-only operational queries.
- Paginate all unbounded collections on the server.
- Fetch detail-tab data only when selected.
- Preserve Admin role authorization on every admin endpoint.
- Return structured validation/error responses through the existing API conventions.
- Avoid N+1 relation scans and all-DbSet dashboard counts.

## Shared frontend contract

- `AdminPageHeader`: breadcrumb/kicker, title, description, status/actions.
- `KpiCard`: label, value, helper, semantic tone, optional route.
- `StatusBadge`: domain status to canonical label/tone mapping.
- `AdminDataTable`: explicit columns, loading/empty/error, pagination, responsive card labels.
- `AdminFilterBar`: search, module filters, clear action, applied-filter state.
- `AdminDetailPage`/tabs: summary, actions, lazy tab content, technical disclosure.
- Formatters: money, number, date/time, identifier, person fallback.

## API boundaries

- `/api/admin/operations/dashboard`: bounded KPI, attention, activity, and finance projections.
- `/api/admin/operations/users`: user/account list and summary detail.
- `/api/admin/operations/projects`: project list/detail projections.
- `/api/admin/operations/services`: service list/detail projections.
- `/api/admin/operations/work-orders`: unified work-order list/detail/timeline projections.
- `/api/admin/operations/finance`: summary and paged transaction ledger.
- `/api/admin/operations/reports`: moderation queue projections.
- `/api/admin/operations/audit-logs`: read-only paged history.

Endpoint groups may be delivered incrementally, but each frontend module must use its specialized contract before it replaces the generic route.

## Acceptance criteria

- Primary navigation exposes all requested business modules without raw database terminology.
- No admin KPI, chart, queue, or activity item is mocked or hardcoded.
- Dashboard no longer counts every reflected DbSet.
- Users, Projects, Services, Work Orders, Finance, Reports, and Logs use explicit DTOs and module filters.
- Notifications do not appear in Admin User details.
- Existing withdrawal, dispute, agreement, and platform-fee flows retain behavior.
- List/detail layouts are usable at desktop, tablet, and mobile widths.
- Unit/contract tests and production builds pass for changed applications.

