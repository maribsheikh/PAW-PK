import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../utils/api';
import { formatPrice } from '../../utils/format';
import { getImageUrl as getImageUrlUtil } from '../../utils/images';

const AdminProducts = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    sku: '',
    description: '',
    price_pkr: '',
    category: 'dogs',
    stock: '',
    is_active: true
  });
  const [images, setImages] = useState([]);
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery(
    'adminProducts',
    async () => {
      const response = await api.get('/admin/products');
      return response.data;
    }
  );

  const deleteMutation = useMutation(
    (id) => api.delete(`/admin/products/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminProducts');
        alert('Product deleted');
      }
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, value);
    });

    images.forEach((file) => {
      formDataToSend.append('images', file);
    });

    try {
      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct.id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/admin/products', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      queryClient.invalidateQueries('adminProducts');
      setShowForm(false);
      setEditingProduct(null);
      setFormData({
        title: '',
        sku: '',
        description: '',
        price_pkr: '',
        category: 'dogs',
        stock: '',
        is_active: true
      });
      setImages([]);
      alert(editingProduct ? 'Product updated' : 'Product created');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      sku: product.sku,
      description: product.description || '',
      price_pkr: product.price_pkr,
      category: product.category,
      stock: product.stock,
      is_active: product.is_active
    });
    setShowForm(true);
  };

  const getImageUrl = (images) => {
    if (!images || images.length === 0) return null;
    const thumbnail = images.find(img => img.size === 'thumbnail');
    const imagePath = thumbnail?.url || images[0]?.url;
    return imagePath ? getImageUrlUtil(imagePath) : null;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Manage Products</h1>
            <button
              onClick={() => {
                setShowForm(true);
                setEditingProduct(null);
                setFormData({
                  title: '',
                  sku: '',
                  description: '',
                  price_pkr: '',
                  category: 'dogs',
                  stock: '',
                  is_active: true
                });
                setImages([]);
              }}
              className="btn-primary"
            >
              Add Product
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {showForm && (
          <div className="card mb-8">
            <h2 className="text-xl font-bold mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">SKU *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="4"
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Price (PKR) *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.price_pkr}
                    onChange={(e) => setFormData({ ...formData, price_pkr: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-field"
                  >
                    <option value="dogs">Dogs</option>
                    <option value="cats">Cats</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Stock *</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="mr-2"
                  />
                  Active
                </label>
              </div>
              {!editingProduct && (
                <div>
                  <label className="block text-sm font-medium mb-2">Images *</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setImages(Array.from(e.target.files))}
                    className="input-field"
                    required={!editingProduct}
                  />
                </div>
              )}
              {editingProduct && (
                <div>
                  <label className="block text-sm font-medium mb-2">Additional Images</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setImages(Array.from(e.target.files))}
                    className="input-field"
                  />
                </div>
              )}
              <div className="flex gap-4">
                <button type="submit" className="btn-primary">
                  {editingProduct ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingProduct(null);
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">Loading products...</div>
        ) : (
          <div className="card">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Image</th>
                  <th className="text-left p-2">Title</th>
                  <th className="text-left p-2">SKU</th>
                  <th className="text-left p-2">Category</th>
                  <th className="text-left p-2">Price</th>
                  <th className="text-left p-2">Stock</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const imageUrl = getImageUrl(product.images);
                  return (
                    <tr key={product.id} className="border-b">
                      <td className="p-2">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={product.title}
                            className="w-16 h-16 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded"></div>
                        )}
                      </td>
                      <td className="p-2">{product.title}</td>
                      <td className="p-2">{product.sku}</td>
                      <td className="p-2 capitalize">{product.category}</td>
                      <td className="p-2">{formatPrice(product.price_pkr)}</td>
                      <td className="p-2">{product.stock}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-sm ${
                          product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-primary-600 hover:text-primary-700 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this product?')) {
                                deleteMutation.mutate(product.id);
                              }
                            }}
                            className="text-accent-600 hover:text-accent-700 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;

