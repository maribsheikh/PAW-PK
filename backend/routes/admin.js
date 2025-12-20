import express from 'express';
import multer from 'multer';
import { body, validationResult } from 'express-validator';
import { db } from '../utils/db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { processImage, deleteProductImages } from '../utils/imageProcessor.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// ========== PRODUCTS ==========

// Get all products (admin view - includes inactive)
router.get('/products', async (req, res, next) => {
  try {
    const products = await db('products')
      .orderBy('created_at', 'desc')
      .select('*');
    
    // Get images for each product
    const productIds = products.map(p => p.id);
    const images = await db('product_images')
      .whereIn('product_id', productIds)
      .select('*');
    
    const productsWithImages = products.map(product => ({
      ...product,
      images: images
        .filter(img => img.product_id === product.id)
        .map(img => ({ size: img.size_label, url: img.url }))
    }));
    
    res.json(productsWithImages);
  } catch (error) {
    logger.error('Admin get products error', error);
    next(error);
  }
});

// Create product
router.post('/products', upload.array('images', 5), [
  body('title').trim().isLength({ min: 1, max: 255 }),
  body('sku').trim().isLength({ min: 1, max: 100 }),
  body('description').optional().isString(),
  body('price_pkr').optional().isFloat({ min: 0 }),
  body('category').isIn(['dogs', 'cats']),
  body('stock').optional().isInt({ min: 0 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'At least one image is required' });
    }
    
    const { title, sku, description, price_pkr, category, stock, variants } = req.body;
    
    // Generate slug
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    
    // Check if SKU exists
    const existingSku = await db('products').where({ sku }).first();
    if (existingSku) {
      return res.status(400).json({ error: 'SKU already exists' });
    }
    
    // Parse variants if provided as JSON string
    let variantsData = [];
    if (variants) {
      try {
        variantsData = typeof variants === 'string' ? JSON.parse(variants) : variants;
      } catch (e) {
        return res.status(400).json({ error: 'Invalid variants format' });
      }
    }
    
    // Use first variant price as base price, or provided price_pkr
    const basePrice = variantsData.length > 0 
      ? Math.min(...variantsData.map(v => parseFloat(v.price_pkr)))
      : parseFloat(price_pkr || 0);
    
    // Create product
    const [product] = await db('products')
      .insert({
        title,
        slug,
        sku,
        description: description || null,
        price_pkr: basePrice,
        category,
        stock: 0, // Stock is managed per variant
        is_active: true
      })
      .returning('*');
    
    // Create variants
    if (variantsData.length > 0) {
      const variantRecords = variantsData.map(v => ({
        product_id: product.id,
        size: v.size,
        price_pkr: parseFloat(v.price_pkr),
        stock: parseInt(v.stock || 0),
        dimensions: v.dimensions || null
      }));
      await db('product_variants').insert(variantRecords);
    } else {
      // Create default variant if none provided (backward compatibility)
      await db('product_variants').insert({
        product_id: product.id,
        size: 'medium',
        price_pkr: basePrice,
        stock: parseInt(stock || 0),
        dimensions: null
      });
    }
    
    // Process and save images
    const imageRecords = [];
    for (const file of req.files) {
      const processedImages = await processImage(file, product.id);
      for (const img of processedImages) {
        imageRecords.push({
          product_id: product.id,
          url: img.url,
          size_label: img.sizeLabel
        });
      }
    }
    
    if (imageRecords.length > 0) {
      await db('product_images').insert(imageRecords);
    }
    
    // Get product with images
    const images = await db('product_images')
      .where('product_id', product.id)
      .select('*');
    
    res.status(201).json({
      ...product,
      images: images.map(img => ({ size: img.size_label, url: img.url }))
    });
  } catch (error) {
    logger.error('Admin create product error', error);
    next(error);
  }
});

// Update product
router.put('/products/:id', upload.array('images', 5), [
  body('title').optional().trim().isLength({ min: 1, max: 255 }),
  body('sku').optional().trim().isLength({ min: 1, max: 100 }),
  body('price_pkr').optional().isFloat({ min: 0 }),
  body('category').optional().isIn(['dogs', 'cats']),
  body('stock').optional().isInt({ min: 0 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { id } = req.params;
    const updates = {};
    
    if (req.body.title) {
      updates.title = req.body.title;
      updates.slug = req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
    if (req.body.sku) updates.sku = req.body.sku;
    if (req.body.description !== undefined) updates.description = req.body.description;
    if (req.body.price_pkr) updates.price_pkr = parseFloat(req.body.price_pkr);
    if (req.body.category) updates.category = req.body.category;
    if (req.body.stock !== undefined) updates.stock = parseInt(req.body.stock);
    if (req.body.is_active !== undefined) updates.is_active = req.body.is_active === 'true' || req.body.is_active === true;
    
    // Check if product exists
    const product = await db('products').where({ id }).first();
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Check SKU uniqueness if changed
    if (updates.sku && updates.sku !== product.sku) {
      const existingSku = await db('products').where({ sku: updates.sku }).first();
      if (existingSku) {
        return res.status(400).json({ error: 'SKU already exists' });
      }
    }
    
    // Update product
    const [updated] = await db('products')
      .where({ id })
      .update(updates)
      .returning('*');
    
    // Handle new images if uploaded
    if (req.files && req.files.length > 0) {
      const imageRecords = [];
      for (const file of req.files) {
        const processedImages = await processImage(file, product.id);
        for (const img of processedImages) {
          imageRecords.push({
            product_id: product.id,
            url: img.url,
            size_label: img.sizeLabel
          });
        }
      }
      if (imageRecords.length > 0) {
        await db('product_images').insert(imageRecords);
      }
    }
    
    // Get updated product with images and variants
    const images = await db('product_images')
      .where('product_id', updated.id)
      .select('*');
    
    const variants = await db('product_variants')
      .where('product_id', updated.id)
      .select('*');
    
    res.json({
      ...updated,
      images: images.map(img => ({ size: img.size_label, url: img.url })),
      variants: variants.map(v => ({
        id: v.id,
        size: v.size,
        price_pkr: parseFloat(v.price_pkr),
        stock: v.stock,
        dimensions: v.dimensions
      }))
    });
  } catch (error) {
    logger.error('Admin update product error', error);
    next(error);
  }
});

// Delete product
router.delete('/products/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const product = await db('products').where({ id }).first();
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Delete images from filesystem
    await deleteProductImages(id);
    
    // Delete from database (cascade will handle related records)
    await db('products').where({ id }).delete();
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    logger.error('Admin delete product error', error);
    next(error);
  }
});

// ========== ORDERS ==========

// Get all orders
router.get('/orders', async (req, res, next) => {
  try {
    const orders = await db('orders')
      .join('users', 'orders.user_id', 'users.id')
      .select('orders.*', 'users.name as user_name', 'users.email as user_email')
      .orderBy('orders.created_at', 'desc');
    
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
    logger.error('Admin get orders error', error);
    next(error);
  }
});

// Update order status
router.patch('/orders/:id', [
  body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  body('payment_status').optional().isIn(['pending', 'paid', 'failed', 'refunded'])
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { id } = req.params;
    const { status, payment_status } = req.body;
    
    const updates = {};
    if (status) updates.status = status;
    if (payment_status) updates.payment_status = payment_status;
    
    const [order] = await db('orders')
      .where({ id })
      .update(updates)
      .returning('*');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    logger.error('Admin update order error', error);
    next(error);
  }
});

// ========== REVIEWS ==========

// Get all reviews (pending moderation)
router.get('/reviews', async (req, res, next) => {
  try {
    const { status } = req.query;
    
    let query = db('reviews')
      .join('users', 'reviews.user_id', 'users.id')
      .join('products', 'reviews.product_id', 'products.id')
      .select('reviews.*', 'users.name as user_name', 'products.title as product_title')
      .orderBy('reviews.created_at', 'desc');
    
    if (status) {
      query = query.where('reviews.status', status);
    }
    
    const reviews = await query;
    res.json(reviews);
  } catch (error) {
    logger.error('Admin get reviews error', error);
    next(error);
  }
});

// Moderate review
router.patch('/reviews/:id', [
  body('status').isIn(['pending', 'approved', 'rejected'])
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { id } = req.params;
    const { status } = req.body;
    
    const [review] = await db('reviews')
      .where({ id })
      .update({ status })
      .returning('*');
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    res.json(review);
  } catch (error) {
    logger.error('Admin moderate review error', error);
    next(error);
  }
});

// ========== ANALYTICS ==========

// Get analytics dashboard data
router.get('/analytics', async (req, res, next) => {
  try {
    // Sales by day (last 30 days)
    const salesByDay = await db('orders')
      .where('created_at', '>=', db.raw("CURRENT_DATE - INTERVAL '30 days'"))
      .where('payment_status', 'paid')
      .select(
        db.raw("DATE(created_at) as date"),
        db.raw("COUNT(*) as order_count"),
        db.raw("SUM(total_amount) as total_sales")
      )
      .groupBy(db.raw("DATE(created_at)"))
      .orderBy('date', 'asc');
    
    // Best sellers
    const bestSellers = await db('order_items')
      .join('products', 'order_items.product_id', 'products.id')
      .select(
        'products.id',
        'products.title',
        'products.sku',
        db.raw('SUM(order_items.quantity) as total_sold'),
        db.raw('SUM(order_items.price * order_items.quantity) as total_revenue')
      )
      .groupBy('products.id', 'products.title', 'products.sku')
      .orderBy('total_sold', 'desc')
      .limit(10);
    
    // Total stats
    const totalOrders = await db('orders').count('* as count').first();
    const totalRevenue = await db('orders')
      .where('payment_status', 'paid')
      .sum('total_amount as total')
      .first();
    const totalProducts = await db('products').count('* as count').first();
    const pendingReviews = await db('reviews')
      .where('status', 'pending')
      .count('* as count')
      .first();
    
    res.json({
      salesByDay,
      bestSellers,
      stats: {
        totalOrders: parseInt(totalOrders.count),
        totalRevenue: parseFloat(totalRevenue.total || 0),
        totalProducts: parseInt(totalProducts.count),
        pendingReviews: parseInt(pendingReviews.count)
      }
    });
  } catch (error) {
    logger.error('Admin analytics error', error);
    next(error);
  }
});

export default router;

