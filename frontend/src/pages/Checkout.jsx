import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/format";
import api from "../utils/api";

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [cardInfo, setCardInfo] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // For card payments, validate card info
      if (paymentMethod === "stripe" || paymentMethod === "card") {
        if (
          !cardInfo.cardNumber ||
          !cardInfo.expiryDate ||
          !cardInfo.cvv ||
          !cardInfo.cardholderName
        ) {
          alert("Please fill in all card details");
          setLoading(false);
          return;
        }
        // Basic card validation
        const cardNumber = cardInfo.cardNumber.replace(/\s/g, "");
        if (
          cardNumber.length < 13 ||
          cardNumber.length > 19 ||
          !/^\d+$/.test(cardNumber)
        ) {
          alert("Please enter a valid card number");
          setLoading(false);
          return;
        }
        if (!/^\d{2}\/\d{2}$/.test(cardInfo.expiryDate)) {
          alert("Please enter expiry date in MM/YY format");
          setLoading(false);
          return;
        }
        if (!/^\d{3,4}$/.test(cardInfo.cvv)) {
          alert("Please enter a valid CVV");
          setLoading(false);
          return;
        }
      }

      const response = await api.post("/orders", {
        shippingAddress,
        paymentMethod,
        items: cart.items,
        cardInfo:
          paymentMethod === "stripe" || paymentMethod === "card"
            ? cardInfo
            : null,
      });

      await clearCart();
      navigate(`/order-confirmation/${response.data.id}`);
    } catch (error) {
      alert(error.response?.data?.error || "Failed to place order");
      setLoading(false);
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\D/g, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  const subtotal = cart.total || 0;
  const shipping = 500;
  const total = subtotal + shipping;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.name}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        name: e.target.value,
                      })
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={shippingAddress.phone}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        phone: e.target.value,
                      })
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Address *
                  </label>
                  <textarea
                    required
                    value={shippingAddress.address}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        address: e.target.value,
                      })
                    }
                    rows="3"
                    className="input-field"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.city}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          city: e.target.value,
                        })
                      }
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.postalCode}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          postalCode: e.target.value,
                        })
                      }
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-center p-4 border rounded cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-semibold">Cash on Delivery</div>
                    <div className="text-sm text-gray-600">
                      Pay when you receive
                    </div>
                  </div>
                </label>
                <label className="flex items-center p-4 border rounded cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="jazzcash"
                    checked={paymentMethod === "jazzcash"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-semibold">JazzCash</div>
                    <div className="text-sm text-gray-600">
                      Mobile wallet payment
                    </div>
                  </div>
                </label>
                <label className="flex items-center p-4 border rounded cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="easypaisa"
                    checked={paymentMethod === "easypaisa"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-semibold">Easypaisa</div>
                    <div className="text-sm text-gray-600">
                      Mobile wallet payment
                    </div>
                  </div>
                </label>
                <label className="flex items-center p-4 border rounded cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-semibold">Credit/Debit Card</div>
                    <div className="text-sm text-gray-600">
                      Secure card payment
                    </div>
                  </div>
                </label>
              </div>

              {/* Card Details Form */}
              {(paymentMethod === "card" || paymentMethod === "stripe") && (
                <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                  <h3 className="font-semibold mb-4">Card Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Cardholder Name *
                      </label>
                      <input
                        type="text"
                        required={
                          paymentMethod === "card" || paymentMethod === "stripe"
                        }
                        value={cardInfo.cardholderName}
                        onChange={(e) =>
                          setCardInfo({
                            ...cardInfo,
                            cardholderName: e.target.value,
                          })
                        }
                        className="input-field"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Card Number *
                      </label>
                      <input
                        type="text"
                        required={
                          paymentMethod === "card" || paymentMethod === "stripe"
                        }
                        value={cardInfo.cardNumber}
                        onChange={(e) =>
                          setCardInfo({
                            ...cardInfo,
                            cardNumber: formatCardNumber(e.target.value),
                          })
                        }
                        className="input-field"
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Expiry Date *
                        </label>
                        <input
                          type="text"
                          required={
                            paymentMethod === "card" ||
                            paymentMethod === "stripe"
                          }
                          value={cardInfo.expiryDate}
                          onChange={(e) =>
                            setCardInfo({
                              ...cardInfo,
                              expiryDate: formatExpiryDate(e.target.value),
                            })
                          }
                          className="input-field"
                          placeholder="MM/YY"
                          maxLength="5"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          CVV *
                        </label>
                        <input
                          type="text"
                          required={
                            paymentMethod === "card" ||
                            paymentMethod === "stripe"
                          }
                          value={cardInfo.cvv}
                          onChange={(e) =>
                            setCardInfo({
                              ...cardInfo,
                              cvv: e.target.value
                                .replace(/\D/g, "")
                                .substring(0, 4),
                            })
                          }
                          className="input-field"
                          placeholder="123"
                          maxLength="4"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="card sticky top-24">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              <div className="space-y-2 mb-4">
                {cart.items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex justify-between text-sm"
                  >
                    <span>
                      {item.title} x {item.quantity}
                    </span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-2 space-y-2">
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

              <button
                type="submit"
                disabled={loading || cart.items.length === 0}
                className="btn-primary w-full mt-6 disabled:opacity-50"
              >
                {loading ? "Placing Order..." : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
