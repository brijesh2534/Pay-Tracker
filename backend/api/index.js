import { app } from '../src/app.js';
import connectDB from '../src/db/index.js';
import '../src/config.js';

let isConnected = false;

const handler = async (req, res) => {
    try {
        // 1. Diagnostic: Check if environment variables are loaded
        const envKeys = Object.keys(process.env);
        if (!process.env.MONGODB_URI) {
            return res.status(500).json({ 
                success: false, 
                message: 'MONGODB_URI is missing in Vercel.',
                availableKeys: envKeys.filter(k => !k.includes('SECRET') && !k.includes('KEY')) // Safety check
            });
        }

        // 2. Establish database connection
        if (!isConnected) {
            console.log('Connecting to MongoDB...');
            await connectDB();
            isConnected = true;
        }

        // 3. Handle the request
        return await app(req, res);
    } catch (error) {
        console.error('SERVER CRASH:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Internal Server Error',
            error: error.message,
            stack: error.stack, // Show stack trace for debugging
            type: error.name
        });
    }
};

export default handler;
