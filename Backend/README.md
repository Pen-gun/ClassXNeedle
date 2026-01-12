# Backend Service
Express 5 + MongoDB API for ClassXNeedle. REST handles state-changing operations, while read-heavy catalog/cart views are also available through GraphQL. Auth is cookie-based JWT (access + refresh) and uploads are streamed to Cloudinary.

## Stack
- Express 5 with centralized error handling (`middlewares/error.middleware.js`), CORS, cookies, static `public/`.
- Mongoose models for `User`, `Product`, `Category`, `SubCategory`, `Brand`, `Review`, `Cart`, `Order`, `Coupon`.
- Multer for multipart uploads + Cloudinary SDK for asset storage.
- JWT auth (`ACCESS_TOKEN_SECRET`/`REFRESH_TOKEN_SECRET`) issued and read from HTTP-only cookies.
- GraphQL (`/graphql`) via `express-graphql` with schema/resolvers in `src/graphql`.
- Comprehensive testing with Monkey & Gorilla test suites (24 tests, 100% pass rate).

## Setup
```bash
cd Backend
npm install
cp example.env .env   # set Mongo/Cloudinary/JWT/PORT/CLIENT_URL
npm run seed          # optional: idempotent demo catalog
npm run dev           # nodemon, defaults to http://localhost:3000
```
Requirements: Node 18+, MongoDB instance reachable by the service.

## Testing
```bash
cd Backend
node tests/run-tests.js   # Run comprehensive Monkey & Gorilla test suite (24 tests)
```
See `TESTING_SUMMARY.md`, `TESTING_REPORT.md`, and `TESTING_GUIDE.md` for detailed test documentation.

### Environment variables
- `MONGODB_URL` – Mongo connection string (no DB name appended).
- `PORT` – API port (default 3000).
- `CLIENT_URL` – Allowed origin for CORS/cookies (your frontend base URL).
- `ACCESS_TOKEN_SECRET` / `ACCESS_TOKEN_EXPIRY` – Short-lived JWT for API/GraphQL access.
- `REFRESH_TOKEN_SECRET` / `REFRESH_TOKEN_EXPIRY` – Long-lived JWT for session renewal.
- `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` – Asset storage.
- `NODE_ENV` – `development` enables GraphiQL and error stacks.

## API surfaces
### REST (base `/api`)
- Auth: register, login, logout, refresh-token, and `GET /auth/me`.
- Catalog CRUD: `/products`, `/categories`, `/subcategories`, `/brands` (image uploads use multipart + Cloudinary; admin-only writes).
- Reviews: CRUD under `/reviews`.
- Cart: add/update/remove items, clear cart, apply/remove coupon under `/cart`.
- Orders: create, cancel, update payment/delivery status under `/orders`.
- Coupons: CRUD under `/coupons` (admin).

### GraphQL (read-only, `/graphql`)
- Queries for products (with filtering/pagination), product by id/slug, categories/subcategories/brands, reviews, `me`, `myOrders`, and `myCart`.
- Requests can include the access token cookie or `Authorization: Bearer` to enable user-scoped queries.

## Data & auth notes
- Tokens are set as HTTP-only cookies; keep `CLIENT_URL` aligned to the frontend origin so browsers accept them.
- Multer handles multipart uploads; `cloudinary.js` abstracts upload/delete operations.
- Errors funnel through `ApiError` -> `errorHandler` to return JSON payloads.
- Seeding (`src/db/seed.js`) creates starter categories, subcategories, brands, and products with slugs.

## Folder map
- `src/index.js` – bootstrap + DB connection.
- `src/app.js` – Express app wiring, middleware, routes, GraphQL.
- `src/routes/` + `src/controllers/` – REST endpoints by domain.
- `src/graphql/` – schema + resolvers for read-only queries.
- `src/Models/` – Mongoose schemas.
- `src/middlewares/` – auth/admin guards, error handler, multer config.
- `src/utils/` – ApiError, ApiResponse helpers, async wrapper, Cloudinary helper.
