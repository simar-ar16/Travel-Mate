const express = require('express');
const router = express.Router();
const Contact = require('../models/contact');

router.get('/', (req, res) => {
  res.render('contact', { success: false });
});

router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    await Contact.create({ name, email, message });
    res.render('contact', { success: true });
  } catch (err) {
    console.error('Contact form error:', err);
    res.status(500).send('Something went wrong.');
  }
});

module.exports = router;
