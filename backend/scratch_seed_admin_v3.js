import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "./src/models/user.model.js";
import { DB_NAME } from "./src/constants.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

const seedAdmin = async () => {
    try {
        const uri = `${process.env.MONGODB_URI}/${DB_NAME}`;
        console.log("Connecting to:", uri);
        await mongoose.connect(uri);
        console.log("Connected to MongoDB");

        const email = "parth@paytracker.com";
        const password = "PayTracker@1709";

        let user = await User.findOne({ email: email.toLowerCase() });

        if (user) {
            console.log("User already exists, updating role and password...");
            user.role = "ADMIN";
            user.password = password;
            await user.save();
            console.log("User updated to ADMIN successfully");
        } else {
            console.log("Creating new ADMIN user...");
            await User.create({
                name: "Parth Sata",
                email: email.toLowerCase(),
                password: password,
                role: "ADMIN",
                businessName: "Pay Tracker",
                upiId: "parth@upi"
            });
            console.log("ADMIN user created successfully");
        }

        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    } catch (error) {
        console.error("Error seeding admin:", error);
        process.exit(1);
    }
};

seedAdmin();
