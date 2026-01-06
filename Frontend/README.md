# Frontend (Vite + React)
Customer-facing storefront for ClassXNeedle. Built with Vite + React + TypeScript, styled with Tailwind, and powered by TanStack Query for data fetching/caching. Uses REST for mutations and GraphQL for read-heavy catalog/cart views.

## Stack & architecture
- React Router v7 route tree (`App.tsx`, `Layout.tsx`, `ProtectedRoute.tsx`) with guarded areas for cart/orders/auth.
- TanStack Query for all network access (`src/lib/api.ts`), speaking to `/api` (REST) and `/graphql`.
- Tailwind CSS with custom theme tokens (`tailwind.config.js`, `src/index.css`, `src/App.css`) and a light/dark/system toggle persisted via `useTheme`.
- Component organization: `components/` (layout, UI primitives, product/cart widgets), `pages/` (Home, Catalog, Cart, Orders, Auth), `hooks/` (auth/cart/orders/theme/data helpers), `lib/` (API client, constants, utilities), `types.ts`.

## Setup
```bash
cd Frontend
npm install
cp .env .env.local   # or edit .env directly
npm run dev          # defaults to http://localhost:5173
```
Node 18+ recommended.

### Environment variables
- `VITE_API_URL` – REST base URL (e.g., `http://localhost:3000/api`).
- `VITE_GRAPHQL_URL` – GraphQL endpoint (e.g., `http://localhost:3000/graphql`).

## Scripts
- `npm run dev` – Vite dev server.
- `npm run build` – TypeScript project references + Vite build.
- `npm run preview` – Preview the production build.
- `npm run lint` – ESLint (TS + React).

## Feature tour
- **Home** (`pages/Home.tsx`): hero, category highlights, featured products, lookbook/brand storytelling.
- **Catalog** (`pages/Catalog.tsx`): product grid sourced from GraphQL, category filtering, quick add-to-cart CTAs.
- **Cart** (`pages/Cart.tsx`): view/update quantities, apply/remove coupon, clear cart, checkout CTA; guarded by auth.
- **Orders** (`pages/Orders.tsx`): list and cancel orders; guarded by auth.
- **Auth** (`pages/Auth.tsx`): login/register flows using cookie-based backend auth; redirects back to the origin route via `useRequireAuth`.
- **Theme**: light/dark/system toggle in header with persistence.

## Development notes
- Axios client (`restClient`) is configured with `withCredentials: true`; ensure backend CORS `CLIENT_URL` matches the frontend origin so cookies are accepted.
- GraphQL helper wraps errors and provides small typed helpers for catalog/cart/order fetches.
- If adding new API calls, prefer colocated React Query hooks for caching/invalidations (see `useAuth`, `useCart`, `useOrders`).
