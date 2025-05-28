const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Book = require('../models/Books');
const Review = require('../models/Review');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /books - Add a new book (Authenticated users only)
router.post('/', auth, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('author').trim().notEmpty().withMessage('Author is required'),
  body('genre').trim().notEmpty().withMessage('Genre is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('publishedYear').isInt({ min: 1000, max: new Date().getFullYear() }).withMessage('Invalid published year'),
  body('isbn').optional().matches(/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/).withMessage('Invalid ISBN format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const bookData = {
      ...req.body,
      addedBy: req.user._id
    };

    const book = new Book(bookData);
    await book.save();
    
    await book.populate('addedBy', 'username email');

    res.status(201).json({
      message: 'Book added successfully',
      book
    });
  } catch (error) {
    console.error('Add book error:', error);
    res.status(500).json({ error: 'Server error while adding book' });
  }
});

// GET /books - Get all books with pagination and filters
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('author').optional().trim(),
  query('genre').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.author) {
      filter.author = { $regex: req.query.author, $options: 'i' };
    }
    if (req.query.genre) {
      filter.genre = { $regex: req.query.genre, $options: 'i' };
    }

    const books = await Book.find(filter)
      .populate('addedBy', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Book.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      books,
      pagination: {
        currentPage: page,
        totalPages,
        totalBooks: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({ error: 'Server error while fetching books' });
  }
});

// GET /books/:id - Get book details by ID
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('addedBy', 'username');
    
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Get reviews with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ book: book._id })
      .populate('user', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalReviews = await Review.countDocuments({ book: book._id });
    const totalPages = Math.ceil(totalReviews / limit);

    res.json({
      book,
      reviews,
      pagination: {
        currentPage: page,
        totalPages,
        totalReviews,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get book details error:', error);
    res.status(500).json({ error: 'Server error while fetching book details' });
  }
});

// POST /books/:id/reviews - Submit a review
router.post('/:id/reviews', auth, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().isLength({ min: 10, max: 1000 }).withMessage('Comment must be between 10 and 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Check if user already reviewed this book
    const existingReview = await Review.findOne({
      book: req.params.id,
      user: req.user._id
    });

    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this book' });
    }

    const review = new Review({
      rating: req.body.rating,
      comment: req.body.comment,
      book: req.params.id,
      user: req.user._id
    });

    await review.save();
    await review.populate('user', 'username');

    res.status(201).json({
      message: 'Review submitted successfully',
      review
    });
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({ error: 'Server error while submitting review' });
  }
});

module.exports = router;

