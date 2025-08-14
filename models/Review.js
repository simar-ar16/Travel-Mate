const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    travelerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    guideId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', reviewSchema);
