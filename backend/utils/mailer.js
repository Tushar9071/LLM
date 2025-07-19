import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail", // or your email provider
    auth: {
        user: process.env.EMAIL_USER, // set in your .env
        pass: process.env.EMAIL_PASS, // set in your .env
    },
});

export const sendOTPEmail = async (to, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: "Your OTP Code",
        text: `Your OTP code is: ${otp}`,
    };
    await transporter.sendMail(mailOptions);
};