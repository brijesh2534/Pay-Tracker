import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Notification } from "../models/notification.model.js";

const getNotifications = asyncHandler(async (req, res) => {
    let notifications = [];
    try {
        notifications = await Notification.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20);
    } catch (err) {
        console.error("getNotifications failed:", err.message);
    }

    return res.status(200).json(
        new ApiResponse(200, notifications, "Notifications fetched successfully")
    );
});

const markNotificationAsRead = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid notification id");
    }
    await Notification.findByIdAndUpdate(id, { unread: false });

    return res.status(200).json(
        new ApiResponse(200, null, "Notification marked as read")
    );
});

const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany({ userId: req.user._id }, { unread: false });

    return res.status(200).json(
        new ApiResponse(200, null, "All notifications marked as read")
    );
});

export {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
};
