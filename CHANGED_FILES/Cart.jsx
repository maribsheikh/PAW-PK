import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/format";
import api from "../utils/api";

const Cart = () => {
  const { cart, updateCartItem, removeFromCart, clearCart } = useCart();
  const [coupon, setCoupon] = useState("");
  const [shipping, setShipping] = useState(500); // Default shipping in PKR
  const navigate = useNavigate();

  const handleQuantityChange = async (
    productId,
    newQuantity,
    variantId = null,
  ) => {
    if (newQuantity <= 0) {
      await removeFromCart(productId, variantId);
    } else {
      await updateCartItem(productId, newQuantity, variantId);
    }
  };

  const handleCheckout = () => {
    if (cart.items.length === 0) {
      alert("Your cart is empty");
      return;
    }
    navigate("/checkout");
  };

  const subtotal = cart.total || 0;
  const total = subtotal + shipping;

  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">
            Add some products to get started!
          </p>
          <Link to="/products" className="btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="card">
            {cart.items.map((item) => (
              <div
                key={item.productId}
                className="flex gap-4 pb-6 mb-6 border-b last:border-0"
              >
                <div className="w-24 h-24 bg-gray-100 rounded flex-shrink-0">
                  {item.image && (
                    <img
                      src={`/uploads/${item.image}`}
                      alt={item.title}
                      className="w-full h-full object-cover rounded"
                    />
                  )}
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  {item.size && (
                    <p className="text-sm text-gray-600 mb-1">
                      Size: <span className="capitalize">{item.size}</span>
                    </p>
                  )}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-gray-400 line-through">
                      {formatPrice(item.price * 2)}
                    </span>
                    <span className="text-primary-600 font-bold">
                      {formatPrice(item.price)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.productId,
                            item.quantity - 1,
                            item.variantId,
                          )
                        }
                        className="w-8 h-8 border rounded flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="w-12 text-center">{item.quantity}</span>
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.productId,
                            item.quantity + 1,
                            item.variantId,
                          )
                        }
                        className="w-8 h-8 border rounded flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() =>
                        removeFromCart(item.productId, item.variantId)
                      }
                      className="text-accent-600 hover:text-accent-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="card sticky top-24">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{formatPrice(shipping)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Coupon Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="Enter code"
                  className="input-field flex-grow"
                />
                <button className="btn-secondary text-sm">Apply</button>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="btn-primary w-full mb-4"
            >
              Proceed to Checkout
            </button>

            <Link
              to="/products"
              className="block text-center text-primary-600 hover:text-primary-700"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
