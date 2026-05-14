import { asyncHandler } from "../utils/asyncHandler.js";
import { ActivityLog } from "../models/activityLog.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const getActivityLogs = asyncHandler(async (req, res) => {
    let logs = [];
    try {
        logs = await ActivityLog.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50);
    } catch (err) {
        console.error("getActivityLogs failed:", err.message);
    }

    return res.status(200).json(
        new ApiResponse(200, logs, "Activity logs fetched successfully")
    );
});
