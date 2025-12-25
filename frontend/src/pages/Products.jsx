import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import api from '../utils/api';
import { formatPrice } from '../utils/format';
import { getImageUrl as getImageUrlUtil } from '../utils/images';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'created_at'
  });

  // Update filters when URL params change
  useEffect(() => {
    setFilters({
      q: searchParams.get('q') || '',
      category: searchParams.get('category') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      sort: searchParams.get('sort') || 'created_at'
    });
  }, [searchParams]);

  const { data: products = [], isLoading, error } = useQuery(
    ['products', filters],
    async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const response = await api.get(`/products?${params}`);
      return response.data;
    },
    {
      retry: 2,
      refetchOnWindowFocus: false
    }
  );

  // Log for debugging
  useEffect(() => {
    if (error) {
      console.error('Products API Error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
    }
    if (products) {
      console.log('Products loaded:', products.length);
    }
  }, [products, error]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update URL
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    setSearchParams(params);
  };

  const getImageUrl = (images, productId) => {
    // Try to get image from product images first
    if (images && images.length > 0) {
      const medium = images.find(img => img.size === 'medium');
      const small = images.find(img => img.size === 'small');
      const img = medium || small || images[0];
      if (img?.url) {
        return getImageUrlUtil(img.url);
      }
    }
    // Fallback to public folder based on product ID
    return getImageUrlUtil(`${productId}(1).jpeg`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="w-full">
        {/* Products Grid */}
        <main className="flex-grow">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Products</h1>
            <p className="text-gray-600">{products.length} products found</p>
          </div>

          {error ? (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Products</h3>
                <p className="text-red-600 mb-4">
                  {error.response?.data?.error || error.message || 'Failed to load products'}
                </p>
                {error.response?.status === 0 && (
                  <p className="text-sm text-red-500 mb-2">
                    Network error: Unable to reach the API server. Please check:
                  </p>
                )}
                {error.response?.status === 404 && (
                  <p className="text-sm text-red-500 mb-2">
                    API endpoint not found. Please verify the backend is running.
                  </p>
                )}
                {error.code === 'ERR_NETWORK' && (
                  <div className="text-sm text-red-500 text-left">
                    <p className="mb-2">Possible issues:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Backend server is not running at api.thepawinternational.com</li>
                      <li>CORS configuration issue - backend needs to allow your frontend domain</li>
                      <li>Network connectivity problem</li>
                    </ul>
                    <p className="mt-4">
                      Check browser console (F12) for more details.
                    </p>
                  </div>
                )}
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 btn-primary"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : isLoading ? (
            <div className="text-center py-12">
              <div className="text-lg">Loading products...</div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600">No products found</p>
              <p className="text-sm text-gray-500 mt-2">
                The API returned an empty list. Check if the database has products.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="card hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={getImageUrl(product.images, product.id)}
                      alt={product.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400';
                      }}
                    />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{product.title}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-gray-400 line-through text-lg">{formatPrice(product.price_pkr * 2)}</span>
                    <span className="text-primary-600 font-bold text-xl">{formatPrice(product.price_pkr)}</span>
                  </div>
                  {product.averageRating > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>⭐ {product.averageRating}</span>
                      <span>({product.reviewCount} reviews)</span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Products;

