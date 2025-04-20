import { useState } from 'react';
import axios from 'axios';

const AddMedicineModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    productName: '',
    genericName: '',
    brandName: '',
    manufacturer: '',
    description: '',
    category: 'OTC',
    prescriptionRequired: false,
    composition: { activeIngredients: [], inactiveIngredients: [] },
    dosage: { form: '', strength: '', recommendedDosage: '' },
    pricing: { mrp: 0, discount: 0, sellingPrice: 0 },
    stock: { available: true, quantity: 0, minOrderQuantity: 1, maxOrderQuantity: 10 },
    packaging: { packSize: '', expiryDate: '', storageInstructions: '' },
    regulatory: { drugType: '', sideEffects: [], warnings: [] },
    additionalFeatures: { doctorAdvice: '' }
  });
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleImageUpload = (e) => {
    setImages([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      images.forEach(image => {
        formDataToSend.append('images', image);
      });
      
      Object.keys(formData).forEach(key => {
        if (typeof formData[key] === 'object') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await axios.post('/api/medicines', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      onAdd(response.data.medicine);
      onClose();
    } catch (error) {
      console.error('Error adding medicine:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Add New Medicine</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Basic Information</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name*</label>
                  <input
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                {/* Add other basic fields similarly */}
              </div>

              {/* Pricing & Stock */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Pricing & Stock</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">MRP*</label>
                  <input
                    type="number"
                    value={formData.pricing.mrp}
                    onChange={(e) => handleNestedChange('pricing', 'mrp', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                {/* Add other pricing/stock fields similarly */}
              </div>

              {/* Images */}
              <div className="col-span-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
                <input
                  type="file"
                  multiple
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
              >
                {isSubmitting ? 'Adding...' : 'Add Medicine'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMedicineModal;