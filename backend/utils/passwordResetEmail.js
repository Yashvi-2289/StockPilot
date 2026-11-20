const nodemailer = require("nodemailer");

function getMailConfiguration() {
    const port = Number(process.env.SMTP_PORT);
    const frontendUrl = process.env.FRONTEND_URL;

    if (
        !process.env.SMTP_HOST ||
        !Number.isInteger(port) ||
        port < 1 ||
        port > 65535 ||
        !process.env.SMTP_USER ||
        !process.env.SMTP_PASSWORD ||
        !process.env.MAIL_FROM ||
        !frontendUrl
    ) {
        return null;
    }

    try {
        const parsedFrontendUrl = new URL(frontendUrl);
        if (!["http:", "https:"].includes(parsedFrontendUrl.protocol)) {
            return null;
        }

        return {
            host: process.env.SMTP_HOST,
            port,
            secure: process.env.SMTP_SECURE === "true" || port === 465,
            user: process.env.SMTP_USER,
            password: process.env.SMTP_PASSWORD,
            from: process.env.MAIL_FROM,
            frontendUrl: parsedFrontendUrl
        };
    } catch {
        return null;
    }
}

function isPasswordResetConfigured() {
    return getMailConfiguration() !== null;
}

async function sendPasswordResetEmail(email, token) {
    const configuration = getMailConfiguration();
    if (!configuration) {
        throw new Error("Password reset email is not configured.");
    }

    const resetUrl = new URL("/", configuration.frontendUrl);
    resetUrl.searchParams.set("resetToken", token);

    const transporter = nodemailer.createTransport({
        host: configuration.host,
        port: configuration.port,
        secure: configuration.secure,
        auth: {
            user: configuration.user,
            pass: configuration.password
        }
    });

    await transporter.sendMail({
        from: configuration.from,
        to: email,
        subject: "Reset your StockPilot password",
        text: `Use this link to reset your StockPilot password. It expires in one hour:\n\n${resetUrl.toString()}\n\nIf you did not request this, you can ignore this email.`,
        html: `<p>Use this link to reset your StockPilot password. It expires in one hour:</p><p><a href="${resetUrl.toString()}">Reset password</a></p><p>If you did not request this, you can ignore this email.</p>`
    });
}

module.exports = {
    isPasswordResetConfigured,
    sendPasswordResetEmail
};
