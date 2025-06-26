import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import API from '../services/api';

const tabs = [
  { id: 'basic', name: 'Basic Information' },
  { id: 'pricing', name: 'Pricing' },
  { id: 'stock', name: 'Stock' },
  { id: 'composition', name: 'Composition' },
  { id: 'dosage', name: 'Dosage' },
  { id: 'packaging', name: 'Packaging' },
  { id: 'regulatory', name: 'Regulatory' },
  { id: 'additional', name: 'Additional' },
  { id: 'media', name: 'Media' }
];

const EditMedicineModal = ({ isOpen, onClose, medicine, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('basic');
  
  // Form state
  const [formData, setFormData] = useState({
    productName: '',
    genericName: '',
    brandName: '',
    manufacturer: '',
    description: '',
    category: 'OTC',
    prescriptionRequired: false,
    images: [],
    composition: { 
      activeIngredients: [], 
      inactiveIngredients: [] 
    },
    dosage: { 
      form: '', 
      strength: '', 
      recommendedDosage: '' 
    },
    pricing: { 
      mrp: 0, 
      discount: 0, 
      sellingPrice: 0 
    },
    stock: { 
      available: true, 
      quantity: 0, 
      minOrderQuantity: 1, 
      maxOrderQuantity: 10 
    },
    packaging: { 
      packSize: '', 
      expiryDate: '', 
      storageInstructions: '' 
    },
    regulatory: { 
      drugType: '', 
      sideEffects: [], 
      warnings: [], 
      contraindications: [], 
      interactions: [] 
    },
    additionalFeatures: { 
      alternativeMedicines: [],
      userReviews: [],
      faqs: [],
      doctorAdvice: '' 
    },
    ...medicine // Spread existing medicine data to override defaults
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Form handlers
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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

  const handleArrayChange = (parent, field, index, value) => {
    const updatedArray = [...formData[parent][field]];
    updatedArray[index] = value;
    
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: updatedArray
      }
    }));
  };

  const handleAddToArray = (parent, field, value) => {
    if (!value) return;
    
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: [...prev[parent][field], value]
      }
    }));
    
    return ''; // Reset the input
  };

  const handleRemoveFromArray = (parent, field, index) => {
    const updatedArray = formData[parent][field].filter((_, i) => i !== index);
    
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: updatedArray
      }
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          images: 'Only JPG, PNG, or WEBP images are allowed'
        }));
        return false;
      }
      
      if (file.size > maxSize) {
        setErrors(prev => ({
          ...prev,
          images: 'Image size must be less than 5MB'
        }));
        return false;
      }
      
      return true;
    });

    if (validFiles.length === 0) return;

    // Create previews
    const previews = validFiles.map(file => ({
      id: URL.createObjectURL(file),
      name: file.name,
      file
    }));

    setImagePreviews(prev => [...prev, ...previews]);
    setImageFiles(prev => [...prev, ...validFiles]);
    setErrors(prev => ({ ...prev, images: undefined }));
  };

  const removeImage = (index) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted');
    
    // Validate required fields
    const newErrors = {};
    
    // Basic validations
    if (!formData.productName?.trim()) {
      newErrors.productName = 'Product name is required';
    }
    
    if (!formData.packaging?.packSize?.trim()) {
      newErrors.packSize = 'Pack size is required';
    }
    
    // Check if we have any validation errors
    const hasErrors = Object.keys(newErrors).length > 0;
    
    if (hasErrors) {
      console.log('Validation errors:', newErrors);
      // Show first error to user
      const firstError = newErrors[Object.keys(newErrors)[0]];
      alert(`Validation Error: ${firstError}`);
      // Update errors state
      setErrors(prev => ({
        ...prev,
        ...newErrors
      }));
      return;
    }

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();

      // Add new image files
      imageFiles.forEach(file => {
        formDataToSend.append('images', file);
      });

      // Prepare and validate data
      const dataToSend = {
        ...formData,
        // Handle nested objects if needed
        packaging: {
          ...formData.packaging,
          expiryDate: formData.packaging?.expiryDate 
            ? new Date(formData.packaging.expiryDate).toISOString() 
            : ''
        },
        // Keep existing images that weren't removed
        images: formData.images.map(img => ({
          url: typeof img === 'string' ? img : img.url,
          public_id: img.public_id || img.url?.split('/').pop().split('.')[0]
        }))
      };

      // Add all other fields
      Object.keys(dataToSend).forEach(key => {
        formDataToSend.append(
          key, 
          typeof dataToSend[key] === 'object' 
            ? JSON.stringify(dataToSend[key]) 
            : dataToSend[key]
        );
      });

      console.log('Sending request to:', `/medicines/${formData._id}`);
      console.log('Request data:', formDataToSend);
      
      const response = await API.put(`/medicines/${formData._id}`, formDataToSend, {
        headers: { 
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`Upload progress: ${percentCompleted}%`);
        }
      });

      console.log('Update successful:', response.data);
      if (onUpdate) {
        await onUpdate(); // Wait for parent to update
      }
      onClose(); // Close the modal after successful update
    } catch (error) {
      console.error('Error updating medicine:', error);
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Error updating medicine. Please try again.';
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      setErrors(prev => ({
        ...prev,
        submit: errorMessage
      }));
      // Show error to user
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-6 flex-shrink-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Edit Medicine</h2>
            <button 
              type="button"
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700"
              disabled={loading}
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="border-b border-gray-200">
            <nav className="flex space-x-4 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Display form errors */}
            {(error || errors.submit) && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error || errors.submit}</p>
                    {Object.entries(errors).map(([field, message]) => (
                      field !== 'submit' && (
                        <p key={field} className="text-sm text-red-700 mt-1">
                          {field}: {message}
                        </p>
                      )
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={formData.productName}
                      onChange={(e) => handleChange('productName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Generic Name
                    </label>
                    <input
                      type="text"
                      value={formData.genericName}
                      onChange={(e) => handleChange('genericName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand Name
                    </label>
                    <input
                      type="text"
                      value={formData.brandName}
                      onChange={(e) => handleChange('brandName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Manufacturer
                    </label>
                    <input
                      type="text"
                      value={formData.manufacturer}
                      onChange={(e) => handleChange('manufacturer', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="OTC">Over the Counter</option>
                      <option value="Prescription">Prescription</option>
                      <option value="Ayurvedic">Ayurvedic</option>
                      <option value="Homeopathic">Homeopathic</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <div className="flex items-center h-10">
                      <input
                        id="prescription-required"
                        type="checkbox"
                        checked={formData.prescriptionRequired}
                        onChange={(e) => handleChange('prescriptionRequired', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="prescription-required" className="ml-2 block text-sm text-gray-700">
                        Prescription Required
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'pricing' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      MRP (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.pricing.mrp}
                      onChange={(e) => handleNestedChange('pricing', 'mrp', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.pricing.discount}
                      onChange={(e) => handleNestedChange('pricing', 'discount', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Selling Price (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.pricing.sellingPrice}
                      onChange={(e) => handleNestedChange('pricing', 'sellingPrice', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'stock' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="flex items-center">
                    <input
                      id="in-stock"
                      type="checkbox"
                      checked={formData.stock.available}
                      onChange={(e) => handleNestedChange('stock', 'available', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="in-stock" className="ml-2 block text-sm text-gray-700">
                      In Stock
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.stock.quantity}
                      onChange={(e) => handleNestedChange('stock', 'quantity', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Order Qty
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.stock.minOrderQuantity}
                      onChange={(e) => handleNestedChange('stock', 'minOrderQuantity', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Order Qty
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.stock.maxOrderQuantity}
                      onChange={(e) => handleNestedChange('stock', 'maxOrderQuantity', parseInt(e.target.value) || 10)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'composition' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Active Ingredients</h3>
                    <div className="space-y-2">
                      {formData.composition.activeIngredients.map((ingredient, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={ingredient}
                            onChange={(e) => {
                              const updated = [...formData.composition.activeIngredients];
                              updated[index] = e.target.value;
                              handleNestedChange('composition', 'activeIngredients', updated);
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = formData.composition.activeIngredients.filter((_, i) => i !== index);
                              handleNestedChange('composition', 'activeIngredients', updated);
                            }}
                            className="px-3 py-2 text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...formData.composition.activeIngredients, ''];
                          handleNestedChange('composition', 'activeIngredients', updated);
                        }}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                      >
                        + Add Active Ingredient
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Inactive Ingredients</h3>
                    <div className="space-y-2">
                      {formData.composition.inactiveIngredients.map((ingredient, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={ingredient}
                            onChange={(e) => {
                              const updated = [...formData.composition.inactiveIngredients];
                              updated[index] = e.target.value;
                              handleNestedChange('composition', 'inactiveIngredients', updated);
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = formData.composition.inactiveIngredients.filter((_, i) => i !== index);
                              handleNestedChange('composition', 'inactiveIngredients', updated);
                            }}
                            className="px-3 py-2 text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...formData.composition.inactiveIngredients, ''];
                          handleNestedChange('composition', 'inactiveIngredients', updated);
                        }}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                      >
                        + Add Inactive Ingredient
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'dosage' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Form
                    </label>
                    <input
                      type="text"
                      value={formData.dosage.form}
                      onChange={(e) => handleNestedChange('dosage', 'form', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Tablet, Syrup, Injection"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Strength
                    </label>
                    <input
                      type="text"
                      value={formData.dosage.strength}
                      onChange={(e) => handleNestedChange('dosage', 'strength', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 500mg, 10mg/5ml"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Recommended Dosage
                    </label>
                    <textarea
                      value={formData.dosage.recommendedDosage}
                      onChange={(e) => handleNestedChange('dosage', 'recommendedDosage', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter recommended dosage instructions"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'packaging' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pack Size
                    </label>
                    <input
                      type="text"
                      value={formData.packaging.packSize}
                      onChange={(e) => handleNestedChange('packaging', 'packSize', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 10 tablets, 100ml"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={formData.packaging.expiryDate}
                      onChange={(e) => handleNestedChange('packaging', 'expiryDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Storage Instructions
                    </label>
                    <textarea
                      value={formData.packaging.storageInstructions}
                      onChange={(e) => handleNestedChange('packaging', 'storageInstructions', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter storage instructions"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'regulatory' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Drug Type
                    </label>
                    <select
                      value={formData.regulatory.drugType}
                      onChange={(e) => handleNestedChange('regulatory', 'drugType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Drug Type</option>
                      <option value="Allopathy">Allopathy</option>
                      <option value="Ayurvedic">Ayurvedic</option>
                      <option value="Homeopathic">Homeopathic</option>
                      <option value="Unani">Unani</option>
                    </select>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Side Effects</h3>
                    <div className="space-y-2">
                      {formData.regulatory.sideEffects.map((effect, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={effect}
                            onChange={(e) => {
                              const updated = [...formData.regulatory.sideEffects];
                              updated[index] = e.target.value;
                              handleNestedChange('regulatory', 'sideEffects', updated);
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = formData.regulatory.sideEffects.filter((_, i) => i !== index);
                              handleNestedChange('regulatory', 'sideEffects', updated);
                            }}
                            className="px-3 py-2 text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...formData.regulatory.sideEffects, ''];
                          handleNestedChange('regulatory', 'sideEffects', updated);
                        }}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                      >
                        + Add Side Effect
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Warnings</h3>
                    <div className="space-y-2">
                      {formData.regulatory.warnings.map((warning, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={warning}
                            onChange={(e) => {
                              const updated = [...formData.regulatory.warnings];
                              updated[index] = e.target.value;
                              handleNestedChange('regulatory', 'warnings', updated);
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = formData.regulatory.warnings.filter((_, i) => i !== index);
                              handleNestedChange('regulatory', 'warnings', updated);
                            }}
                            className="px-3 py-2 text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...formData.regulatory.warnings, ''];
                          handleNestedChange('regulatory', 'warnings', updated);
                        }}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                      >
                        + Add Warning
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'additional' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Alternative Medicines</h3>
                    <div className="space-y-2">
                      {formData.additionalFeatures.alternativeMedicines.map((alt, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={alt}
                            onChange={(e) => {
                              const updated = [...formData.additionalFeatures.alternativeMedicines];
                              updated[index] = e.target.value;
                              handleNestedChange('additionalFeatures', 'alternativeMedicines', updated);
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Alternative medicine name"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = formData.additionalFeatures.alternativeMedicines.filter((_, i) => i !== index);
                              handleNestedChange('additionalFeatures', 'alternativeMedicines', updated);
                            }}
                            className="px-3 py-2 text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...formData.additionalFeatures.alternativeMedicines, ''];
                          handleNestedChange('additionalFeatures', 'alternativeMedicines', updated);
                        }}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                      >
                        + Add Alternative Medicine
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">FAQs</h3>
                    <div className="space-y-4">
                      {formData.additionalFeatures.faqs.map((faq, index) => (
                        <div key={index} className="border border-gray-200 rounded-md p-4">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium text-gray-700">FAQ {index + 1}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = formData.additionalFeatures.faqs.filter((_, i) => i !== index);
                                handleNestedChange('additionalFeatures', 'faqs', updated);
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Question</label>
                              <input
                                type="text"
                                value={faq.question}
                                onChange={(e) => {
                                  const updated = [...formData.additionalFeatures.faqs];
                                  updated[index] = { ...updated[index], question: e.target.value };
                                  handleNestedChange('additionalFeatures', 'faqs', updated);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter question"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Answer</label>
                              <textarea
                                value={faq.answer}
                                onChange={(e) => {
                                  const updated = [...formData.additionalFeatures.faqs];
                                  updated[index] = { ...updated[index], answer: e.target.value };
                                  handleNestedChange('additionalFeatures', 'faqs', updated);
                                }}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter answer"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...formData.additionalFeatures.faqs, { question: '', answer: '' }];
                          handleNestedChange('additionalFeatures', 'faqs', updated);
                        }}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                      >
                        + Add FAQ
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Doctor's Advice
                    </label>
                    <textarea
                      value={formData.additionalFeatures.doctorAdvice}
                      onChange={(e) => handleNestedChange('additionalFeatures', 'doctorAdvice', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter doctor's advice or notes"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'media' && (
              <div className="space-y-6">
                <div className="col-span-full">
                  <label className="block mb-2">Product Images</label>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md transition">
                      Select Images
                      <input 
                        type="file" 
                        multiple 
                        onChange={handleImageUpload} 
                        accept="image/jpeg, image/png, image/webp"
                        className="hidden" 
                      />
                    </label>
                    <span className="text-sm text-gray-500">
                      {imagePreviews.length} {imagePreviews.length === 1 ? 'image' : 'images'} selected
                    </span>
                  </div>
                  
                  {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}
                  
                  {(imagePreviews.length > 0 || (formData.images && formData.images.length > 0)) && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                      {/* Show existing images */}
                      {formData.images && formData.images.map((image, index) => (
                        <div key={`existing-${index}`} className="relative group">
                          <div className="w-full h-32 bg-gray-100 rounded-md overflow-hidden">
                            <img 
                              src={typeof image === 'string' ? image : image.url} 
                              alt={`Product ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newImages = [...formData.images];
                              newImages.splice(index, 1);
                              setFormData(prev => ({
                                ...prev,
                                images: newImages
                              }));
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      
                      {/* Show new image previews */}
                      {imagePreviews.map((preview, index) => (
                        <div key={`preview-${index}`} className="relative group">
                          <div className="w-full h-32 bg-gray-100 rounded-md overflow-hidden">
                            <img 
                              src={preview.id} 
                              alt={`Preview ${index}`} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
                  isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditMedicineModal;
