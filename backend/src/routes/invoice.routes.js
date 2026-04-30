import { Router } from "express";
import { 
    createInvoice, 
    getInvoices, 
    getInvoiceById,
    searchInvoice,
    updateInvoiceStatus,
    getDashboardStats,
    uploadPaymentProof,
    getReceivedInvoices
} from "../controllers/invoice.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Routes that don't require auth (or handle it internally)
router.route("/search").get(searchInvoice);

// All other invoice routes require authentication
router.use(verifyJWT);

router.route("/stats").get(getDashboardStats);
router.route("/received").get(getReceivedInvoices);
router.route("/").post(createInvoice).get(getInvoices);

// Dynamic ID routes MUST be last
router.route("/:id").get(getInvoiceById);
router.route("/:id/status").patch(updateInvoiceStatus);
router.route("/:id/proof").post(upload.single("proof"), uploadPaymentProof);

export default router;
