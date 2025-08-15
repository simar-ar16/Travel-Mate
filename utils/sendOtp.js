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
    html: `<p>Your OTP is <b>${otp}</b>. It is valid for 10 minutes.</p>`,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = sendOtp;
