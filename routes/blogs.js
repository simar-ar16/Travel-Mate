const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const User = require('../models/User');
const checkForAuthentication = require('../middlewares/auth');
const multer = require('multer');
const { blogStorage } = require('../config/cloudinary');
const upload = multer({ storage: blogStorage });
const mongoose = require('mongoose');
const Guide = require('../models/Guide');

router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate('author', 'name role') 
      .sort({ createdAt: -1 })
      .lean();
 const guides = await Guide.find().lean();
    res.render('blogs/index', { blogs,guides, user: req.user });
  } catch (err) {
    console.error('Error loading blogs:', err);
    res.send('Error loading blogs');
  }
});


router.get('/new', checkForAuthentication, (req, res) => {
  // Only logged-in users (traveler or guide) can create blogs
  res.render('blogs/new', { user: req.user });
});

router.post('/new', checkForAuthentication, upload.single('image'), async (req, res) => {
  try {
    const imageUrl = req.file ? req.file.path : null;

    const newBlog = new Blog({
      title: req.body.title,
      description: req.body.description,
      image: imageUrl,
      author: req.user.id,
      role: req.user.role
    });

    await newBlog.save();
    res.redirect('/blogs');
  } catch (err) {
    console.error('Error creating blog:', err);
    res.send('Failed to create blog');
  }
});



// GET /blogs/manage - show all blogs of the logged-in user
router.get('/manage', checkForAuthentication, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all blogs authored by the user
    const blogs = await Blog.find({ author: userId }).sort({ createdAt: -1 }).lean();

    res.render('blogs/manage', { blogs, user: req.user });
  } catch (err) {
    console.error('Error fetching user blogs:', err);
    res.send('Failed to load your blogs');
  }
});

// GET /blogs/:id/edit - show edit form for a blog
router.get('/:id/edit', checkForAuthentication, async (req, res) => {
  try {
    const blogId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return res.send('Invalid blog ID');
    }

    const blog = await Blog.findById(blogId).lean();

    if (!blog) {
      return res.send('Blog not found');
    }

    // Ensure user is author of the blog
    if (blog.author.toString() !== req.user.id.toString()) {
      return res.send('You are not authorized to edit this blog');
    }

    res.render('blogs/edit', { blog, user: req.user });
  } catch (err) {
    console.error('Error fetching blog for edit:', err);
    res.send('Failed to load blog for editing');
  }
});

// PUT /blogs/:id - update blog
router.put('/:id', checkForAuthentication, upload.single('image'), async (req, res) => {
  try {
    const blogId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return res.send('Invalid blog ID');
    }

    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.send('Blog not found');
    }

    if (blog.author.toString() !== req.user.id.toString()) {
      return res.send('You are not authorized to edit this blog');
    }

    // Update fields
    blog.title = req.body.title;
    blog.description = req.body.description;

    // If a new image is uploaded, update it
    if (req.file && req.file.path) {
      blog.image = req.file.path;
    }

    await blog.save();
    res.redirect('/blogs/manage');
  } catch (err) {
    console.error('Error updating blog:', err);
    res.send('Failed to update blog');
  }
});

// POST /blogs/:id/delete - delete a blog
router.post('/:id/delete', checkForAuthentication, async (req, res) => {
  try {
    const blogId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return res.send('Invalid blog ID');
    }

    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.send('Blog not found');
    }

    // Ensure user is the author
    if (blog.author.toString() !== req.user.id.toString()) {
      return res.send('You are not authorized to delete this blog');
    }

    await Blog.findByIdAndDelete(blogId);
    res.redirect('/blogs/manage');
  } catch (err) {
    console.error('Error deleting blog:', err);
    res.send('Failed to delete blog');
  }
});

router.get('/:id', async (req, res) => {
  try {
    const blogId = req.params.id;

    // Find the blog and populate author
    const blog = await Blog.findById(blogId)
      .populate('author', 'name role')
      .lean();
 const guides = await Guide.find().lean();
    if (!blog) {
      return res.send('Blog not found');
    }

    res.render('blogs/show', { blog,guides, user: req.user });
  } catch (err) {
    console.error('Error fetching blog:', err);
    res.send('Failed to load blog');
  }
});

module.exports = router;
