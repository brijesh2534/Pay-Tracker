import { app } from '../src/app.js';
import connectDB from '../src/db/index.js';
import '../src/config.js';

let isConnected = false;

const handler = async (req, res) => {
    // 1. Check if required environment variables are present
    if (!process.env.MONGODB_URI) {
        console.error('CRITICAL: MONGODB_URI is missing from environment variables.');
        return res.status(500).json({ 
            success: false, 
            message: 'Database configuration missing. Please set MONGODB_URI in Vercel settings.' 
        });
    }

    // 2. Establish database connection
    if (!isConnected) {
        try {
            await connectDB();
            isConnected = true;
            console.log('MongoDB connected successfully in Vercel.');
        } catch (error) {
            console.error('MongoDB connection error in Vercel handler:', error.message);
            return res.status(500).json({ 
                success: false, 
                message: 'Database connection failed.',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // 3. Handle the request
    try {
        return await app(req, res);
    } catch (error) {
        console.error('Express App Error:', error.message);
        return res.status(500).json({ 
            success: false, 
            message: 'Internal Server Error in Express app.' 
        });
    }
};

export default handler;
