# Admin Center Operations Audit

## Executive summary

The current Admin Center is technically functional but is primarily a reflected database browser. It does not yet provide the prioritized queues, business context, bounded data contracts, or responsive operational workflows required by administrators.

The redesign must preserve authentication, authorization, database schema, transaction rules, and the existing withdrawal, dispute, platform-agreement, and platform-fee workflows. The generic resource API remains useful only as a fallback for low-risk catalog/configuration data.

## Current architecture

- React 19, TypeScript, React Router, Vite, and vanilla CSS.
- Admin navigation is derived from `/api/admin/resources` and exposes database resource names.
- Most pages use generic `/api/admin/resources/{resource}` contracts.
- Specialized flows already exist for withdrawals, disputes, platform agreements, and platform fees.
- The backend discovers every EF Core `DbSet` through reflection and exposes generic metadata and values.

## Findings

### Information architecture

- Sidebar structure follows database tables instead of administrator jobs.
- The sidebar search only filters navigation but is presented like data search.
- Primary operations and low-frequency configuration resources have equal visual weight.
- Notifications can appear as an Account/User relation even though they are not useful in the admin user profile.

### Dashboard

- `resourceCount` and `totalRecords` are database-health values, not operational KPIs.
- `GetDashboardAsync` counts every discovered resource sequentially, increasing query count and response time as the schema grows.
- There is no attention queue, operational activity feed, trend visualization, or direct route from a KPI to its work queue.
- Financial values exist, but the page does not explain held, available, pending-withdrawal, completed-withdrawal, and platform-revenue states as an operational flow.

### Lists

- Generic lists select the first eight reflected properties rather than explicit business columns.
- Related names and business identifiers are often replaced by UUIDs.
- Search is generic string matching; filters, sorting, and status semantics are not module-specific.
- Tables rely on horizontal scrolling and do not provide a deliberate mobile card mode.
- Bulk soft-delete/restore is exposed generically, even where a domain transition should be required.

### Detail pages

- Generic details eagerly request the overview and scan direct relations across many resources.
- Each relation can trigger a count and a fetch, producing an unbounded number of queries.
- Up to 50 records per relation are rendered at once; tabs are visual sections rather than lazy data boundaries.
- Technical fields, raw enums, and unrelated relations compete with operational information.
- Account details can expose Notifications through the User relation.

### API and data boundaries

- Generic responses mirror entity properties and make the frontend dependent on persistence structure.
- Specialized admin DTOs are missing for Users, Projects, Services, Work Orders, Finance, Reports, Audit Logs, and the richer Dashboard.
- Server-side module filters and joined display values are therefore unavailable in the generic UI.
- No database schema change is required for the requested redesign.

### Visual system

- Multiple CSS generations override one another (`global`, `theme-v2`, `admin-polish`, and module styles).
- Typography, color tokens, radii, borders, and status colors are inconsistent.
- Several labels use 0.55–0.70rem text, below a comfortable admin reading size.
- Withdrawals, disputes, agreements, and generic resources each implement their own tables, badges, filters, empty states, and spacing.

### Existing strengths to preserve

- Admin routes are protected by role authorization.
- Withdrawal actions preserve explicit confirmation and audit history.
- Dispute resolution exposes evidence, settlement preview, and irreversible decision states.
- Platform agreement versions are immutable after publishing and retain acceptance evidence.
- Platform-fee changes are bounded and non-retroactive.

## Target module mapping

| Admin module | Source of truth | Target experience |
|---|---|---|
| Dashboard | Accounts, Users, Projects, Services, WorkOrders, Reports, Wallets, Withdrawals, Disputes, AuditLogs | KPI groups, attention queues, activity, financial summary |
| Users | Account + User and bounded aggregates | Business list, profile summary, activity/finance tabs |
| Projects | Project + applications/payments/work orders | Operational list and lifecycle detail |
| Services | Service + creator/orders/reviews | Catalog operations and performance detail |
| Work Orders | WorkOrder, proposal/source, payments, disputes | Unified delivery timeline and contract access |
| Finance | Wallet, WalletTransaction, Payment/ProjectPayment | Reconciliation overview and transaction ledger |
| Withdrawals | Existing specialized API | Retain workflow; migrate visual primitives |
| Contracts | WorkOrder contract document + PlatformAgreement | Do not invent a separate entity; expose both legal surfaces clearly |
| Disputes | Existing specialized API | Retain workflow; migrate visual primitives |
| Reports | Report and target context | Moderation queue with explicit actions/statuses |
| Logs | AuditLog | Read-only searchable operational history |
| Settings | Existing platform fee and catalog/config resources | Explicit settings pages; generic fallback for safe catalogs |

## Redesign decisions

1. Replace dynamic primary navigation with explicit business modules. Label any retained nav filter as “Lọc menu”.
2. Introduce bounded, read-oriented admin DTOs and server-side pagination/filtering; never return entity graphs.
3. Replace dashboard-wide reflected counts with explicit parallel aggregate queries.
4. Use shared UI primitives for status, KPI, tables/cards, filters, details, tabs, loading, empty, and error states.
5. Load detail tabs on demand. Keep technical metadata collapsed and secondary.
6. Preserve the generic resource viewer only for low-risk configuration/catalog data.
7. Keep all real empty states honest. Do not generate mock charts, trends, counts, identities, or activity.
8. Use responsive tables on desktop and labelled record cards on narrow screens; action areas remain reachable without horizontal page scrolling.

## Risks and controls

- **Domain regression:** specialized state changes remain in existing controllers/services and are covered by contract tests.
- **Authorization regression:** every new endpoint uses the same Admin role policy.
- **Query growth:** list/detail APIs use projection, pagination, bounded child queries, and cancellation tokens.
- **Visual migration risk:** shared CSS is introduced as a final layer and modules are migrated incrementally.
- **Missing data:** the UI displays an unavailable/empty state and documents the absent endpoint instead of fabricating values.

