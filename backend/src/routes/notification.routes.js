import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { 
    getNotifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead 
} from "../controllers/notification.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getNotifications);
router.route("/mark-all").patch(markAllNotificationsAsRead);
router.route("/:id/read").patch(markNotificationAsRead);

export default router;
