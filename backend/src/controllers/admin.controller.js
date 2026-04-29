import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Invoice } from "../models/invoice.model.js";

const getAdminStats = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments({ role: "SME" });
    const totalInvoices = await Invoice.countDocuments();
    
    const revenueData = await Invoice.aggregate([
        {
            $match: { status: "PAID" }
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: "$amount" }
            }
        }
    ]);

    const pendingData = await Invoice.aggregate([
        {
            $match: { status: "PENDING" }
        },
        {
            $group: {
                _id: null,
                totalPending: { $sum: "$amount" }
            }
        }
    ]);

    const recentUsers = await User.find({ role: "SME" })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("-password -refreshToken");

    const recentInvoices = await Invoice.find()
        .sort({ createdAt: -1 })
        .limit(5);

    const stats = {
        totalUsers,
        totalInvoices,
        totalRevenue: revenueData[0]?.totalRevenue || 0,
        totalPending: pendingData[0]?.totalPending || 0,
        recentUsers,
        recentInvoices
    };

    return res.status(200).json(
        new ApiResponse(200, stats, "Admin stats fetched successfully")
    );
});

export {
    getAdminStats
};
