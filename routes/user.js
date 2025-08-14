const express = require('express');
const { setUser } = require('../service/auth'); 
const User = require('../models/User');
const router = express.Router();
const checkForAuthentication=require('../middlewares/auth');
const allowRoles=require('../middlewares/roleCheck')
const multer = require('multer');
const { userProfileStorage } = require('../config/cloudinary');
const uploadUP = multer({ storage: userProfileStorage });

router.post('/remove-profile-image', checkForAuthentication, allowRoles('traveler', 'admin'), async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { profileImage: '' });
    res.redirect('/user/profile');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to remove profile photo');
  }
});

router.get('/profile', checkForAuthentication, allowRoles('traveler', 'admin'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.render('traveller/profile', { user });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// POST Update Profile
router.post('/profile', checkForAuthentication, allowRoles('traveler', 'admin'), uploadUP.single('profileImage'), async (req, res) => {
  try {
    const updateData = {
      aboutMe: req.body.aboutMe,
      location: req.body.location,
      phone: req.body.phone,
    };

    if (req.file) {
      updateData.profileImage = req.file.path; // URL from Cloudinary
    }

    await User.findByIdAndUpdate(req.user.id, updateData);
    res.redirect('/user/profile');
  } catch (err) {
    console.error(err);
    res.redirect('/user/profile');
  }
});

router.get('/signup', (req, res) => {
  res.render('signup', {error: req.query.error});
});

router.get('/login', (req, res) => {
  res.render('login', {error: req.query.error});
});

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
       return res.redirect('/user/signup?error=email');
    }

    const user = await User.create({
      name,
      email,
      passwordHash: password, // your pre-save hook will hash it
      role: role || 'traveler',
    });

    const token = setUser(user);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60,
    });

    if(user.role == 'guide')
        res.redirect('/guide/home');
    else
    res.redirect('/home')
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Signup failed' });
  }
});


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = await User.findOne({email});
    if (!user) return res.redirect('/user/login?error=invalid');

    const valid = await user.verifyPassword(password);
    if (!valid) return res.redirect('/user/login?error=invalid');

    const token = setUser(user);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60,
    });
    if(user.role == 'guide')
        res.redirect('/guide/home');
    else
    res.redirect('/home');
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send({ error: 'Login failed' });
  }
});

router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

router.get('/:id', checkForAuthentication, async (req, res) => {
  try {
    const profileuser = await User.findById(req.params.id).lean();
    if (!profileuser) {
      return res.status(404).send('User not found');
    }
    if (profileuser.role !== 'traveler' && profileuser.role !== 'admin') {
    return res.status(404).send('User Not Found');
}

    res.render('traveller/public-profile', { profileuser,
      user: req.user,
     });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});
module.exports = router;
