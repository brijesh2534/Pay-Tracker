import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/user.model.js";
import connectDB from "../db/index.js";

dotenv.config();

const seedAdmin = async () => {
    try {
        await connectDB();

        const adminEmail = "parth@paytracker.com";
        const adminPass = "PayTracker@1709";

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log("⚠️ Admin already exists. Updating password...");
            existingAdmin.password = adminPass;
            existingAdmin.role = "ADMIN"; // Ensure role is ADMIN
            await existingAdmin.save();
            console.log("✅ Admin updated successfully!");
        } else {
            console.log("🚀 Creating new Admin...");
            await User.create({
                name: "Parth Admin",
                email: adminEmail,
                password: adminPass,
                role: "ADMIN"
            });
            console.log("✅ Admin created successfully!");
        }

        console.log("\n--- Admin Credentials ---");
        console.log(`Email: ${adminEmail}`);
        console.log(`Pass:  ${adminPass}`);
        console.log("---------------------------\n");

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding FAILED:", error);
        process.exit(1);
    }
};

seedAdmin();
