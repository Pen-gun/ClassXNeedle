# ClassXNeedle Backend Quickstart

This backend exposes:
- REST (Create/Update/Delete) under `/api/*`
- GraphQL (Read) under `/graphql` with GraphiQL enabled in development

## Setup

```bash
# from Backend directory
npm install
# seed initial catalog (optional)
npm run seed
# ensure env
# .env must include MONGODB_URL, PORT, CLIENT_URL, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, etc.
```

## Run

```bash
npm run dev
# Server: http://localhost:3000
# GraphQL: http://localhost:3000/graphql
```

## Auth
- Register: POST `/api/auth/register`
- Login: POST `/api/auth/login`
- Logout: POST `/api/auth/logout`
- Refresh: POST `/api/auth/refresh-token`
- Change Password: PATCH `/api/auth/change-password`

## Products (Admin)
- Create: POST `/api/products` (multipart)
  - fields: `name, description, price, gender, size[], color[], category, subCategory?, brand?`
  - files: `coverImage` (1), `images` (0..10)
- Update: PATCH `/api/products/:id` (multipart)
- Delete: DELETE `/api/products/:id`

## Categories (Admin)
- Create: POST `/api/categories` (multipart image)
- Update: PATCH `/api/categories/:id` (multipart image)
- Delete: DELETE `/api/categories/:id`

## SubCategories (Admin)
- Create: POST `/api/subcategories`
- Update: PATCH `/api/subcategories/:id`
- Delete: DELETE `/api/subcategories/:id`

## Brands (Admin)
- Create: POST `/api/brands` (multipart image)
- Update: PATCH `/api/brands/:id`
- Delete: DELETE `/api/brands/:id`

## Reviews
- Create: POST `/api/reviews`
- Update: PATCH `/api/reviews/:id`
- Delete: DELETE `/api/reviews/:id`

## Cart
- Add Item: POST `/api/cart/items` { productId, quantity }
- Update Item: PATCH `/api/cart/items/:productId` { quantity }
- Remove Item: DELETE `/api/cart/items/:productId`
- Clear: DELETE `/api/cart`
- Apply Coupon: POST `/api/cart/coupon` { couponCode }
- Remove Coupon: DELETE `/api/cart/coupon`

## Orders
- Create: POST `/api/orders` { address, shippingCost? }
- Update Status: PATCH `/api/orders/:id/status` { status }
- Mark Paid: PATCH `/api/orders/:id/pay`
- Cancel: PATCH `/api/orders/:id/cancel`

---

# GraphQL (Read)
Endpoint: `/graphql` (GraphiQL enabled in dev)

## Sample Queries

### Products list with filters
```graphql
query Products {
  products(filter: { page: 1, limit: 10, search: "shirt", minPrice: 100, maxPrice: 500, sort: "-createdAt" }) {
    pagination { currentPage totalPages total limit }
    products {
      _id
      name
      slug
      price
      priceAfterDiscount
      ratingsAverage
      category { _id name slug }
      brand { _id name slug }
    }
  }
}
```

### Single product by slug
```graphql
query Product {
  product(identifier: "cool-shirt-slug") {
    _id
    name
    description
    price
    category { name }
    brand { name }
  }
}
```

### Categories
```graphql
query Categories {
  categories {
    _id
    name
    slug
    productCount
  }
}
```

### Me (requires auth cookie)
```graphql
query Me {
  me {
    _id
    username
    fullName
    role
    active
    addresses
  }
}
```

### My Orders (requires auth)
```graphql
query MyOrders {
  myOrders(page: 1, limit: 10) {
    _id
    orderPrice
    status
    isPaid
    createdAt
  }
}
```

### My Cart (requires auth)
```graphql
query MyCart {
  myCart {
    _id
    totalCartPrice
    priceAfterDiscount
    cartItem {
      quantity
      price
      productId { _id name slug price }
    }
  }
}
```

## Notes
- Admin-only routes require `verifyJWT` + admin role.
- Image uploads use `multer` via `upload.single()` or `upload.fields()`.
- `express-graphql` is deprecated upstream; consider migrating to `graphql-http` later.
