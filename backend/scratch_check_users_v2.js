import mongoose from "mongoose";
import { User } from "./src/models/user.model.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        const users = await User.find({}, "email role name");
        console.log("Total users found:", users.length);
        users.forEach(u => {
            console.log(`- '${u.email}' (${u.role}) - ${u.name}`);
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

checkUsers();