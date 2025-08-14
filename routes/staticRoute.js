const express = require('express');
const router = express.Router();
const allowRoles = require('../middlewares/roleCheck');

router.get('/home',allowRoles('traveler', 'admin'), (req,res) => {
    res.render('home', {
        user: req.user,
    });
})

router.get('/privacy', (req,res) => {
    res.render('privacy');
})

router.get('/terms', (req,res) => {
    res.render('terms');
})

router.get('/about', (req,res) => {
    res.render('about');
})
module.exports = router;