# ClassXNeedle Setup Guide

## Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB instance
- Cloudinary account (for image uploads)

## Backend Setup

1. **Navigate to Backend directory:**
   ```bash
   cd Backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - The `.env` file has been created for you
   - Update the following required variables:

   ```env
   # Database - Get from MongoDB Atlas
   MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net

   # JWT Secrets - Generate random strings (use: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
   ACCESS_TOKEN_SECRET=your_generated_secret_here
   REFRESH_TOKEN_SECRET=your_generated_secret_here

   # Cloudinary - Get from cloudinary.com dashboard
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Seed database (optional):**
   ```bash
   npm run seed
   ```

5. **Start backend server:**
   ```bash
   npm run dev
   ```
   Server will run on http://localhost:3000

## Frontend Setup

1. **Navigate to Frontend directory:**
   ```bash
   cd Frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - The `.env` file has been created with correct defaults
   - Only modify if backend runs on different port

4. **Start frontend development server:**
   ```bash
   npm run dev
   ```
   Frontend will run on http://localhost:5173

## Quick Start (Both Apps)

From the root directory, you can use the VS Code tasks:
- **Run Both Apps** - Starts both frontend and backend simultaneously

## API Endpoints

### REST API
- Base URL: `http://localhost:3000/api`
- Auth: `/api/auth/*`
- Products: `/api/products/*`
- Cart: `/api/cart/*`
- Orders: `/api/orders/*`

### GraphQL
- URL: `http://localhost:3000/graphql`
- GraphiQL available in development mode

## Testing

- Backend has no tests yet
- Frontend can be linted with: `npm run lint`

## Troubleshooting

### Backend won't start
- Verify MongoDB connection string is correct
- Ensure all environment variables are set
- Check if port 3000 is available

### Frontend can't connect to backend
- Verify backend is running on port 3000
- Check CORS settings in backend/src/app.js
- Ensure CLIENT_URL in backend .env matches frontend URL

### Image uploads fail
- Verify Cloudinary credentials are correct
- Check network connectivity to Cloudinary

## Production Deployment

Before deploying:
1. Set `NODE_ENV=production` in backend
2. Update `CLIENT_URL` to production frontend URL
3. Generate new JWT secrets (never use development secrets in production)
4. Build frontend: `npm run build`
5. Use environment variables from hosting platform (don't commit .env files)
