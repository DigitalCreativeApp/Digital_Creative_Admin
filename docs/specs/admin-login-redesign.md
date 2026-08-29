# Spec: Professional Admin login

## Objective

Upgrade the existing Digital Creative Admin login into a professional, responsive backoffice entry point without changing authentication, authorization, API contracts, routes, or session behavior.

## Tech stack and commands

- React 19, React Router, TypeScript, Vite, vanilla CSS.
- Focused test: `npm test -- src/features/auth/LoginPage.test.tsx`
- Full test: `npm test`
- Lint: `npm run lint`
- Build: `npm run build`
- Dev: `npm run dev -- --host 127.0.0.1`

## Project structure

- `src/features/auth/LoginPage.tsx`: auth container and presentational login view.
- `src/features/auth/LoginPage.test.tsx`: login structure and state regression tests.
- `src/components/AppIcon.tsx`: existing shared icon system.
- `src/styles/admin-polish.css`: final loaded Admin presentation layer.
- `docs/handoffs/admin-login-redesign.md`: implementation handoff.

## Code style

```tsx
<label htmlFor="admin-email">Email quản trị</label>
<input id="admin-email" autoComplete="username" required type="email" />
```

- Use semantic regions, explicit labels, concise Vietnamese copy, and existing design tokens.
- Keep authentication state and API calls in `LoginPage`; keep the visual surface in a focused presentational component.
- Do not add a dependency or inline visual styles.

## Testing strategy

- Render the presentational view to static markup to verify semantic regions, form labels, password states, busy state, and alerts.
- Run the complete Admin test suite, lint, and production build.
- Verify the rendered page in a real browser at desktop and mobile widths when browser tooling is available.

## Boundaries

- Always: preserve `signIn(email, password)`, `/login`, current error handling, redirects, and autocomplete attributes.
- Ask first: new dependencies, auth recovery flows, SSO, CAPTCHA, or API changes.
- Never: add fake operational data, expose credentials, edit environment files, or change permissions.

## Success criteria

- Desktop has a purposeful split composition; mobile keeps the form first and fully usable at 320px.
- The page has one clear heading, explicit field labels, visible focus states, password visibility control, accessible error feedback, and a disabled busy state.
- Copy identifies the screen as an internal Admin area without claiming unsupported security capabilities.
- Existing sign-in and authenticated redirect behavior remain unchanged.

## Open questions

- None. Password recovery and SSO remain intentionally out of scope because no existing route or API supports them.
