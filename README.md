# ClassXNeedle — Backend + Frontend

Full-stack setup for the ClassXNeedle clothing brand: REST/GraphQL backend with auth/cart/orders, and a Tailwind + React Query frontend.

## Backend
**Tech:** Node.js, Express, MongoDB/Mongoose, REST for writes, GraphQL for reads, JWT auth, Multer uploads, Cloudinary.

**Setup**
```bash
cd Backend
npm install
cp example.env .env   # update with your secrets
npm run seed          # optional: loads demo categories/brands/products
npm run dev           # starts on PORT (default 3000)
```
Env keys: `MONGODB_URL`, `PORT`, `CLIENT_URL`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, `CLOUDINARY_*`.

**Key endpoints**
- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `POST /api/auth/refresh-token`, `GET /api/auth/me`
- Products/Categories/Subcategories/Brands: CRUD under `/api/products`, `/api/categories`, `/api/subcategories`, `/api/brands` (multipart for images; admin-only)
- Reviews: CRUD `/api/reviews`
- Cart: add/update/remove/clear/coupon under `/api/cart`
- Orders: create, cancel, admin status/pay under `/api/orders`
- Coupons: CRUD `/api/coupons` (admin)
- GraphQL (read-only): `POST /graphql` (GraphiQL in dev)

## Frontend
**Tech:** Vite + React + TypeScript, Tailwind, TanStack Query, React Router, axios. Light/dark/system theme toggle with persistence. Auth/cart/orders wired to backend (cookies required).

**Setup**
```bash
cd Frontend
npm install
# configure .env.local
# VITE_API_URL=http://localhost:3000/api
# VITE_GRAPHQL_URL=http://localhost:3000/graphql
npm run dev    # or npm run build
```

**Features**
- Home: hero, categories, best-sellers, lookbook sections.
- Catalog: filter by category, add to cart.
- Auth: login/register page using backend auth.
- Cart: view/update quantities, apply/remove coupon, place order (address required).
- Orders: view and cancel your orders.
- Theme: toggle light/dark/system in header; remembers preference.

## Notes
- Ensure backend CORS `CLIENT_URL` matches frontend origin for cookies.
- GraphQL queries are read-only; writes go through REST.
- Seed data provides sample catalog for quick start.
