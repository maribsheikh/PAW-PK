import express from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../utils/db.js';
import { authenticate } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get reviews for a product
router.get('/product/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params;
    
    const reviews = await db('reviews')
      .where({ product_id: productId, status: 'approved' })
      .join('users', 'reviews.user_id', 'users.id')
      .select('reviews.*', 'users.name as user_name')
      .orderBy('reviews.created_at', 'desc');
    
    res.json(reviews);
  } catch (error) {
    logger.error('Get reviews error', error);
    next(error);
  }
});

// Create review
router.post('/', authenticate, [
  body('productId').isInt(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').optional().isString().isLength({ max: 1000 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { productId, rating, comment } = req.body;
    
    // Verify product exists
    const product = await db('products').where({ id: productId }).first();
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Check if user already reviewed this product
    const existingReview = await db('reviews')
      .where({ product_id: productId, user_id: req.user.id })
      .first();
    
    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this product' });
    }
    
    // Create review (pending approval)
    const [review] = await db('reviews')
      .insert({
        product_id: productId,
        user_id: req.user.id,
        rating,
        comment: comment || null,
        status: 'pending'
      })
      .returning('*');
    
    res.status(201).json(review);
  } catch (error) {
    logger.error('Create review error', error);
    next(error);
  }
});

// Update review status (admin only - handled in admin routes)
// This endpoint is for users to update their own review
router.patch('/:id', authenticate, [
  body('rating').optional().isInt({ min: 1, max: 5 }),
  body('comment').optional().isString().isLength({ max: 1000 })
], async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    
    const review = await db('reviews').where({ id }).first();
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    if (review.user_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own reviews' });
    }
    
    // If review is approved, set back to pending
    const updates = {};
    if (rating) updates.rating = rating;
    if (comment !== undefined) updates.comment = comment;
    if (review.status === 'approved') updates.status = 'pending';
    
    const [updated] = await db('reviews')
      .where({ id })
      .update(updates)
      .returning('*');
    
    res.json(updated);
  } catch (error) {
    logger.error('Update review error', error);
    next(error);
  }
});

export default router;

