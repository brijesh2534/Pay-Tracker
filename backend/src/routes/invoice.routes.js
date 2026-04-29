import { Router } from "express";
import { 
    createInvoice, 
    getInvoices, 
    getInvoiceById,
    searchInvoice,
    updateInvoiceStatus,
    getDashboardStats,
    uploadPaymentProof
} from "../controllers/invoice.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/search").get(searchInvoice);
router.route("/stats").get(verifyJWT, getDashboardStats);
router.route("/:id").get(getInvoiceById);
router.route("/:id/status").patch(updateInvoiceStatus);
router.route("/:id/proof").post(upload.single("proof"), uploadPaymentProof);

// All other invoice routes require authentication
router.use(verifyJWT);

router.route("/").post(createInvoice).get(getInvoices);

export default router;
