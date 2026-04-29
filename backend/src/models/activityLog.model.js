import mongoose, { Schema } from "mongoose";

const activityLogSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        invoiceId: {
            type: Schema.Types.ObjectId,
            ref: "Invoice",
        },
        action: {
            type: String,
            required: true,
            // e.g., "INVOICE_CREATED", "PAYMENT_RECEIVED", "REMINDER_SENT", "STATUS_UPDATED"
        },
        details: {
            type: String,
        },
        metadata: {
            type: Object,
        }
    },
    {
        timestamps: true
    }
);

export const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
