import nodemailer from "nodemailer";
import { google } from "googleapis";

const OAuth2 = google.auth.OAuth2;

const createTransporter = async () => {
    const clientId = process.env.GMAIL_CLIENT_ID;
    const clientSecret = process.env.GMAIL_CLIENT_SECRET;
    const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
    const user = process.env.GMAIL_USER;

    if (!clientId || !clientSecret || !refreshToken || !user || clientId.includes("your_")) {
        console.warn("Gmail API credentials are not configured. Skipping email.");
        return null;
    }

    const oauth2Client = new OAuth2(
        clientId,
        clientSecret,
        "https://developers.google.com/oauthplayground"
    );

    oauth2Client.setCredentials({
        refresh_token: refreshToken
    });

    try {
        const accessTokenResponse = await oauth2Client.getAccessToken();
        const accessToken = accessTokenResponse.token;

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: process.env.GMAIL_USER,
                accessToken,
                clientId: process.env.GMAIL_CLIENT_ID,
                clientSecret: process.env.GMAIL_CLIENT_SECRET,
                refreshToken: process.env.GMAIL_REFRESH_TOKEN
            }
        });

        return transporter;
    } catch (error) {
        console.error("Failed to create transporter:", error);
        return null;
    }
};

export const sendInvoiceEmail = async ({ to, subject, html }) => {
    try {
        const emailTransporter = await createTransporter();
        if (!emailTransporter) return;
        
        await emailTransporter.sendMail({
            from: `"Pay Tracker" <${process.env.GMAIL_USER}>`,
            to,
            subject,
            html
        });
    } catch (err) {
        console.error("Email Error:", err);
    }
};
