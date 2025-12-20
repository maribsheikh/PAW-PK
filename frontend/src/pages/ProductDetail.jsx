import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import api from '../utils/api';
import { formatPrice } from '../utils/format';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ImageGallery from '../components/ImageGallery';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

  const { data: product, isLoading, refetch } = useQuery(
    ['product', id],
    async () => {
      const response = await api.get(`/products/${id}`);
      return response.data;
    }
  );

  // Get images to display based on selected color
  const getDisplayImages = () => {
    if (!product) return [];
    
    if (selectedColor && product.imageColors && product.imageColors[selectedColor]) {
      // Return images for selected color
      return product.imageColors[selectedColor].map(img => img.url);
    }
    
    // Return base images or all images
    if (product.baseImages && product.baseImages.length > 0) {
      return product.baseImages;
    }
    
    // Fallback to all images
    return product.images || [];
  };

  useEffect(() => {
    // Set default variant when product loads
    if (product && product.variants && product.variants.length > 0 && !selectedVariant) {
      setSelectedVariant(product.variants[0]);
    }
    
    // Reset color selection when product changes
    if (product && product.imageColors) {
      const colors = Object.keys(product.imageColors);
      if (colors.length > 0 && !selectedColor) {
        // Don't auto-select color, let user choose
        setSelectedColor(null);
      }
    }
  }, [product, selectedVariant, selectedColor]);

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      alert('Please select a size');
      return;
    }
    
    try {
      await addToCart(product.id, quantity, selectedVariant.id);
      alert('Product added to cart!');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add product to cart');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await api.post('/reviews', {
        productId: product.id,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });
      alert('Review submitted! It will be visible after approval.');
      setReviewForm({ rating: 5, comment: '' });
      refetch();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to submit review');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Product not found</div>
      </div>
    );
  }

  const displayImages = getDisplayImages();
  const availableColors = product.imageColors ? Object.keys(product.imageColors) : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Images */}
        <div>
          <ImageGallery 
            images={displayImages} 
            productId={product.id}
            selectedColor={selectedColor}
          />
          
          {/* Color Selection */}
          {availableColors.length > 0 && (
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Select Color</label>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => setSelectedColor(null)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    selectedColor === null
                      ? 'border-primary-600 bg-primary-50 text-primary-700 font-semibold'
                      : 'border-gray-300 hover:border-primary-300'
                  }`}
                >
                  Default
                </button>
                {availableColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all capitalize ${
                      selectedColor === color
                        ? 'border-primary-600 bg-primary-50 text-primary-700 font-semibold'
                        : 'border-gray-300 hover:border-primary-300'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
          {selectedVariant ? (
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl text-gray-400 line-through">{formatPrice(selectedVariant.price_pkr * 2)}</span>
              <span className="text-2xl font-bold text-primary-600">{formatPrice(selectedVariant.price_pkr)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl text-gray-400 line-through">{formatPrice(product.price_pkr * 2)}</span>
              <span className="text-2xl font-bold text-primary-600">{formatPrice(product.price_pkr)}</span>
            </div>
          )}
          
          <div className="mb-4">
            <span className="text-sm text-gray-600">SKU: {product.sku}</span>
          </div>

          {product.averageRating > 0 && (
            <div className="mb-4 flex items-center gap-2">
              <span className="text-lg">⭐ {product.averageRating}</span>
              <span className="text-gray-600">({product.reviewCount} reviews)</span>
            </div>
          )}

          <div className="mb-6">
            <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
          </div>

          {product.variants && product.variants.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Select Size</label>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      selectedVariant?.id === variant.id
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-300 hover:border-primary-300'
                    }`}
                  >
                    <div className="font-semibold capitalize mb-1">{variant.size}</div>
                    <div className="text-sm text-gray-600 mb-1">{variant.dimensions}</div>
                    {variant.product_code && (
                      <div className="text-xs text-primary-600 font-mono mb-1">Code: {variant.product_code}</div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-lg text-gray-400 line-through">{formatPrice(variant.price_pkr * 2)}</span>
                      <span className="font-bold text-primary-600 text-lg">{formatPrice(variant.price_pkr)}</span>
                    </div>
                    <div className="text-xs text-primary-600 font-semibold mt-1">
                      {variant.stock > 0 ? `${variant.stock} in stock` : ''}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Quantity</label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 border-2 border-gray-300 rounded flex items-center justify-center hover:bg-gray-100 bg-white font-bold text-gray-700"
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max={selectedVariant?.stock || product.stock}
                className="w-20 text-center border-2 border-gray-300 rounded bg-white text-gray-900 font-semibold focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              />
              <button
                onClick={() => setQuantity(Math.min(selectedVariant?.stock || product.stock, quantity + 1))}
                className="w-10 h-10 border-2 border-gray-300 rounded flex items-center justify-center hover:bg-gray-100 bg-white font-bold text-gray-700"
              >
                +
              </button>
            </div>
            {selectedVariant && (
              <p className="text-sm text-gray-600 mt-2">
                {selectedVariant.stock > 0 ? `${selectedVariant.stock} in stock` : 'Out of stock'}
              </p>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!selectedVariant || (selectedVariant && selectedVariant.stock === 0)}
            className="btn-primary w-full mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!selectedVariant ? 'Select Size' : 'Add to Cart'}
          </button>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Reviews</h2>
        
        {product.reviews && product.reviews.length > 0 ? (
          <div className="space-y-4 mb-8">
            {product.reviews.map((review) => (
              <div key={review.id} className="card">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold">{review.user_name}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                        ⭐
                      </span>
                    ))}
                  </div>
                </div>
                {review.comment && <p className="text-gray-700">{review.comment}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 mb-8">No reviews yet. Be the first to review!</p>
        )}

        {/* Review Form */}
        {user && (
          <div className="card">
            <h3 className="text-xl font-semibold mb-4">Write a Review</h3>
            <form onSubmit={handleSubmitReview}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Rating</label>
                <select
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}
                  className="input-field"
                >
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Very Good</option>
                  <option value="3">3 - Good</option>
                  <option value="2">2 - Fair</option>
                  <option value="1">1 - Poor</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Comment</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  rows="4"
                  className="input-field"
                  placeholder="Share your experience..."
                />
              </div>
              <button type="submit" className="btn-primary">
                Submit Review
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
