# Implementation plan: Professional Admin login

## Architecture decisions

- Preserve `LoginPage` as the auth container and expose a presentational `LoginView` for deterministic rendering tests.
- Extend the existing `AppIcon` set instead of adding an icon package.
- Place final login rules in `admin-polish.css`, which already loads last and owns the current login overrides.

## Tasks

### 1. Lock the UI contract

- Acceptance: tests describe the semantic split layout, labeled fields, password visibility states, busy state, and alert behavior.
- Verify: focused test fails against the current login.
- Files: `src/features/auth/LoginPage.test.tsx`.

### 2. Build the accessible login view

- Acceptance: existing `signIn` call and redirect remain unchanged; password visibility and busy state work without new dependencies.
- Verify: focused test and TypeScript build pass.
- Files: `src/features/auth/LoginPage.tsx`, `src/components/AppIcon.tsx`.

### 3. Apply the responsive visual system

- Acceptance: split desktop layout, compact tablet/mobile layout, consistent focus/hover/pressed states, and reduced-motion support.
- Verify: full tests, lint, build, and browser screenshots at desktop/mobile widths.
- Files: `src/styles/admin-polish.css`.

## Risks and mitigations

- Global `.login section` rules exist in multiple stylesheets: use more specific login component classes in the final loaded stylesheet.
- Decorative content can overwhelm small screens: hide the secondary narrative below the desktop breakpoint while keeping brand and form context.
- Auth regressions: do not modify the auth context or service and keep the submit payload unchanged.
