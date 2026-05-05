import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
    credentials: true
}));

app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}));
app.use(express.static("public"));
app.use(cookieParser());


// Routes import
import userRouter from './routes/user.routes.js'
import invoiceRouter from './routes/invoice.routes.js'
import adminRouter from './routes/admin.routes.js'
import notificationRouter from './routes/notification.routes.js'

// Routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/invoices", invoiceRouter)
app.use("/api/v1/admin", adminRouter)
app.use("/api/v1/notifications", notificationRouter)

export { app };
