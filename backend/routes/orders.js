import express from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../utils/db.js';
import { authenticate } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get user orders
router.get('/', authenticate, async (req, res, next) => {
  try {
    const orders = await db('orders')
      .where('user_id', req.user.id)
      .orderBy('created_at', 'desc')
      .select('*');
    
    // Get order items for each order
    const orderIds = orders.map(o => o.id);
    const items = await db('order_items')
      .whereIn('order_id', orderIds)
      .join('products', 'order_items.product_id', 'products.id')
      .select('order_items.*', 'products.title', 'products.slug');
    
    const ordersWithItems = orders.map(order => ({
      ...order,
      items: items.filter(item => item.order_id === order.id)
    }));
    
    res.json(ordersWithItems);
  } catch (error) {
    logger.error('Get orders error', error);
    next(error);
  }
});

// Get single order
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const order = await db('orders')
      .where({ id, user_id: req.user.id })
      .first();
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const items = await db('order_items')
      .where('order_id', id)
      .join('products', 'order_items.product_id', 'products.id')
      .select('order_items.*', 'products.title', 'products.slug', 'products.sku');
    
    // Parse JSON from SQLite (stored as text)
    const orderData = {
      ...order,
      shipping_address: typeof order.shipping_address === 'string' 
        ? JSON.parse(order.shipping_address) 
        : order.shipping_address,
      items
    };
    res.json(orderData);
  } catch (error) {
    logger.error('Get order error', error);
    next(error);
  }
});

// Create order (checkout) - Allow guest checkout
router.post('/', [
  body('shippingAddress').isObject(),
  body('shippingAddress.name').notEmpty(),
  body('shippingAddress.phone').notEmpty(),
  body('shippingAddress.address').notEmpty(),
  body('shippingAddress.city').notEmpty(),
  body('paymentMethod').isIn(['cod', 'jazzcash', 'easypaisa', 'stripe', 'card'])
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { shippingAddress, paymentMethod, items } = req.body;
    const sessionId = req.headers['x-session-id'] || 'default';
    
    // Get cart from session (in production, use Redis)
    // For now, accept items from request body
    const cartItems = items || [];
    
    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
    
    // Calculate total
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Create order (SQLite stores JSON as text, so stringify it)
    // Allow guest checkout - user_id is optional
    const userId = req.user?.id || null;
    const [order] = await db('orders')
      .insert({
        user_id: userId,
        total_amount: totalAmount,
        shipping_address: JSON.stringify(shippingAddress), // Stringify for SQLite
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'cod' ? 'pending' : 'pending',
        status: 'pending'
      })
      .returning('*');
    
    // Create order items
    const orderItems = cartItems.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      price: item.price,
      quantity: item.quantity
    }));
    
    await db('order_items').insert(orderItems);
    
    // Update product stock
    for (const item of cartItems) {
      await db('products')
        .where('id', item.productId)
        .decrement('stock', item.quantity);
    }
    
    // Simulate payment processing
    // In production, integrate with payment gateway
    if (paymentMethod !== 'cod') {
      // Simulate payment success
      await db('orders')
        .where('id', order.id)
        .update({ payment_status: 'paid' });
    }
    
    // TODO: Send email notification (mock)
    logger.info(`Order created: ${order.id} for user ${req.user.id}`);
    
    res.status(201).json(order);
  } catch (error) {
    logger.error('Create order error', error);
    next(error);
  }
});

export default router;

