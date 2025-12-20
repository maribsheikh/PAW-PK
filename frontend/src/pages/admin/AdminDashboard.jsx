import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <Link to="/" className="text-primary-600 hover:text-primary-700">
              Back to Store
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link to="/admin/products" className="card hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-2">Products</h3>
            <p className="text-gray-600">Manage product listings</p>
          </Link>
          <Link to="/admin/orders" className="card hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-2">Orders</h3>
            <p className="text-gray-600">View and manage orders</p>
          </Link>
          <Link to="/admin/reviews" className="card hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-2">Reviews</h3>
            <p className="text-gray-600">Moderate customer reviews</p>
          </Link>
          <Link to="/admin/analytics" className="card hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-2">Analytics</h3>
            <p className="text-gray-600">View sales and statistics</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

