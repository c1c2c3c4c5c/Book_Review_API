const express = require('express');
const { query, validationResult } = require('express-validator');
const Book = require('../models/Review');

const router = express.Router();

// GET /search - Search books by title or author
router.get('/', [
  query('q').trim().notEmpty().withMessage('Search query is required'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const searchQuery = req.query.q;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Search using text index for better performance
    const searchFilter = {
      $or: [
        { title: { $regex: searchQuery, $options: 'i' } },
        { author: { $regex: searchQuery, $options: 'i' } }
      ]
    };

    const books = await Book.find(searchFilter)
      .populate('addedBy', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Book.countDocuments(searchFilter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      query: searchQuery,
      books,
      pagination: {
        currentPage: page,
        totalPages,
        totalResults: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Server error while searching books' });
  }
});

module.exports = router;
