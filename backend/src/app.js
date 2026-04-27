import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}));
app.use(express.static("public"));
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    if (req.method !== 'GET') {
        console.log('[BODY]', JSON.stringify(req.body, null, 2));
    }
    next();
});

// Routes import
import userRouter from './routes/user.routes.js'
import invoiceRouter from './routes/invoice.routes.js'

// Routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/invoices", invoiceRouter)

export { app };
