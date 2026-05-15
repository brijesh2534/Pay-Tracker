import { app } from './src/app.js';
import connectDB from './src/db/index.js';

let isConnected = false;

export default async (req, res) => {
    // 1. Simple heartbeat check
    if (req.url === '/api/health') {
        return res.status(200).json({ status: 'Backend is alive and reaching Vercel!' });
    }

    try {
        if (!isConnected) {
            console.log('Connecting to DB...');
            await connectDB();
            isConnected = true;
        }
        return await app(req, res);
    } catch (error) {
        console.error('Vercel Handler Error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Internal Crash',
            error: error.message 
        });
    }
};
