import { app } from './src/app.js';
import connectDB from './src/db/index.js';

// We don't need config.js/dotenv on Vercel as Vercel handles env vars natively
let isConnected = false;

export default async (req, res) => {
    try {
        if (!isConnected) {
            await connectDB();
            isConnected = true;
        }
        return await app(req, res);
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: 'Vercel Runtime Error',
            error: error.message 
        });
    }
};
