export default async (req, res) => {
    return res.status(200).json({ 
        message: 'The Vercel environment is working!',
        note: 'This file has ZERO imports. If you see this, the problem is in your backend code imports.'
    });
};
