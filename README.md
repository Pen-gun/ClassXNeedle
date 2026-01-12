# ClassXNeedle Platform
Monorepo for the ClassXNeedle commerce experience. The backend exposes REST (mutations) and GraphQL (queries) over MongoDB, while the frontend is a Vite/React storefront that consumes both surfaces.
still improving.

## Repository layout
- `Backend/` – Express + MongoDB service with JWT auth, Cloudinary uploads, REST + GraphQL. See `Backend/README.md`.
- `Frontend/` – Vite + React + Tailwind client using TanStack Query and React Router v7. See `Frontend/README.md`.
- Additional docs: `SETUP.md` (environment/setup notes), `HEALTH_REPORT.md`, `SECURITY_REVIEW.md`, `GRAPHQL_TESTING.md`.

## Quick start (local)
1) `cd Backend && npm install && cp example.env .env` (set Mongo, JWT secrets, Cloudinary, and `CLIENT_URL` to the frontend origin).  
2) `npm run seed` to load starter catalog data (optional but recommended).  
3) `npm run dev` to boot the API (defaults to `http://localhost:3000`).  
4) In another shell: `cd Frontend && npm install && cp .env .env.local` (or edit `.env` directly).  
5) `npm run dev` to start Vite (defaults to `http://localhost:5173`). REST lives under `/api`, GraphQL under `/graphql`.

## Environment keys
- **Backend**: `MONGODB_URL`, `PORT`, `CLIENT_URL`, `ACCESS_TOKEN_SECRET`, `ACCESS_TOKEN_EXPIRY`, `REFRESH_TOKEN_SECRET`, `REFRESH_TOKEN_EXPIRY`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `NODE_ENV`.
- **Frontend**: `VITE_API_URL`, `VITE_GRAPHQL_URL`.

## Architectural highlights
- **Backend**: Express 5, Mongoose models for users/products/orders/cart/coupons; JWT auth stored in HTTP-only cookies; Cloudinary-backed uploads; Multer for multipart; centralized error handling; read-only GraphQL for catalog/cart views.
- **Frontend**: React + TypeScript with Tailwind styling; TanStack Query for fetching/caching; React Router v7 route tree with protected routes; cookie-based auth flow; light/dark/system theming with persistence.

## Developer workflows
- Backend scripts: `npm run dev` (nodemon), `npm run seed` (idempotent demo catalog). Tests not defined yet.
- Frontend scripts: `npm run dev`, `npm run build`, `npm run preview`, `npm run lint`.
- Keep `CLIENT_URL` aligned to the frontend origin so cookies are accepted. Avoid committing `node_modules` or build outputs (`dist/`); both have been cleaned.
