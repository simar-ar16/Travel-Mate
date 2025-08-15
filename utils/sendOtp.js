const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendOtp(email, otp) {
  const mailOptions = {
    from: `"TravelMate" <${process.env.EMAIL}>`,
    to: email,
    subject: 'Your OTP for TravelMate Signup',
    html: ` <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #ffcc00;">Welcome to TravelMate!</h2>
      <p>Hey there,</p>
      <p>Thank you for signing up. To complete your registration, please use the OTP below to verify your email address:</p>
      
      <p style="font-size: 24px; font-weight: bold; color: #000; background: #ffcc00; padding: 10px 20px; display: inline-block; border-radius: 8px;">
        ${otp}
      </p>

      <p>This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
      
      <p>If you did not request this verification, please ignore this email.</p>

      <p>Cheers,<br>The TravelMate Team</p>
    </div>`,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = sendOtp;
