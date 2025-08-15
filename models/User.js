const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['traveler', 'guide', 'admin'], default: 'traveler' },
  
    phone: { type: String, default: '' },
  location: { type: String, default: '' }, 
  profileImage: { type: String, default: '' },
  aboutMe: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpires: { type: Date },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  try {
    const saltRounds = 10;
    const hashed = await bcrypt.hash(this.passwordHash, saltRounds);
    this.passwordHash = hashed;
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.verifyPassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
