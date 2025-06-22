import { useState } from 'react';
import API from '../services/api';

const EditMedicineModal = ({ medicine, onClose, onUpdate }) => {
  const [formData, setFormData] = useState(medicine);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const response = await API.put(`/medicines/${medicine._id}`, formData);
      onUpdate(response.data.medicine);
    } catch (err) {
      console.error('Error updating medicine:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Edit Medicine</h2>

        <input
          name="productName"
          value={formData.productName}
          onChange={handleChange}
          className="border rounded w-full px-3 py-2 mb-4"
          placeholder="Product Name"
        />

        <input
          name="brandName"
          value={formData.brandName}
          onChange={handleChange}
          className="border rounded w-full px-3 py-2 mb-4"
          placeholder="Brand Name"
        />

        {/* Pricing Fields */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Pricing</label>
          <input
            name="pricing.mrp"
            type="number"
            value={formData.pricing?.mrp || ''}
            onChange={e => setFormData(prev => ({
              ...prev,
              pricing: { ...prev.pricing, mrp: e.target.value }
            }))}
            className="border rounded w-full px-3 py-2 mb-2"
            placeholder="MRP"
          />
          <input
            name="pricing.discount"
            type="number"
            value={formData.pricing?.discount || ''}
            onChange={e => setFormData(prev => ({
              ...prev,
              pricing: { ...prev.pricing, discount: e.target.value }
            }))}
            className="border rounded w-full px-3 py-2 mb-2"
            placeholder="Discount (%)"
          />
          <input
            name="pricing.sellingPrice"
            type="number"
            value={formData.pricing?.sellingPrice || ''}
            onChange={e => setFormData(prev => ({
              ...prev,
              pricing: { ...prev.pricing, sellingPrice: e.target.value }
            }))}
            className="border rounded w-full px-3 py-2"
            placeholder="Selling Price"
          />
        </div>

        {/* Stock Fields */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Stock</label>
          <input
            name="stock.quantity"
            type="number"
            value={formData.stock?.quantity || ''}
            onChange={e => setFormData(prev => ({
              ...prev,
              stock: { ...prev.stock, quantity: e.target.value }
            }))}
            className="border rounded w-full px-3 py-2 mb-2"
            placeholder="Stock Quantity"
          />
          <input
            name="stock.minOrderQuantity"
            type="number"
            value={formData.stock?.minOrderQuantity || ''}
            onChange={e => setFormData(prev => ({
              ...prev,
              stock: { ...prev.stock, minOrderQuantity: e.target.value }
            }))}
            className="border rounded w-full px-3 py-2 mb-2"
            placeholder="Min Order Quantity"
          />
          <input
            name="stock.maxOrderQuantity"
            type="number"
            value={formData.stock?.maxOrderQuantity || ''}
            onChange={e => setFormData(prev => ({
              ...prev,
              stock: { ...prev.stock, maxOrderQuantity: e.target.value }
            }))}
            className="border rounded w-full px-3 py-2"
            placeholder="Max Order Quantity"
          />
        </div>

        {/* In Stock Switch */}
        <div className="mb-4 flex items-center gap-2">
          <label className="font-semibold">In Stock:</label>
          <input
            type="checkbox"
            checked={!!formData.stock?.available}
            onChange={e => setFormData(prev => ({
              ...prev,
              stock: { ...prev.stock, available: e.target.checked }
            }))}
          />
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="bg-gray-400 text-white px-4 py-2 rounded">
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditMedicineModal;
