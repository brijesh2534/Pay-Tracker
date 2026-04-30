import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ["success", "warning", "info", "error"],
            default: "info"
        },
        category: {
            type: String,
            enum: ["payment", "overdue", "viewed", "report", "product", "invoice"],
            default: "invoice"
        },
        unread: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

export const Notification = mongoose.model("Notification", notificationSchema);
