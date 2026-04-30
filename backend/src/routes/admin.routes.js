import { Router } from "express";
import { 
    getAdminStats, 
    getAllUsers, 
    deleteUser 
} from "../controllers/admin.controller.js";
import { verifyJWT, isAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT, isAdmin);

router.route("/stats").get(getAdminStats);
router.route("/users").get(getAllUsers);
router.route("/users/:id").delete(deleteUser);

export default router;
