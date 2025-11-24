import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function connectToDatabase() {
    const Db = process.env.atlasURL;
    const client = new MongoClient(Db);
    try {
        await client.connect();
        console.log("Connected to MongoDB Atlas");
        return client;
    } catch (error) {
        console.error("Error connecting to MongoDB Atlas:", error);
        throw error;
    }
}
connectToDatabase();