require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

mongoose.connect(process.env.MONGO_URI, {
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
const checkForAuthentication = require('./middlewares/auth');

app.use(checkForAuthentication);

const staticRouter=require('./routes/staticRoute');
app.use('/',staticRouter);
const contactRoutes = require('./routes/contact');
app.use('/contact', contactRoutes);
const authRoutes = require('./routes/user');
app.use('/user', authRoutes);
const adminRoutes = require('./routes/admin');
app.use('/admin', adminRoutes);
const destinationRoutes = require('./routes/destinations');
app.use('/destinations', destinationRoutes);
const tripRoute=require('./routes/tripPlanner');
app.use('/trip-planner',tripRoute);
const guideRoute=require('./routes/guide');
app.use('/guide',guideRoute);
const bookRoute=require('./routes/booking');
app.use('/book-guide',bookRoute);
const chatRoute=require('./routes/chat');
app.use('/chat',chatRoute);
const reviewRoute=require('./routes/reviews');
app.use('/reviews',reviewRoute);

app.get('/', (req, res) => {
  res.render('landing');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

module.exports = app;
