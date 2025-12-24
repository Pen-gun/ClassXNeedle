import { graphqlHTTP } from 'express-graphql';
import { schema } from './schema.js';
import { resolvers } from './resolvers.js';

export const graphqlMiddleware = (req, res, next) => {
  return graphqlHTTP({
    schema,
    rootValue: resolvers,
    graphiql: process.env.NODE_ENV !== 'production',
    context: { req }
  })(req, res, next);
};