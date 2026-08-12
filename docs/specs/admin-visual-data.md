# Spec: Admin visual data and image upload

## Objective
Make admin records easier to scan and understand, show media as media, and let administrators select image files from their computer for every editable image URL field.

## Tech stack and commands
- React 19, TypeScript 5.9, Vite 7, CSS.
- Test: `npm test`
- Build: `npm run build`
- Backend test: `dotnet test Digital_Crative_BE.sln`

## Structure and style
- Shared field presentation rules live in `src/utils/field-presentation.ts`.
- Existing components and design tokens remain in use; no UI dependency is added.
- The backend performs authenticated multipart upload and returns a secure URL.

## Testing strategy
- Unit-test image-field and URL detection.
- Type-check and build the complete admin application.

## Boundaries
- Always: validate image type/size on client and server; keep existing image values.
- Ask first: database migrations and direct unsigned client uploads.
- Never: embed storage secrets in the browser or persist local object URLs.

## Success criteria
- Image URL fields use a computer file picker, show preview and upload state.
- Image values render as thumbnails in tables and larger previews in details.
- Detail data has clear information groupings.
- Existing CRUD, search, sort, pagination and soft-delete behavior remains intact.

