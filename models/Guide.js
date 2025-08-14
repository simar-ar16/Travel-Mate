// models/Guide.js
const mongoose = require('mongoose');

const guideSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  bio: String,
  expertise: String,
  pricePerHour: Number,
  location: String,
  languages: [String],
  profileImage: {
  url: String,
  public_id: String
},
  idProof: {
    url: String,
    public_id: String
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  }
});

module.exports = mongoose.model('Guide', guideSchema);
