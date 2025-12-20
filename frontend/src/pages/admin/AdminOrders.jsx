import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../utils/api';
import { formatPrice, formatDate } from '../../utils/format';

const AdminOrders = () => {
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery(
    'adminOrders',
    async () => {
      const response = await api.get('/admin/orders');
      return response.data;
    }
  );

  const updateStatusMutation = useMutation(
    ({ id, status, payment_status }) => api.patch(`/admin/orders/${id}`, { status, payment_status }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminOrders');
        alert('Order updated');
      }
    }
  );

  const handleStatusChange = (orderId, status, paymentStatus) => {
    updateStatusMutation.mutate({ id: orderId, status, payment_status: paymentStatus });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Manage Orders</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-12">Loading orders...</div>
        ) : (
          <div className="card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Order ID</th>
                    <th className="text-left p-2">Customer</th>
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Total</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Payment</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b">
                      <td className="p-2">#{order.id}</td>
                      <td className="p-2">
                        <div>
                          <div>{order.user_name}</div>
                          <div className="text-sm text-gray-600">{order.user_email}</div>
                        </div>
                      </td>
                      <td className="p-2">{formatDate(order.created_at)}</td>
                      <td className="p-2">{formatPrice(order.total_amount)}</td>
                      <td className="p-2">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value, order.payment_status)}
                          className="border rounded px-2 py-1 text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <select
                          value={order.payment_status}
                          onChange={(e) => handleStatusChange(order.id, order.status, e.target.value)}
                          className="border rounded px-2 py-1 text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="failed">Failed</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <div className="text-sm">
                          <div className="text-gray-600">
                            {order.items?.length || 0} item(s)
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;

