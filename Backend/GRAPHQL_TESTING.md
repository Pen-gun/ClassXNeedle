# GraphQL Testing Guide for ClassXNeedle Backend

## Option 1: GraphiQL (Easiest for Development)

### Start the server:
```bash
cd Backend
npm run dev
```

### Open GraphiQL:
Navigate to: **http://localhost:3000/graphql**

This opens an interactive GraphQL IDE where you can:
- Write queries on the left
- See results on the right
- Auto-complete with Ctrl+Space
- View schema documentation on the right sidebar

---

## Option 2: cURL (Command Line)

### Simple Query
```bash
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ categories { _id name slug } }"}'
```

### Query with Variables
```bash
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query GetProduct($id: String!) { product(identifier: $id) { _id name price } }",
    "variables": { "id": "cool-shirt" }
  }'
```

### With Authentication (cookies)
```bash
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -b "accessToken=YOUR_TOKEN_HERE" \
  -d '{"query":"{ me { _id username fullName } }"}'
```

---

## Option 3: Postman

### Setup:
1. Create new **POST** request
2. URL: `http://localhost:3000/graphql`
3. Headers tab:
   - `Content-Type: application/json`
4. Body tab → select **raw** → **GraphQL**

### Example: Get Products
```graphql
query GetProducts {
  products(filter: { page: 1, limit: 10, sort: "-createdAt" }) {
    pagination {
      currentPage
      totalPages
      total
    }
    products {
      _id
      name
      slug
      price
      priceAfterDiscount
      ratingsAverage
      category { name }
      brand { name }
    }
  }
}
```

---

## Sample Test Queries

### 1. List All Categories
```graphql
query GetCategories {
  categories {
    _id
    name
    slug
  }
}
```

### 2. Get Single Product by Slug
```graphql
query GetProductBySlug {
  product(identifier: "amazing-t-shirt") {
    _id
    name
    description
    price
    priceAfterDiscount
    gender
    size
    color
    category {
      _id
      name
    }
    brand {
      _id
      name
    }
    ratingsAverage
    ratingsQuantity
  }
}
```

### 3. Search Products with Filters
```graphql
query SearchProducts {
  products(filter: {
    search: "shirt"
    minPrice: 50
    maxPrice: 500
    gender: "Male"
    page: 1
    limit: 20
    sort: "-ratingsAverage"
  }) {
    pagination {
      currentPage
      totalPages
      total
      limit
    }
    products {
      _id
      name
      price
      priceAfterDiscount
      coverImage
      ratingsAverage
    }
  }
}
```

### 4. Get Product Reviews
```graphql
query GetReviews {
  reviews(productId: "PRODUCT_ID_HERE", page: 1, limit: 5) {
    _id
    rating
    comment
    createdAt
  }
}
```

### 5. Get Current User (Requires Auth)
```graphql
query GetMe {
  me {
    _id
    username
    fullName
    email
    role
    active
    addresses
    wishlist {
      _id
      name
      price
    }
  }
}
```

### 6. Get My Orders (Requires Auth)
```graphql
query GetMyOrders {
  myOrders(page: 1, limit: 5) {
    _id
    orderPrice
    status
    isPaid
    isDelivered
    createdAt
  }
}
```

### 7. Get My Cart (Requires Auth)
```graphql
query GetMyCart {
  myCart {
    _id
    totalCartPrice
    priceAfterDiscount
    cartItem {
      quantity
      price
      productId {
        _id
        name
        slug
        coverImage
      }
    }
  }
}
```

### 8. Get Brands
```graphql
query GetBrands {
  brands(search: "Nike") {
    _id
    name
    slug
    productCount
  }
}
```

### 9. Get SubCategories by Category
```graphql
query GetSubCategories {
  subCategories(categoryId: "CATEGORY_ID_HERE") {
    _id
    name
    slug
    productCount
  }
}
```

---

## Testing with Authentication

### Step 1: Register User (REST)
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

### Step 2: Login (REST)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "username": "testuser",
    "password": "SecurePass123!"
  }'
```
This saves the auth token to `cookies.txt`

### Step 3: Use Auth Cookie in GraphQL
```bash
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "query": "{ me { _id username fullName orders { _id status } } }"
  }'
```

---

## Option 4: JavaScript/Node.js Client

```javascript
// test-graphql.js
import axios from 'axios';

const query = `
  query GetProducts {
    products(filter: { page: 1, limit: 5 }) {
      products {
        _id
        name
        price
      }
      pagination {
        total
      }
    }
  }
`;

async function testGraphQL() {
  try {
    const response = await axios.post('http://localhost:3000/graphql', {
      query
    });
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testGraphQL();
```

Run with: `node test-graphql.js`

---

## Debugging Tips

1. **Check Network Tab**: Open browser DevTools → Network → filter by XHR to see GraphQL requests
2. **Enable Logging**: Add `console.log()` in resolvers to debug query execution
3. **Test Simple Queries First**: Start with `{ categories { name } }` before complex filters
4. **Check Auth Token**: If authenticated query fails, verify token in cookies/headers
5. **GraphQL Errors**: GraphQL returns 200 even on errors; check `errors` field in response

---

## Error Examples

### Missing Required Argument
```
{
  "errors": [
    {
      "message": "Argument \"identifier\" of type \"String!\" is required"
    }
  ]
}
```

### Invalid Query
```
{
  "errors": [
    {
      "message": "Cannot query field \"foo\" on type \"Query\""
    }
  ]
}
```

### Database Error
```
{
  "data": {
    "product": null
  },
  "errors": [
    {
      "message": "Product not found"
    }
  ]
}
```

---

## Quick Test Checklist

- [ ] Server running: `npm run dev`
- [ ] GraphiQL accessible: http://localhost:3000/graphql
- [ ] Test simple query: `{ categories { name } }`
- [ ] Test product search: `{ products(filter: { search: "test" }) { products { name } } }`
- [ ] Register user via REST: POST `/api/auth/register`
- [ ] Login and get token: POST `/api/auth/login`
- [ ] Test auth query: `{ me { username } }` with cookie
