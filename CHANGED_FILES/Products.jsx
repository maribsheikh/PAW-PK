import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "react-query";
import api from "../utils/api";
import { formatPrice } from "../utils/format";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    q: searchParams.get("q") || "",
    category: searchParams.get("category") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    sort: searchParams.get("sort") || "created_at",
  });

  // Update filters when URL params change
  useEffect(() => {
    setFilters({
      q: searchParams.get("q") || "",
      category: searchParams.get("category") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      sort: searchParams.get("sort") || "created_at",
    });
  }, [searchParams]);

  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery(
    ["products", filters],
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
      refetchOnWindowFocus: false,
    },
  );

  // Log for debugging
  useEffect(() => {
    if (error) {
      console.error("Products API Error:", error);
    }
    if (products) {
      console.log("Products loaded:", products.length);
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
      const medium = images.find((img) => img.size === "medium");
      const small = images.find((img) => img.size === "small");
      const img = medium || small || images[0];
      if (img?.url) {
        // If it's a processed image, use uploads path
        if (img.url.startsWith("product_")) {
          return `/uploads/${img.url}`;
        }
        // If it starts with images/, use backend endpoint
        if (img.url.startsWith("images/")) {
          return `/${img.url}`;
        }
        return img.url;
      }
    }
    // Fallback to public folder based on product ID
    return `/images/${productId}(1).jpeg`;
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

          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-lg">Loading products...</div>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">
              <div>Error loading products: {error.message}</div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-600">No products found</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="group"
                >
                  <div className="card hover:shadow-lg transition-shadow">
                    <div className="relative bg-gray-100 rounded-lg overflow-hidden h-48 mb-4">
                      <img
                        src={getImageUrl(product.images, product.id)}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                      {product.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-primary-600">
                        {formatPrice(product.price_pkr)}
                      </span>
                      {product.original_price &&
                        product.original_price > product.price_pkr && (
                          <span className="text-sm text-gray-400 line-through">
                            {formatPrice(product.original_price)}
                          </span>
                        )}
                    </div>
                  </div>
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
