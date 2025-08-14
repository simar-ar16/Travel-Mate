const express = require('express');
const router = express.Router();
const Destination = require('../models/destination');
const allowRoles=require('../middlewares/roleCheck');

// Show all destinations to travellers
router.get('/',allowRoles('traveler','admin'), async (req, res) => {
  try {
    const destinations = await Destination.find();
    res.render('traveller/destinations', { destinations });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

router.get('/:id',allowRoles('traveler','admin'), async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      return res.status(404).send('Destination not found');
    }
    res.render('destination/show', { destination });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
