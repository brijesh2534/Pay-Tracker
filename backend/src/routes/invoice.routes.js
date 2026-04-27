import { Router } from "express";
import { 
    createInvoice, 
    getInvoices, 
    getInvoiceById,
    searchInvoice,
    updateInvoiceStatus 
} from "../controllers/invoice.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/search").get(searchInvoice);
router.route("/:id").get(getInvoiceById);
router.route("/:id/status").patch(updateInvoiceStatus);

// All other invoice routes require authentication
router.use(verifyJWT);

router.route("/").post(createInvoice).get(getInvoices);

export default router;
