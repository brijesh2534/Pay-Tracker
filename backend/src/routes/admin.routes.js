import { Router } from "express";
import { getAdminStats } from "../controllers/admin.controller.js";
import { verifyJWT, isAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT, isAdmin);

router.route("/stats").get(getAdminStats);

export default router;
