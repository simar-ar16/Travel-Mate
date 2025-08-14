const mongoose = require('mongoose');

const bookingRequestSchema = new mongoose.Schema({
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TripPlan',
    required: true
  },
  traveler: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  guide: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guide',
    required: true
  },
  days: {
    type: Number,
    required: true
  },
  numberOfPeople: {
    type: Number,
    required: true
  },
  message: {
    type: String
  },
  startDate: {
  type: Date,
  required: true
},
endDate: {
  type: Date,
  required: true
},
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  
} , { timestamps: true });

module.exports = mongoose.model('BookingRequest', bookingRequestSchema);
