import { app } from '../src/app.js';
import connectDB from '../src/db/index.js';
import '../src/config.js';

let isConnected = false;

const handler = async (req, res) => {
    try {
        // 1. Establish database connection
        if (!isConnected) {
            console.log('Attempting to connect to MongoDB...');
            await connectDB();
            isConnected = true;
            console.log('MongoDB connected successfully.');
        }

        // 2. Handle the request
        return await app(req, res);
    } catch (error) {
        console.error('Vercel Handler Error:', error);
        
        // Return the actual error message to the browser for debugging
        return res.status(500).json({ 
            success: false, 
            message: 'Internal Server Error',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

export default handler;
