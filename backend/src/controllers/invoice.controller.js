import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Invoice } from "../models/invoice.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import crypto from "crypto";
import { sendInvoiceEmail } from "../utils/mail.js";

import Razorpay from "razorpay";

let razorpay;
const getRazorpayInstance = () => {
    if (!razorpay) {
        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        if (!keyId || !keySecret || keyId === "your_client_id" || keyId.startsWith("your_")) {
            console.warn("Razorpay API keys are missing or invalid. Skipping link generation.");
            return null;
        }
        razorpay = new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
        });
    }
    return razorpay;
};

const createInvoice = asyncHandler(async (req, res) => {
    const { clientName, clientEmail, amount, dueDate, paymentMethod } = req.body;

    if (
        [clientName, clientEmail, amount, dueDate].some((field) => 
            field === undefined || field === null || (typeof field === "string" && field.trim() === "")
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    // Generate unique invoice number: INV-YEAR-RANDOM
    const date = new Date();
    const year = date.getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `INV-${year}-${random}`;

    // Generate public access token
    const token = crypto.randomBytes(32).toString("hex");

    // Generate Razorpay Payment Link
    let paymentLink = "";
    const razorpayInstance = getRazorpayInstance();
    if (razorpayInstance) {
        try {
            const razorpayResponse = await razorpayInstance.paymentLink.create({
                amount: amount * 100, // amount in paise
                currency: "INR",
                accept_partial: false,
                description: `Invoice ${invoiceNumber} for ${clientName}`,
                customer: {
                    name: clientName,
                    email: clientEmail,
                },
                notify: {
                    sms: false,
                    email: true,
                },
                reminder_enable: true,
                notes: {
                    invoice_number: invoiceNumber,
                },
                // We redirect back to the payment page to show success
                callback_url: `${process.env.CORS_ORIGIN}/search`, 
                callback_method: "get",
            });
            paymentLink = razorpayResponse.short_url;
        } catch (error) {
            console.error("Razorpay Error:", error);
        }
    }

    const invoice = await Invoice.create({
        userId: req.user?._id,
        clientName,
        clientEmail,
        amount,
        dueDate,
        invoiceNumber,
        token,
        paymentLink,
        paymentMethod: paymentMethod || "RAZORPAY",
        status: "PENDING"
    });

    if (!invoice) {
        throw new ApiError(500, "Something went wrong while creating the invoice");
    }

    // Send Invoice Email
    const upiId = req.user?.upiId || "merchant@upi";
    const totalWithTax = amount * 1.18;
    const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(req.user?.businessName || req.user?.name)}&am=${totalWithTax.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Invoice ${invoiceNumber}`)}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUri)}`;

    const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #6366f1; margin: 0;">Pay Tracker</h1>
                <p style="color: #6b7280; font-size: 14px; margin-top: 5px;">Modern Invoicing Solution</p>
            </div>
            <h2 style="color: #111827; border-bottom: 1px solid #eee; padding-bottom: 10px;">New Invoice from ${req.user?.businessName || req.user?.name}</h2>
            <p>Hi ${clientName},</p>
            <p>You have a new invoice <strong>${invoiceNumber}</strong> for professional services.</p>
            <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0; color: #374151;">Amount Due: <strong style="font-size: 18px;">₹${totalWithTax.toFixed(2)}</strong></p>
                <p style="margin: 5px 0; color: #374151;">Due Date: <strong>${new Date(dueDate).toLocaleDateString()}</strong></p>
            </div>
            <p>Scan the QR code below to pay instantly via any UPI app (GPay, PhonePe, Paytm):</p>
            <div style="text-align: center; margin: 20px 0;">
                <img src="${qrUrl}" alt="Payment QR Code" style="border: 1px solid #eee; border-radius: 10px; width: 180px; height: 180px;" />
            </div>
            ${paymentLink ? `
            <p>Or pay securely online via Razorpay (Cards, Netbanking, Wallets):</p>
            <div style="text-align: center; margin: 20px 0;">
                <a href="${paymentLink}" style="display: inline-block; background: #6366f1; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">Pay via Razorpay</a>
            </div>
            ` : ''}
            <p style="margin-top: 30px; font-size: 12px; color: #6b7280; text-align: center;">
                Sent by ${req.user?.businessName || req.user?.name} via Pay Tracker.<br>
                For any queries, please contact <a href="mailto:${req.user?.email}" style="color: #6366f1;">${req.user?.email}</a>
            </p>
        </div>
    `;

    // Send email asynchronously
    sendInvoiceEmail({
        to: clientEmail,
        subject: `Invoice ${invoiceNumber} from ${req.user?.businessName || req.user?.name}`,
        html: emailHtml
    }).catch(err => console.error("Email sending failed:", err));

    return res.status(201).json(
        new ApiResponse(201, invoice, "Invoice created successfully with payment link and email sent")
    );
});

const getInvoices = asyncHandler(async (req, res) => {
    const invoices = await Invoice.find({ userId: req.user?._id }).sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, invoices, "Invoices fetched successfully")
    );
});

const getInvoiceById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    // For public access, we don't check userId. 
    // We populate the 'userId' field which contains the SME/Merchant info.
    const invoice = await Invoice.findById(id).populate("userId", "name businessName upiId");

    if (!invoice) {
        throw new ApiError(404, "Invoice not found");
    }

    // Transform userId to 'sme' for the frontend
    const invoiceData = invoice.toObject();
    invoiceData.sme = invoiceData.userId;
    delete invoiceData.userId;

    return res.status(200).json(
        new ApiResponse(200, invoiceData, "Invoice fetched successfully")
    );
});

const searchInvoice = asyncHandler(async (req, res) => {
    const { invoiceNumber, email } = req.query;

    if (!invoiceNumber || !email) {
        throw new ApiError(400, "Invoice number and email are required");
    }

    const invoice = await Invoice.findOne({ 
        invoiceNumber: invoiceNumber.toUpperCase(), 
        clientEmail: email.toLowerCase() 
    });

    if (!invoice) {
        throw new ApiError(404, "Invoice not found or email mismatch");
    }

    return res.status(200).json(
        new ApiResponse(200, invoice, "Invoice found")
    );
});

const updateInvoiceStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!["PENDING", "PAID", "OVERDUE"].includes(status)) {
        throw new ApiError(400, "Invalid status");
    }

    const invoice = await Invoice.findByIdAndUpdate(
        id,
        { 
            status,
            paidAt: status === "PAID" ? new Date() : null
        },
        { new: true }
    );

    if (!invoice) {
        throw new ApiError(404, "Invoice not found");
    }

    return res.status(200).json(
        new ApiResponse(200, invoice, `Invoice marked as ${status.toLowerCase()}`)
    );
});

export {
    createInvoice,
    getInvoices,
    getInvoiceById,
    searchInvoice,
    updateInvoiceStatus
};
