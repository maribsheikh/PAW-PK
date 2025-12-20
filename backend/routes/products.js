import express from 'express';
import { db } from '../utils/db.js';
import { logger } from '../utils/logger.js';
import { discoverProductImages } from '../utils/imageDiscovery.js';

const router = express.Router();

// Get all products with filters
router.get('/', async (req, res, next) => {
  try {
    const { q, category, minPrice, maxPrice, sort = 'created_at' } = req.query;
    
    let query = db('products')
      .where('is_active', true)
      .select('products.*');
    
    // Search (SQLite uses LIKE, not ILIKE)
    if (q) {
      query = query.where(function() {
        this.where('title', 'like', `%${q}%`)
          .orWhere('description', 'like', `%${q}%`)
          .orWhere('sku', 'like', `%${q}%`);
      });
    }
    
    // Category filter
    if (category && (category === 'dogs' || category === 'cats')) {
      query = query.where('category', category);
    }
    
    // Price range
    if (minPrice) {
      query = query.where('price_pkr', '>=', parseFloat(minPrice));
    }
    if (maxPrice) {
      query = query.where('price_pkr', '<=', parseFloat(maxPrice));
    }
    
    // Sorting
    const sortMap = {
      price: 'price_pkr',
      'price-desc': 'price_pkr',
      popularity: 'created_at',
      'created_at': 'created_at'
    };
    
    const sortColumn = sortMap[sort] || 'created_at';
    const sortOrder = sort === 'price-desc' ? 'desc' : 'asc';
    query = query.orderBy(sortColumn, sortOrder);
    
    const products = await query;
    
    // Get images for each product
    const productIds = products.map(p => p.id);
    const images = await db('product_images')
      .whereIn('product_id', productIds)
      .select('*');
    
    // Get variants for each product
    const variants = await db('product_variants')
      .whereIn('product_id', productIds)
      .select('*');
    
    // Get reviews for average rating
    const reviews = await db('reviews')
      .whereIn('product_id', productIds)
      .where('status', 'approved')
      .select('product_id', 'rating');
    
    // Calculate average ratings
    const ratingsMap = {};
    reviews.forEach(review => {
      if (!ratingsMap[review.product_id]) {
        ratingsMap[review.product_id] = { sum: 0, count: 0 };
      }
      ratingsMap[review.product_id].sum += review.rating;
      ratingsMap[review.product_id].count += 1;
    });
    
    // Attach images, variants, and ratings to products
    const productsWithData = products.map(product => {
      const productImages = images
        .filter(img => img.product_id === product.id)
        .map(img => ({ size: img.size_label, url: img.url }));
      
      const productVariants = variants
        .filter(v => v.product_id === product.id)
        .map(v => ({
          id: v.id,
          size: v.size,
          price_pkr: parseFloat(v.price_pkr),
          stock: v.stock,
          dimensions: v.dimensions
        }));
      
      // Get min price from variants for display
      const minPrice = productVariants.length > 0
        ? Math.min(...productVariants.map(v => v.price_pkr))
        : product.price_pkr;
      
      const ratingData = ratingsMap[product.id];
      const avgRating = ratingData ? (ratingData.sum / ratingData.count) : 0;
      const reviewCount = ratingData ? ratingData.count : 0;
      
      return {
        ...product,
        price_pkr: minPrice, // Use min price for listing
        images: productImages,
        variants: productVariants,
        averageRating: parseFloat(avgRating.toFixed(1)),
        reviewCount
      };
    });
    
    res.json(productsWithData);
  } catch (error) {
    logger.error('Get products error', error);
    next(error);
  }
});

// Get single product
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const product = await db('products')
      .where({ id, is_active: true })
      .first();
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Get images from database
    const dbImages = await db('product_images')
      .where('product_id', id)
      .select('*')
      .orderBy('size_label');
    
    // Discover all images from public/images folder (including color variants)
    const discoveredImages = await discoverProductImages(id);
    
    // Combine database images with discovered images
    const allImages = [];
    const imageMap = new Map();
    
    // Add discovered images first (they're more complete)
    discoveredImages.all.forEach(img => {
      if (!imageMap.has(img.url)) {
        allImages.push(img.url);
        imageMap.set(img.url, true);
      }
    });
    
    // Add database images that aren't already included
    dbImages.forEach(img => {
      if (!imageMap.has(img.url)) {
        allImages.push(img.url);
        imageMap.set(img.url, true);
      }
    });
    
    // Get variants
    const variants = await db('product_variants')
      .where('product_id', id)
      .select('*')
      .orderByRaw("CASE size WHEN 'small' THEN 1 WHEN 'medium' THEN 2 WHEN 'large' THEN 3 END");
    
    // Get approved reviews
    const reviews = await db('reviews')
      .where({ product_id: id, status: 'approved' })
      .join('users', 'reviews.user_id', 'users.id')
      .select('reviews.*', 'users.name as user_name')
      .orderBy('reviews.created_at', 'desc');
    
    // Calculate average rating
    const ratings = reviews.map(r => r.rating);
    const avgRating = ratings.length > 0
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : 0;
    
    res.json({
      ...product,
      images: allImages, // All image URLs
      imageColors: discoveredImages.colors, // Color variants
      baseImages: discoveredImages.base.map(img => img.url), // Base images without color
      variants: variants.map(v => ({
        id: v.id,
        size: v.size,
        price_pkr: parseFloat(v.price_pkr),
        stock: v.stock,
        dimensions: v.dimensions,
        product_code: v.product_code || null
      })),
      reviews,
      averageRating: parseFloat(avgRating.toFixed(1)),
      reviewCount: reviews.length
    });
  } catch (error) {
    logger.error('Get product error', error);
    next(error);
  }
});

export default router;

