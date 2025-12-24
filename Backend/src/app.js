import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express()

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}))
app.use(express.json(
    {
        limit: '10mb',
    }
))
app.use(express.urlencoded({
    extended: true,
    limit: '10mb',
}))
app.use(express.static('public'))
app.use(cookieParser())

//route import
import routes from './routes/index.routes.js';
import { graphqlMiddleware } from './graphql/index.js';

//route declaration
app.use('/graphql', graphqlMiddleware)
app.use('/api', routes)

export default app;