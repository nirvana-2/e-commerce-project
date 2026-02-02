const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text, html) => { // 1. Added 'html' here
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
            html, // 2. Added 'html' here
        };

        await transporter.sendMail(mailOptions);
        console.log("✅ Email sent successfully to:", to);
    } catch (err) {
        console.error("❌ Error sending email:", err);
        throw new Error("Email could not be sent");
    }
};

module.exports = sendEmail;