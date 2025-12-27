import express from "express";
import { db } from "../utils/db.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

// In-memory cart storage (in production, use Redis or database)
const carts = new Map();

// Get or create cart
router.get("/", (req, res) => {
  const sessionId = req.headers["x-session-id"] || "default";
  const cart = carts.get(sessionId) || { items: [], total: 0 };
  res.json(cart);
});

// Add to cart
router.post("/add", async (req, res, next) => {
  try {
    const { productId, variantId, quantity = 1 } = req.body;
    const sessionId = req.headers["x-session-id"] || "default";

    // Verify product exists and is active
    const product = await db("products")
      .where({ id: productId, is_active: true })
      .first();

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Get variant if provided
    let variant = null;
    let price = product.price_pkr;
    let size = null;

    if (variantId) {
      variant = await db("product_variants")
        .where({ id: variantId, product_id: productId })
        .first();

      if (!variant) {
        return res.status(404).json({ error: "Variant not found" });
      }

      if (variant.stock < quantity) {
        return res
          .status(400)
          .json({ error: "Insufficient stock for selected size" });
      }

      price = variant.price_pkr;
      size = variant.size;
    } else {
      // If no variant, check product stock (for backward compatibility)
      if (product.stock < quantity) {
        return res.status(400).json({ error: "Insufficient stock" });
      }
    }

    // Get or create cart
    let cart = carts.get(sessionId) || { items: [] };

    // Check if item with same variant already in cart
    const existingIndex = cart.items.findIndex(
      (item) => item.productId === productId && item.variantId === variantId,
    );

    if (existingIndex >= 0) {
      cart.items[existingIndex].quantity += quantity;
    } else {
      cart.items.push({
        productId,
        variantId: variantId || null,
        title: product.title,
        price,
        size: size || null,
        quantity,
        image: null, // Will be populated from product images
      });
    }

    // Calculate total
    cart.total = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    carts.set(sessionId, cart);
    res.json(cart);
  } catch (error) {
    logger.error("Add to cart error", error);
    next(error);
  }
});

// Update cart item
router.put("/update", (req, res) => {
  const { productId, variantId, quantity } = req.body;
  const sessionId = req.headers["x-session-id"] || "default";

  const cart = carts.get(sessionId);
  if (!cart) {
    return res.status(404).json({ error: "Cart not found" });
  }

  const itemIndex = cart.items.findIndex(
    (item) =>
      item.productId === productId && item.variantId === (variantId || null),
  );
  if (itemIndex < 0) {
    return res.status(404).json({ error: "Item not in cart" });
  }

  if (quantity <= 0) {
    cart.items.splice(itemIndex, 1);
  } else {
    cart.items[itemIndex].quantity = quantity;
  }

  cart.total = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  carts.set(sessionId, cart);
  res.json(cart);
});

// Remove from cart
router.delete("/remove/:productId", (req, res) => {
  const { productId } = req.params;
  const { variantId } = req.query;
  const sessionId = req.headers["x-session-id"] || "default";

  const cart = carts.get(sessionId);
  if (!cart) {
    return res.status(404).json({ error: "Cart not found" });
  }

  cart.items = cart.items.filter(
    (item) =>
      item.productId !== parseInt(productId) ||
      (variantId && item.variantId !== parseInt(variantId)),
  );
  cart.total = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  carts.set(sessionId, cart);
  res.json(cart);
});

// Clear cart
router.delete("/clear", (req, res) => {
  const sessionId = req.headers["x-session-id"] || "default";
  carts.delete(sessionId);
  res.json({ items: [], total: 0 });
});

export default router;
