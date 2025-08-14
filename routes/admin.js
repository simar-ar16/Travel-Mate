const express = require('express');
const router = express.Router();
const checkAdmin = require('../middlewares/checkAdmin');
const Destination = require('../models/destination');
const upload = require('../middlewares/upload');
const Contact = require('../models/contact');
const Guide = require('../models/Guide');
const User = require('../models/User');
const TripPlan = require('../models/TripPlan');
const BookingRequest = require('../models/BookingRequest');

router.get('/guides',checkAdmin, async (req, res) => {
  try {
    const pendingGuides = await Guide.find({ status: 'pending' }).populate('user');
    const verifiedGuides = await Guide.find({ status: 'verified' }).populate('user');
    res.render('admin/guides', { pendingGuides, verifiedGuides });
  } catch (err) {
    console.error(err);
    res.send('Error loading guides');
  }
});

router.post('/guides/:id/approve',checkAdmin, async (req, res) => {
  await Guide.findByIdAndUpdate(req.params.id, { status: 'verified' });
  res.redirect('/admin/guides');
});

router.post('/guides/:id/reject', checkAdmin,async (req, res) => {
  await Guide.findByIdAndUpdate(req.params.id, { status: 'rejected' });
  res.redirect('/admin/guides');
});


router.get('/analytics', checkAdmin, (req, res) => {
  res.render('admin/analytics', { user: req.user });
});

router.get('/destinations', checkAdmin, async (req, res) => {
  const destinations = await Destination.find();
  res.render('admin/destinations', { destinations });
});

router.get('/destinations/add', checkAdmin, (req, res) => {
  res.render('admin/addDestination');
});

router.post('/destinations/add', checkAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, description, bestTimeToVisit } = req.body;
    const imageUrl = req.file ? req.file.path : '';
const mustVisitArray = req.body.mustVisit
  ? req.body.mustVisit.split(',').map(item => item.trim())
  : [];

    const newDestination = new Destination({
      name,
      description,
      bestTimeToVisit,
      imageUrl,
      mustVisit: mustVisitArray
    });

    await newDestination.save();
    res.redirect('/admin/destinations');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// GET edit form
router.get('/destinations/edit/:id', checkAdmin, async (req, res) => {
  const destination = await Destination.findById(req.params.id);
  if (!destination) return res.status(404).send('Destination not found');
  res.render('admin/editDestination', { destination });
});

// POST update destination
router.post('/destinations/edit/:id', checkAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, description, bestTimeToVisit,mustVisit } = req.body;
    let updateData = { name, description, bestTimeToVisit , mustVisit};

    if (req.file) {
      updateData.imageUrl = req.file.path; // Cloudinary URL
    }

    await Destination.findByIdAndUpdate(req.params.id, updateData);
    res.redirect('/admin/destinations');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// POST delete destination
router.post('/destinations/delete/:id', checkAdmin, async (req, res) => {
  try {
    await Destination.findByIdAndDelete(req.params.id);
    res.redirect('/admin/destinations');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

router.get('/contacts',checkAdmin, async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.render('admin/contact', { messages });
  } catch (err) {
    console.error('Error fetching contacts:', err);
    res.status(500).send('Internal Server Error');
  }
});
module.exports = router;
