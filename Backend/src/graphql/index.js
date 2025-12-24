import { graphqlHTTP } from 'express-graphql';
import { schema } from './schema.js';
import { resolvers } from './resolvers.js';
import jwt from 'jsonwebtoken';
import { User } from '../Models/users.model.js';

export const graphqlMiddleware = async (req, res, next) => {
  // Extract and verify JWT token
  const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
  
  if (token) {
    try {
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decodedToken?.userId).select('-password -refreshToken');
      if (user) {
        req.user = user; // Attach user to request
      }
    } catch (error) {
      // Token invalid or expired - continue without user (public queries still work)
    }
  }

  return graphqlHTTP({
    schema,
    rootValue: resolvers,
    graphiql: process.env.NODE_ENV !== 'production',
    context: { req }
  })(req, res, next);
};