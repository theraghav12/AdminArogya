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

        {/* Add other fields similarly */}

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
