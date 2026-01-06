import connectToDB from './db/connectionToDb.helper.js';
import dotenv from 'dotenv';
import app from './app.js';

// Load environment variables from .env file in Backend directory
dotenv.config();

connectToDB().then(()=>{
    app.listen(process.env.PORT, ()=>{
        console.log(`Server is running on port ${process.env.PORT}`);
    });
    app.on('error', (err)=>{
        console.error("Error starting the server", err);
    });
}).catch((err)=>{
    console.error("Failed to connect to the database", err);
    process.exit(1);
});