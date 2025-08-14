// models/TripPlan.js
const mongoose = require('mongoose');

const tripPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  destination: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination',
    required: true
  },
  startDate: {
  type: Date,
  required: true
},
endDate: {
  type: Date,
  required: true
},
notes: {
  type: String,
  default: ''
},
budget: [
  {
    category: String,
    amount: Number
  }
],
packingList: [
  {
    name: String,
    packed: Boolean
  }
]
,
itinerary: [
  {
    day: Number,
    title: String,
    activities: [String]
  }
],
  addedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('TripPlan', tripPlanSchema);
