import { buildSchema } from 'graphql';

export const schema = buildSchema(`
  scalar Date

  type Category { _id: ID! name: String! slug: String image: String }
  type SubCategory { _id: ID! name: String! slug: String category: Category }
  type Brand { _id: ID! name: String! slug: String image: String }

  type Product {
    _id: ID!
    name: String!
    slug: String!
    description: String
    quantity: Int
    sold: Boolean
    price: Float
    priceAfterDiscount: Float
    coverImage: String
    images: [String]
    material: String
    gender: String
    size: [String]
    color: [String]
    ratingsAverage: Float
    ratingsQuantity: Int
    category: Category
    subCategory: SubCategory
    brand: Brand
    createdAt: Date
  }

  type User {
    _id: ID!
    username: String!
    fullName: String!
    email: String
    phone: String
    role: String!
    active: Boolean!
    addresses: [String]
    wishlist: [Product]
  }

  type Review {
    _id: ID!
    rating: Int!
    comment: String!
    productId: ID!
    userId: ID!
    createdAt: Date
  }

  type OrderItem { productId: ID! quantity: Int! size: String color: String }
  type Order {
    _id: ID!
    orderItems: [OrderItem!]!
    customer: User!
    address: String!
    shippingCost: Float!
    orderPrice: Float!
    isPaid: Boolean
    paidAt: Date
    isDelivered: Boolean
    deliveredAt: Date
    status: String!
    createdAt: Date
  }

  type CartItem { productId: Product! quantity: Int! price: Float! size: String color: String }
  type Cart {
    _id: ID!
    cartItem: [CartItem!]!
    totalCartPrice: Float!
    priceAfterDiscount: Float
    customer: User!
    createdAt: Date
  }

  input ProductFilter {
    search: String
    category: ID
    subCategory: ID
    brand: ID
    gender: String
    minPrice: Float
    maxPrice: Float
    size: [String]
    color: [String]
    inStock: Boolean
    page: Int
    limit: Int
    sort: String
  }

  type Pagination {
    currentPage: Int!
    totalPages: Int!
    total: Int!
    limit: Int!
  }

  type ProductList {
    products: [Product!]!
    pagination: Pagination!
  }

  type Query {
    products(filter: ProductFilter): ProductList!
    product(identifier: String!): Product
    categories: [Category!]!
    category(identifier: String!): Category
    subCategories(categoryId: ID): [SubCategory!]!
    subCategory(identifier: String!): SubCategory
    brands(search: String): [Brand!]!
    brand(identifier: String!): Brand
    reviews(productId: ID, userId: ID, rating: Int, page: Int, limit: Int): [Review!]!
    review(id: ID!): Review
    me: User
    myOrders(page: Int, limit: Int): [Order!]!
    myCart: Cart
  }
`);
