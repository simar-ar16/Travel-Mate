// routes/booking.js or wherever you handle bookings
const Guide = require('../models/Guide');
const express = require('express');
const router = express.Router();
const TripPlan = require('../models/TripPlan');
const checkForAuthentication = require('../middlewares/auth');
const allowRoles=require('../middlewares/roleCheck');
const BookingRequest = require('../models/BookingRequest');


router.get('/:guideId', checkForAuthentication, allowRoles('traveler','admin'), async (req, res) => {
  const { guideId } = req.params;
  const { trip } = req.query;

  const guide = await Guide.findById(guideId).populate('user');
  const tripDetails = await TripPlan.findById(trip).populate('destination');

  if (!guide || !tripDetails) return res.status(404).send('Guide or Trip not found');

  res.render('booking/book-guide', { guide, trip: tripDetails });
});

router.post('/:guideId', checkForAuthentication, allowRoles('traveler','admin'), async (req, res) => {
  const guideId  = req.params.guideId;
  const {startDate, endDate, tripId, days, numberOfPeople, message } = req.body;
// Example: in your POST /bookings route
if (new Date(req.body.startDate) > new Date(req.body.endDate)) {
  return res.status(400).json({ error: "Booking start date cannot be after end date" });
}
const trip = await TripPlan.findById(tripId);
// Extra: ensure booking is inside trip's range
if (new Date(req.body.startDate) < new Date(trip.startDate) ||
    new Date(req.body.endDate) > new Date(trip.endDate)) {
  return res.status(400).json({ error: "Booking must be within trip dates" });
}

  try {
    await BookingRequest.create({
      trip: tripId,
      traveler: req.user.id,
      guide: guideId,
      days,
      numberOfPeople,
      message,
      startDate: new Date(startDate),
  endDate: new Date(endDate),
    });

    res.redirect(`/trip-planner/${tripId}`);
  } catch (error) {
    console.error('Booking request failed:', error);
    res.status(500).send('Failed to send booking request');
  }
});

module.exports=router;