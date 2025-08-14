const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  bestTimeToVisit: { type: String, required: true },
  imageUrl: { type: String, default: '' },
  mustVisit: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Destination', destinationSchema);
