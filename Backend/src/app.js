import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import routes from './routes/index.routes.js';
import { graphqlMiddleware } from './graphql/index.js';

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


//route declaration
app.use('/api', routes)
app.use('/graphql', graphqlMiddleware)

export default app;