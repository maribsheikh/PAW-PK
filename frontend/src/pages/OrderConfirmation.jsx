import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import api from '../utils/api';
import { formatPrice, formatDate } from '../utils/format';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${orderId}`);
        setOrder(response.data);
      } catch (error) {
        console.error('Failed to fetch order:', error);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">Thank you for your purchase</p>
        </div>

        <div className="card text-left mb-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-2">Order Details</h2>
            <p><strong>Order ID:</strong> #{order.id}</p>
            <p><strong>Date:</strong> {formatDate(order.created_at)}</p>
            <p><strong>Status:</strong> <span className="capitalize">{order.status}</span></p>
            <p><strong>Payment Method:</strong> <span className="capitalize">{order.payment_method}</span></p>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Shipping Address</h3>
            <p className="text-gray-700">
              {typeof order.shipping_address === 'object' ? (
                <>
                  {order.shipping_address.name}<br />
                  {order.shipping_address.address}<br />
                  {order.shipping_address.city}
                  {order.shipping_address.postalCode && `, ${order.shipping_address.postalCode}`}
                  <br />
                  Phone: {order.shipping_address.phone}
                </>
              ) : (
                order.shipping_address
              )}
            </p>
          </div>

          <div className="border-t pt-4 mt-4">
            <h3 className="font-semibold mb-2">Order Items</h3>
            {order.items && order.items.map((item) => (
              <div key={item.id} className="flex justify-between mb-2">
                <span>{item.title || `Product ${item.product_id}`} x {item.quantity}</span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2 flex justify-between font-bold">
              <span>Total</span>
              <span>{formatPrice(order.total_amount)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Link to="/account" className="btn-primary inline-block">
            View Order History
          </Link>
          <br />
          <Link to="/products" className="text-primary-600 hover:text-primary-700">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;

