const express = require('express');
const router = express.Router();
const TripPlan = require('../models/TripPlan');
const destination = require('../models/destination');
const checkForAuthentication = require('../middlewares/auth');
const allowRoles=require('../middlewares/roleCheck');
const Guide=require('../models/Guide');
const BookingRequest = require('../models/BookingRequest');
const authorization = require("../middlewares/authorization");

// Booking details page
router.get('/:tripId/booking/:bookingId', checkForAuthentication, allowRoles('traveler','admin'),authorization, async (req, res) => {
  const { tripId, bookingId } = req.params;

const booking = await BookingRequest.findById(bookingId)
  .populate({
    path: 'guide',
    populate: {
      path: 'user', // this assumes guide.user is the field that references User
      model: 'User'
    }
  })
  .populate({
    path: 'trip',
    populate: {
      path: 'destination'
    }
  })
  .populate('traveler');



  if (!booking || booking.trip._id.toString() !== tripId || booking.traveler._id.toString() !== req.user.id) {
    return res.status(404).send('Booking not found or unauthorized');
  }

  res.render('booking/guide-booking-details', { booking });
});



router.get('/:id/book-guide',allowRoles('admin','traveler') ,checkForAuthentication, async (req, res) => {
  try {
    const trip = await TripPlan.findById(req.params.id).populate('destination');
    if (!trip) return res.status(404).send('Trip not found');

    const guides = await Guide.find({ location: trip.destination.name, status: 'verified' }).populate('user');

    res.render('guide/book-from-trip', {
      guides,
      tripId: trip._id,
      showBookingButton: true
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.post('/add/:id', allowRoles('traveler', 'admin'), checkForAuthentication, async (req, res) => {
  try {
    const existing = await TripPlan.findOne({ user: req.user._id, destination: req.params.id });
    if (existing) return res.redirect('/destinations'); // Already added

    const { startDate, endDate, notes } = req.body;
if(new Date(req.body.startDate) > new Date(req.body.endDate)) {
  return res.status(400).json({ error: "Start date cannot be after end date" });
}
    await TripPlan.create({
      user: req.user.id,
      destination: req.params.id,
      startDate,
      endDate,
      notes
    });

    res.redirect('/trip-planner');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

router.get('/', allowRoles('traveler','admin'), checkForAuthentication,async (req, res) => {
  try {
    const trips = await TripPlan.find({ user: req.user.id }).populate('destination');
    res.render('trip-planner', { trips });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});



router.get('/:tripId', allowRoles('traveler', 'admin'), checkForAuthentication, authorization, async (req, res) => {
  try {
    const trip = await TripPlan.findById(req.params.tripId)
      .populate('destination');

    if (!trip) return res.status(404).send('Trip not found');

    // Get all bookings for the current user and trip
    const bookings = await BookingRequest.find({
      trip: req.params.tripId,
      traveler: req.user.id
    }).sort({ createdAt: -1 }).populate('guide');

    // Determine which booking to prioritize
    const acceptedBooking = bookings.find(b => b.status === 'accepted');
    const pendingBooking = bookings.find(b => b.status === 'pending');
    const rejectedBooking = bookings.find(b => b.status === 'rejected');

    const activeBooking = acceptedBooking || pendingBooking || null;

    res.render('tripPlanner-detail', {
      trip,
      user: req.user,
      booking: activeBooking,
      guide: activeBooking?.guide || null,
      showBookingButton: !activeBooking, // show button only if no active booking
      rejectedBooking, // optional: for showing “previous booking was rejected”
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Add itinerary
router.post('/:tripId/itinerary',allowRoles('traveler', 'admin'), checkForAuthentication, authorization, async (req, res) => {
  const { day, title, activities } = req.body;
  const trip = await TripPlan.findById(req.params.tripId);
  trip.itinerary.push({ day, title, activities: activities.split(',').map(a => a.trim()) });
  await trip.save();
  res.redirect(`/trip-planner/${trip._id}`);
});

// Add budget
router.post('/:tripId/budget',allowRoles('traveler', 'admin'), checkForAuthentication, authorization, async (req, res) => {
  const { tripId } = req.params;
  const { category, amount } = req.body;

  try {
    await TripPlan.findByIdAndUpdate(tripId, {
      $push: { budget: { category, amount: Number(amount) } }
    });
    res.redirect(`/trip-planner/${tripId}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding budget category");
  }
});


router.post('/:id/packing', allowRoles('traveler', 'admin'), checkForAuthentication, async (req, res) => {
  try {
    const trip = await TripPlan.findById(req.params.id);
    if (!trip) return res.status(404).send('Trip not found');

    const newItem = req.body.item?.trim();; 

      if (!newItem) {

    return res.redirect(`/trip-planner/${trip._id}`);
  }

    if (newItem) {
      trip.packingList.push({ name: newItem, packed: false }); // updated schema format
      await trip.save();
    }

    res.redirect(`/trip-planner/${req.params.id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


router.post('/:id/packing/:index/toggle', allowRoles('traveler', 'admin'), checkForAuthentication, async (req, res) => {
  try {
    const trip = await TripPlan.findById(req.params.id);
    if (!trip) return res.status(404).send('Trip not found');

    const index = parseInt(req.params.index);
    if (trip.packingList[index]) {
      trip.packingList[index].packed = !trip.packingList[index].packed;
      await trip.save();
    }

    res.redirect(`/trip-planner/${req.params.id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.post('/:id/packing/:index/delete',allowRoles('traveler', 'admin'), checkForAuthentication, async (req, res) => {
  const trip = await TripPlan.findById(req.params.id);
  if (!trip) return res.status(404).send('Trip not found');

  const index = parseInt(req.params.index);
  if (!isNaN(index) && index >= 0 && index < trip.packingList.length) {
    trip.packingList.splice(index, 1);
    await trip.save();
  }

  res.redirect(`/trip-planner/${trip._id}`);
});

// routes/tripPlanner.js

router.post('/:tripId/budget/:category/delete',allowRoles('traveler', 'admin'), checkForAuthentication,authorization, async (req, res) => {
    const { tripId, category } = req.params;

    try {
        const trip = await TripPlan.findById(tripId);

        if (!trip) {
            return res.status(404).send('Trip not found');
        }

        // Remove the budget entry by filtering out the matching category
        trip.budget = trip.budget.filter(item => item.category !== category);

        await trip.save();
        res.redirect(`/trip-planner/${tripId}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Something went wrong');
    }
});

router.post('/:tripId/notes',allowRoles('traveler', 'admin'), checkForAuthentication,authorization, async (req, res) => {
    const { tripId } = req.params;
    const { notes } = req.body;

    try {
        const trip = await TripPlan.findById(tripId);
        if (!trip) return res.status(404).send('Trip not found');

        trip.notes = notes;
        await trip.save();

        res.redirect(`/trip-planner/${tripId}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to update notes');
    }
});

// Route: DELETE itinerary day
router.post('/:tripId/itinerary/delete/:day',allowRoles('traveler', 'admin'), checkForAuthentication,authorization, async (req, res) => {
  const { tripId, day } = req.params;
  const trip = await TripPlan.findById(tripId);
  if (!trip) return res.status(404).send('Trip not found');

  trip.itinerary = trip.itinerary.filter(item => item.day.toString() !== day);
  await trip.save();

  res.redirect(`/trip-planner/${tripId}`);
});


router.post('/:tripId/delete', checkForAuthentication, allowRoles('traveler','admin'), async (req, res) => {
  try {
    const tripId = req.params.tripId;

    // Check for active bookings (pending or accepted)
    const activeBookings = await BookingRequest.find({
      trip: tripId,
      status: { $in: ['pending', 'accepted'] }
    });

    if (activeBookings.length > 0) {
     
      return res.redirect('/trip-planner');
    }

    // Delete rejected bookings associated with this trip
    await BookingRequest.deleteMany({ trip: tripId, status: 'rejected' });

    // Delete the trip
    await TripPlan.findByIdAndDelete(tripId);

    res.redirect('/trip-planner');

  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong while deleting the trip.');
    res.redirect('/trip-planner');
  }
});

module.exports= router;
