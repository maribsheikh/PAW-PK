// Get the API base URL (without /api suffix)
const getApiBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  // Remove /api suffix if present
  return apiUrl.replace(/\/api\/?$/, '');
};

/**
 * Get the full URL for an image
 * @param {string} imagePath - The image path (e.g., 'images/1(1).jpeg', 'product_123.jpg', or full URL)
 * @returns {string} Full URL to the image
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  const apiBase = getApiBaseUrl();
  
  // If it's a processed image (starts with product_), use uploads path
  if (imagePath.startsWith('product_')) {
    return `${apiBase}/uploads/${imagePath}`;
  }
  
  // If it starts with images/, use backend endpoint
  if (imagePath.startsWith('images/')) {
    return `${apiBase}/${imagePath}`;
  }
  
  // Default: assume it's in the images folder
  return `${apiBase}/images/${imagePath}`;
};

