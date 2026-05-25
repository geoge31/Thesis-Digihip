/**
 * @path @/utils/email
 * @file sendEmail.ts
 * Reusable email utility using Nodemailer.
 */

import nodemailer from "nodemailer";

interface SendEmailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

function getTransporter() {
    if (!process.env.EMAIL_HOST) {
        throw new Error("EMAIL_HOST is not set in environment variables");
    }

    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: Number(process.env.EMAIL_PORT) === 465,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
}

export async function sendEmail({ to, subject, text, html }: SendEmailOptions) {
    const transporter = getTransporter();

    const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to,
        subject,
        text,
        html,
    });

    return info;
}
