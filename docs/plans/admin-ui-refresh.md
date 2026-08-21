# Spec: Admin UI refresh and withdrawal rejection state

## Objective

Make every existing Admin route consistent, readable and action-oriented, using the dedicated withdrawal workflow as the visual baseline. Fix rejected withdrawals so the original user-visible withdrawal transaction leaves `PROCESSING` and becomes `FAILED`.

## Scope and acceptance criteria

- All current Admin routes share one hierarchy for page headers, actions, filters, tables, forms, details, empty states and responsive behavior.
- Generic resource lists show the useful result context and controls without looking like a raw database browser.
- Generic record details prioritize business fields; technical/system fields are visually secondary and collapsible.
- Existing dashboard, login, fee settings and withdrawal pages use the same spacing, typography, surfaces and interaction states.
- No Admin capability, route, API contract or resource action is removed.
- Rejecting a pending withdrawal sets its `WithdrawalRequest` to `REJECTED`, releases the held balance once, and sets the matching `WithdrawalHold` ledger transaction to `FAILED`.
- The App therefore displays the rejected withdrawal transaction as `Thất bại` using its existing wallet status mapping.

## Tech stack and commands

- Admin: React 19, React Router, TypeScript, Vite, vanilla CSS.
  - Test: `npm test`
  - Build: `npm run build`
- Backend: ASP.NET Core, EF Core, xUnit.
  - Focused test: `dotnet test tests/DigitalCreative.Api.Tests/DigitalCreative.Api.Tests.csproj --filter FullyQualifiedName~AdminWithdrawalServiceTests`
  - Build: `dotnet build Digital_Crative_BE.sln`
- App: Expo/React Native; no UI code change is expected if the Backend ledger status is corrected.

## Project structure and style

- `src/features/resources`: shared list/detail templates that cover all generic Admin resources.
- `src/components`: shared data, async-state and editor presentation.
- `src/styles/theme-v2.css`: shared Admin visual system; feature CSS stays scoped.
- `Digital_Crative_BE/Services/WithdrawalService.cs`: withdrawal state and ledger transitions.
- Prefer semantic sections, sentence-case labels, two-column detail layouts and tabular numerals. Keep the existing dark neutral palette and single purple accent. Do not add dependencies or inline presentation styles.

## Testing strategy

- Add a Backend regression assertion before changing withdrawal ledger behavior and prove it fails, then passes.
- Extend focused Admin utility/presentation tests for technical-field grouping and route behavior where logic changes.
- Run the complete Admin test/build and focused Backend workflow test/build.
- Verify responsive CSS structurally at mobile, tablet and desktop breakpoints; use a real browser if available.

## Boundaries

- Always: preserve authorization, data actions, pagination, filtering and API contracts.
- Ask first: schema migrations, new dependencies, changing withdrawal accounting amounts.
- Never: expose encrypted/raw secrets, modify `appsettings.json`, or rewrite unrelated App screens.

## Implementation plan

1. Add a failing Backend regression test for the rejected withdrawal hold ledger status.
2. Correct the Backend ledger transition and run the focused workflow test.
3. Refine shared Admin resource list/detail/editor markup and presentation utilities.
4. Consolidate the Admin visual system across layout, dashboard, login, settings, async states and generic pages.
5. Run full Admin tests/build, Backend tests/build, review the diff and write a concise handoff.

## Risks and mitigations

- Dense resources contain many fields: keep all data accessible, but collapse system metadata instead of deleting it.
- Global CSS can leak into nested headers: use scoped page-shell classes and avoid broad new selectors.
- Ledger updates must remain idempotent: update only the matching `WithdrawalHold` transaction tied to the withdrawal reference.
