import mongoose, { Schema } from "mongoose";

const activitySchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        action: {
            type: String, 
            // "CREATE_INVOICE", "PAYMENT_RECEIVED", etc.
        },
        invoiceId: {
            type: Schema.Types.ObjectId,
            ref: "Invoice",
        },
        message: {
            type: String,
        }
    },
    {
        timestamps: true
    }
);

export const ActivityLog = mongoose.model("ActivityLog", activitySchema);
