import { Router } from "express";
import { 
    loginUser, 
    logoutUser, 
    registerUser,
    updateUserDetails,
    updateGstSettings
} from "../controllers/user.controller.js";
import { getActivityLogs } from "../controllers/activity.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

// Secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/update-account").patch(verifyJWT, updateUserDetails);
router.route("/update-gst").patch(verifyJWT, updateGstSettings);
router.route("/activity").get(verifyJWT, getActivityLogs);

export default router;
