# Admin Center Operations Redesign Plan

## Checkpoint 1 — Foundation

1. Add tested presentation formatters and canonical status tones.
2. Add shared page header, KPI, status, filter, table/card, pagination, and detail-tab primitives.
3. Introduce one operations design-token/style layer and migrate the shell/navigation.
4. Keep legacy module styles temporarily; remove conflicts only as each module migrates.

## Checkpoint 2 — Dashboard and navigation

1. Add bounded dashboard DTO/service/controller queries with Admin authorization.
2. Add backend tests for aggregates, empty datasets, and queue limits.
3. Replace reflected database metrics with operational KPIs and attention queues.
4. Add real activity/financial sections and honest empty states.
5. Route KPI and queue actions to filtered module pages.

## Checkpoint 3 — Core marketplace operations

1. Add paged Users list/detail contracts; exclude Notifications and sensitive fields.
2. Add Projects list/detail contracts with budget, lifecycle, applications, payment, and work-order context.
3. Add Services list/detail contracts with creator, price, status, orders, rating, and reviews.
4. Add Work Orders list/detail contracts with source, parties, price, deadline, payment, dispute, and timeline.
5. Build corresponding React routes using shared primitives and lazy detail tabs.

## Checkpoint 4 — Money, moderation, and accountability

1. Add Finance summary and transaction-ledger contracts/pages.
2. Migrate Withdrawals to shared filters, status, table/card, detail, modal, and timeline primitives without changing actions.
3. Present contract access through Work Orders and legal agreement versions.
4. Migrate Disputes without changing evidence or resolution semantics.
5. Add Reports moderation queue and Audit Logs read-only history.

## Checkpoint 5 — Settings and fallback resources

1. Migrate platform-fee and agreement pages to the shared visual system.
2. Retain generic CRUD only for approved low-risk catalogs/configuration.
3. Remove internal/sensitive resources from navigation and related-data surfaces.
4. Rename navigation-only search to “Lọc menu”.

## Checkpoint 6 — Verification and handoff

1. Run focused tests after every module slice.
2. Run full frontend and backend test/build suites.
3. Verify desktop, tablet, and mobile routes in a real browser, including loading, empty, error, and overflow states.
4. Review API query bounds, authorization, accessibility, and accidental generated files.
5. Document delivered routes, contracts, known data limitations, and rollback notes in `docs/handoffs`.

## Implementation constraints

- Each slice must remain reviewable and must not mix unrelated refactoring.
- A module is complete only after contract, UI, tests, responsive state, and error/empty/loading behavior are present.
- Existing state-changing domain services remain the sole owners of mutations.
- No schema migration is introduced unless a separately approved requirement proves it necessary.
