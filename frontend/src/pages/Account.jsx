import { useQuery } from "react-query";
import api from "../utils/api";
import { formatPrice, formatDate } from "../utils/format";
import { useAuth } from "../context/AuthContext";

const Account = () => {
  const { user } = useAuth();

  const { data: orders = [], isLoading } = useQuery("userOrders", async () => {
    const response = await api.get("/orders");
    return response.data;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Profile</h2>
            <div className="space-y-2">
              <p>
                <strong>Name:</strong> {user?.name}
              </p>
              <p>
                <strong>Email:</strong> {user?.email}
              </p>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Order History</h2>

            {isLoading ? (
              <div className="text-center py-8">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                <p>No orders yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">Order #{order.id}</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          {formatPrice(order.total_amount)}
                        </p>
                        <p className="text-sm capitalize text-gray-600">
                          {order.status}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        {order.items?.length || 0} item(s)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
