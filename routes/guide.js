const Guide = require('../models/Guide');
const express = require('express');
const router = express.Router();
const allowRoles = require('../middlewares/roleCheck');
const checkForAuthentication = require('../middlewares/auth');
const multer = require('multer');
const { guideIdProofStorage, guideProfileStorage } = require('../config/cloudinary');
const Destination = require('../models/destination');
const BookingRequest = require('../models/BookingRequest');
const User = require('../models/User');
const TripPlan = require('../models/TripPlan');
const Review = require('../models/Review');
const upload = multer({ storage: guideIdProofStorage }); // for simplicity, use one if both upload to same place

router.post('/profile', checkForAuthentication, allowRoles('guide'), upload.single('profileImage'), async (req, res) => {
  try {
    const guide = await Guide.findOne({ user: req.user.id });
    if (!guide) return res.status(404).send('Guide not found');

    // Update text fields
    guide.bio = req.body.bio || guide.bio;
    guide.expertise = req.body.expertise || guide.expertise;
    guide.pricePerHour = req.body.pricePerHour || guide.pricePerHour;
    guide.location = req.body.location || guide.location;
    if (req.body.languages) {
      guide.languages = req.body.languages.split(',').map(l => l.trim());
    }

    // Update profile image if uploaded
    if (req.file) {
      guide.profileImage.url = req.file.path;
      guide.profileImage.public_id = req.file.filename;

       await User.findByIdAndUpdate(req.user.id, { profileImage: req.file.path });
    }

    await guide.save();
    res.redirect('/guide/profile');
  } catch (err) {
    console.error(err);
    res.status(500).send('Update failed');
  }
});


router.get('/profile',checkForAuthentication, allowRoles('guide'), async (req, res) => {
  try {
    const guide = await Guide.findOne({ user: req.user.id }).populate('user');

    if (!guide) {
      return res.redirect('/guide/complete-profile');
    }

    const destinations = await Destination.find({});
    res.render('guide/profile', { guide , destinations});
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading profile');
  }
});

router.get('/bookings',checkForAuthentication,allowRoles('guide'), async (req, res) => {
  try {
    const guide=await Guide.findOne({user: req.user.id});

     if (!guide) {
      return res.redirect('/guide/complete-profile');
    }

    const guideId = guide._id; // Use correct ID from guide schema
    const acceptedRequests = await BookingRequest.find({
      guide: guideId,
      status: 'accepted'
    }).populate('traveler trip')  .populate({
    path: 'trip',
    populate: {
      path: 'destination',
      model: 'Destination' // Or whatever your model name is
    }
  }).sort({createdAt: -1});

    res.render('guide/acceptedBookings', { acceptedRequests });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});


// Accept request
router.post('/requests/:id/accept', checkForAuthentication, allowRoles('guide'), async (req, res) => {
  try {
    const booking = await BookingRequest.findById(req.params.id);
    booking.status = 'accepted';
    await booking.save();
    res.redirect('/guide/requests'); // or wherever the guide sees requests
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Reject request
router.post('/requests/:id/decline',checkForAuthentication, allowRoles('guide'), async (req, res) => {
  try {
    const booking = await BookingRequest.findById(req.params.id);
    booking.status = 'rejected';
    await booking.save();
    res.redirect('/guide/requests');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


router.get('/requests',allowRoles('guide'), async (req, res) => {
  try {
      const userId = req.user.id;
    const guide = await Guide.findOne({ user: userId });
    if (!guide) {
      return res.redirect('/guide/complete-profile');
    }
    const requests = await BookingRequest.find({ guide: guide._id })
      .sort({createdAt :-1})
      .populate('traveler')  // To show traveler name/email
      .populate('trip')
       .populate({
    path: 'trip',
    populate: { path: 'destination' } // ensures destination is included inside trip
  });     // To show trip title/details


    res.render('guide/requests', { requests });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// routes/guides.js
router.get('/',allowRoles('traveler','admin','guide'),async (req, res) => {
  const destinations = await Destination.find({});
  const selected = req.query.location;

  let guides = [];
  if (selected) {
    guides = await Guide.find({ location: selected, status: 'verified' }).populate('user');
  }

  res.render('guide/index', { destinations, guides, selected,  });
});

router.post('/complete-profile',checkForAuthentication, allowRoles('guide'), upload.fields([
  { name: 'idProof', maxCount: 1 },
  { name: 'profileImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const existing = await Guide.findOne({ user: req.user.id });
    if (existing) return res.redirect('/guide/home');

    const guideData = {
      user: req.user.id,
      bio: req.body.bio,
      expertise: req.body.experience,
      pricePerHour: req.body.pricePerHour,
      location: req.body.location,
      languages: req.body.languages.split(',').map(l => l.trim()),
      idProof: {
        url: req.files['idProof'][0].path,
        public_id: req.files['idProof'][0].filename
      },
      profileImage: {
        url: req.files['profileImage'][0].path,
        public_id: req.files['profileImage'][0].filename
      },
      status: 'pending'
    };

    await Guide.create(guideData);
    await User.findByIdAndUpdate(req.user.id, {
  profileImage: req.files['profileImage'][0].path
});
    res.redirect('/guide/home');
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
});


// Show form to complete guide profile
router.get('/complete-profile', allowRoles('guide'), async (req, res) => {
  const existing = await Guide.findOne({ user: req.user.id });

  // Prevent re-submission
  if (existing) return res.redirect('/guide/home');

   try {
    const destinations = await Destination.find({});
    res.render('guide/complete-profile', { destinations }); 
  } catch (err) {
    console.error('Error loading destinations:', err);
    res.status(500).send("Server Error");
  }
});




router.get('/home', allowRoles('guide'), async (req, res) => {
  const guide = await Guide.findOne({ user: req.user.id });
  res.render('guide/home', { guide });
});


router.get('/:id/reviews', checkForAuthentication, allowRoles('traveler','admin','guide'), async (req, res) => {
  try {
    const guide = await Guide.findById(req.params.id).populate('user');
    if (!guide) {
      return res.status(404).send('Guide not found');
    }

    // Fetch all reviews for this guide
    const reviews = await Review.find({ guideId: req.params.id })
      .populate('travelerId', 'name profileImage')
      .sort({ createdAt: -1 });
let avgRating = 0;
if (reviews.length > 0) {
  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  avgRating = (total / reviews.length).toFixed(1);
}

    res.render('guide/allReviews', { user: req.user,guide, reviews,avgRating });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


router.get('/:id',allowRoles('traveler','admin','guide'), checkForAuthentication,async (req, res) => {
  try {
const guide = await Guide.findById(req.params.id).populate('user');

    if (!guide) {
      return res.status(404).send('404', { message: "Guide not found" });
    }
    const otherGuides = await Guide.find({
  _id: { $ne: guide._id },
  location: guide.location,
  status: 'verified' // optional
}).populate('user');


const reviews = await Review.find({ guideId: req.params.id })
      .populate("travelerId", "name profileImage")
      .sort({ createdAt: -1 })
      .limit(3);
const totalReviewsCount = await Review.countDocuments({ guideId: req.params.id });


// Calculate average rating
let avgRating = 0;
if (totalReviewsCount > 0) {
  const totalRating = await Review.aggregate([
    { $match: { guideId: guide._id } },
    { $group: { _id: null, avg: { $avg: "$rating" } } }
  ]);
  avgRating = totalRating[0] ? totalRating[0].avg.toFixed(1) : 0;
}

    res.render('guide/show', { guide, otherGuides, reviews,totalReviewsCount,avgRating });
  } catch (err) {
    console.error(err);
    res.status(500).send('500', { message: "Server error" });
  }
});



module.exports = router;
