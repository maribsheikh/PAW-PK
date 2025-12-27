import { useQuery } from "react-query";
import api from "../../utils/api";
import { formatPrice } from "../../utils/format";

const AdminAnalytics = () => {
  const { data: analytics, isLoading } = useQuery(
    "adminAnalytics",
    async () => {
      const response = await api.get("/admin/analytics");
      return response.data;
    },
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <h3 className="text-sm text-gray-600 mb-2">Total Orders</h3>
            <p className="text-3xl font-bold">
              {analytics?.stats?.totalOrders || 0}
            </p>
          </div>
          <div className="card">
            <h3 className="text-sm text-gray-600 mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold">
              {formatPrice(analytics?.stats?.totalRevenue || 0)}
            </p>
          </div>
          <div className="card">
            <h3 className="text-sm text-gray-600 mb-2">Total Products</h3>
            <p className="text-3xl font-bold">
              {analytics?.stats?.totalProducts || 0}
            </p>
          </div>
          <div className="card">
            <h3 className="text-sm text-gray-600 mb-2">Pending Reviews</h3>
            <p className="text-3xl font-bold">
              {analytics?.stats?.pendingReviews || 0}
            </p>
          </div>
        </div>

        {/* Sales by Day */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold mb-4">
            Sales by Day (Last 30 Days)
          </h2>
          {analytics?.salesByDay && analytics.salesByDay.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Orders</th>
                    <th className="text-left p-2">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.salesByDay.map((day, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">
                        {new Date(day.date).toLocaleDateString()}
                      </td>
                      <td className="p-2">{day.order_count}</td>
                      <td className="p-2">
                        {formatPrice(parseFloat(day.total_sales || 0))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600">No sales data available</p>
          )}
        </div>

        {/* Best Sellers */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Best Sellers</h2>
          {analytics?.bestSellers && analytics.bestSellers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Product</th>
                    <th className="text-left p-2">SKU</th>
                    <th className="text-left p-2">Units Sold</th>
                    <th className="text-left p-2">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.bestSellers.map((product) => (
                    <tr key={product.id} className="border-b">
                      <td className="p-2">{product.title}</td>
                      <td className="p-2">{product.sku}</td>
                      <td className="p-2">{product.total_sold}</td>
                      <td className="p-2">
                        {formatPrice(parseFloat(product.total_revenue || 0))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600">No sales data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
