const express = require('express');
const router = express.Router();
const BookingRequest = require('../models/BookingRequest');
const Review = require('../models/Review');

router.get('/:bookingId/new', async (req, res) => {
    const booking = await BookingRequest.findById(req.params.bookingId).populate('guide');
    
    // Check if booking exists & belongs to the logged-in traveler
    if (!booking || booking.traveler.toString() !== req.user.id.toString()) {
        return res.status(403).send("Not authorized");
    }

    // Check date
    if (new Date() <= new Date(booking.endDate)) {
        return res.status(400).send("Trip not completed yet");
    }

    res.render('reviews/new', { booking });
});

router.post('/:bookingId', async (req, res) => {
    const booking = await BookingRequest.findById(req.params.bookingId);

    if (!booking || booking.traveler.toString() !== req.user.id.toString()) {
        return res.status(403).send("Not authorized");
    }

    if (new Date() <= new Date(booking.endDate)) {
        return res.status(400).send("Trip not completed yet");
    }

    // Prevent multiple reviews for same booking
    const alreadyReviewed = await Review.findOne({ bookingId: booking._id, travelerId: req.user.id });
    if (alreadyReviewed) {
        return res.status(400).send("You have already reviewed this guide");
    }

    const review = new Review({
        bookingId: booking._id,
        travelerId: req.user.id,
        guideId: booking.guide,
        rating: req.body.rating,
        comment: req.body.comment
    });

    await review.save();

    res.redirect(`/guide/${booking.guide}`); // Redirect to guide profile
});

module.exports=router;