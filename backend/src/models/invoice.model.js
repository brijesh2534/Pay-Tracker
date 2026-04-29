import mongoose, { Schema } from "mongoose";

const invoiceSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        clientName: {
            type: String,
            required: true,
        },
        clientEmail: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        dueDate: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ["PENDING", "PAID", "OVERDUE"],
            default: "PENDING",
        },
        invoiceNumber: {
            type: String,
            unique: true,
        },
        token: {
            type: String, // for public access
            required: true,
        },
        paymentLink: {
            type: String, // Razorpay link
        },
        razorpayLinkId: {
            type: String, // Razorpay Link ID (plink_...)
        },
        paymentMethod: {
            type: String,
            enum: ["UPI", "RAZORPAY", "MANUAL"],
        },
        paidAt: {
            type: Date,
        }
    },
    {
        timestamps: true
    }
);

export const Invoice = mongoose.model("Invoice", invoiceSchema);
