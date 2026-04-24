import mongoose, { Schema } from "mongoose";

const paymentSchema = new Schema(
    {
        invoiceId: {
            type: Schema.Types.ObjectId,
            ref: "Invoice",
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        method: {
            type: String,
            enum: ["UPI", "RAZORPAY", "MANUAL"],
            required: true,
        },
        status: {
            type: String,
            enum: ["SUCCESS", "PENDING", "FAILED"],
            default: "PENDING",
        },
        transactionId: {
            type: String, // Razorpay or manual reference
        },
        proofImage: {
            type: String, // screenshot (Cloudinary URL)
        }
    },
    {
        timestamps: true
    }
);

export const Payment = mongoose.model("Payment", paymentSchema);
