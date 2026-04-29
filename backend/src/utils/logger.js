import { ActivityLog } from "../models/activityLog.model.js";

export const logActivity = async ({ userId, invoiceId, action, details, metadata }) => {
    try {
        await ActivityLog.create({
            userId,
            invoiceId,
            action,
            details,
            metadata
        });
    } catch (error) {
        console.error("❌ Failed to log activity:", error);
    }
};
