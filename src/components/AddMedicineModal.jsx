import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import API from '../services/api';

const AddMedicineModal = ({ isOpen, onClose, onAdd, isEditing = false }) => {
  const [activeTab, setActiveTab] = useState('basic');
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
    }
  });

  const [currentIngredient, setCurrentIngredient] = useState({ type: 'active', value: '' });
  const [currentRegulatory, setCurrentRegulatory] = useState({ type: 'sideEffects', value: '' });
  const [currentFaq, setCurrentFaq] = useState({ question: '', answer: '' });
  const [currentAlternative, setCurrentAlternative] = useState('');
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showAlternativeInput, setShowAlternativeInput] = useState(false);

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

    // Auto-calculate selling price when MRP or discount changes
    if (parent === 'pricing' && (field === 'mrp' || field === 'discount')) {
      const mrp = field === 'mrp' ? parseFloat(value) : parseFloat(formData.pricing.mrp || 0);
      const discount = field === 'discount' ? parseFloat(value) : parseFloat(formData.pricing.discount || 0);
      const sellingPrice = mrp - (mrp * discount / 100);
      
      setFormData(prev => ({
        ...prev,
        pricing: {
          ...prev.pricing,
          sellingPrice: !isNaN(sellingPrice) ? parseFloat(sellingPrice.toFixed(2)) : 0
        }
      }));
    }
  };

  const handleAddIngredient = (type) => {
    const value = type === 'active' ? currentIngredient.value : currentIngredient.value;
    if (!value.trim()) return;
    
    const field = type === 'active' ? 'activeIngredients' : 'inactiveIngredients';
    
    setFormData(prev => ({
      ...prev,
      composition: {
        ...prev.composition,
        [field]: [...prev.composition[field], value.trim()]
      }
    }));
    
    setCurrentIngredient({ ...currentIngredient, value: '' });
  };

  const handleRemoveIngredient = (type, index) => {
    const field = type === 'active' ? 'activeIngredients' : 'inactiveIngredients';
    setFormData(prev => ({
      ...prev,
      composition: {
        ...prev.composition,
        [field]: prev.composition[field].filter((_, i) => i !== index)
      }
    }));
  };

  const handleAddRegulatory = () => {
    if (!currentRegulatory.value.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      regulatory: {
        ...prev.regulatory,
        [currentRegulatory.type]: [
          ...prev.regulatory[currentRegulatory.type], 
          currentRegulatory.value.trim()
        ]
      }
    }));
    
    setCurrentRegulatory({ ...currentRegulatory, value: '' });
  };

  const handleRemoveRegulatory = (type, index) => {
    setFormData(prev => ({
      ...prev,
      regulatory: {
        ...prev.regulatory,
        [type]: prev.regulatory[type].filter((_, i) => i !== index)
      }
    }));
  };

  const handleAddFaq = () => {
    if (!currentFaq.question.trim() || !currentFaq.answer.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      additionalFeatures: {
        ...prev.additionalFeatures,
        faqs: [
          ...prev.additionalFeatures.faqs,
          { 
            question: currentFaq.question.trim(),
            answer: currentFaq.answer.trim()
          }
        ]
      }
    }));
    
    setCurrentFaq({ question: '', answer: '' });
  };

  const handleRemoveFaq = (index) => {
    setFormData(prev => ({
      ...prev,
      additionalFeatures: {
        ...prev.additionalFeatures,
        faqs: prev.additionalFeatures.faqs.filter((_, i) => i !== index)
      }
    }));
  };

  const handleAddAlternative = () => {
    if (!currentAlternative.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      additionalFeatures: {
        ...prev.additionalFeatures,
        alternativeMedicines: [
          ...prev.additionalFeatures.alternativeMedicines,
          currentAlternative.trim()
        ]
      }
    }));
    
    setCurrentAlternative('');
    setShowAlternativeInput(false);
  };

  const handleRemoveAlternative = (index) => {
    setFormData(prev => ({
      ...prev,
      additionalFeatures: {
        ...prev.additionalFeatures,
        alternativeMedicines: prev.additionalFeatures.alternativeMedicines.filter((_, i) => i !== index)
      }
    }));
  };

  const handleImageUpload = useCallback((e) => {
    const files = Array.from(e.target.files);
    
    // Clear previous errors
    setErrors(prev => ({ ...prev, images: undefined }));
    
    // Validate total number of images (max 5)
    if (imageFiles.length + files.length > 5) {
      setErrors(prev => ({
        ...prev,
        images: 'Maximum 5 images allowed'
      }));
      return;
    }
    
    // Validate file types and sizes
    const validFiles = [];
    const invalidFiles = [];
    
    files.forEach(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        invalidFiles.push(`${file.name}: Invalid file type`);
      } else if (file.size > maxSize) {
        invalidFiles.push(`${file.name}: File too large (max 5MB)`);
      } else {
        validFiles.push(file);
      }
    });
    
    if (invalidFiles.length > 0) {
      setErrors(prev => ({
        ...prev,
        images: `Some files were not uploaded: ${invalidFiles.join('; ')}`
      }));
    }
    
    if (validFiles.length === 0) return;

    // Create previews
    const previews = validFiles.map(file => ({
      id: URL.createObjectURL(file),
      name: file.name,
      file,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
    }));

    setImagePreviews(prev => [...prev, ...previews]);
    setImageFiles(prev => [...prev, ...validFiles]);
    e.target.value = ''; // Reset file input
  }, [imageFiles.length]);

  const removeImage = useCallback((index) => {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(imagePreviews[index].id);
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  }, [imagePreviews]);

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!formData.productName?.trim()) newErrors.productName = 'Product name is required';
    if (!formData.genericName?.trim()) newErrors.genericName = 'Generic name is required';
    if (!formData.manufacturer?.trim()) newErrors.manufacturer = 'Manufacturer is required';
    if (!formData.description?.trim()) newErrors.description = 'Description is required';
    if (!formData.packaging.packSize || !formData.packaging.packSize.trim()) newErrors.packSize = 'Pack size is required';
    if (!formData.packaging.expiryDate) newErrors.expiryDate = 'Expiry date is required';
    if (formData.composition.activeIngredients.length === 0) newErrors.activeIngredients = 'At least one active ingredient is required';
    if (formData.dosage.form?.trim() === '') newErrors.dosageForm = 'Dosage form is required';
    if (formData.pricing.mrp <= 0) newErrors.mrp = 'MRP must be greater than 0';
    if (formData.stock.quantity < 0) newErrors.stockQuantity = 'Stock quantity cannot be negative';
    
    // Image validation
    if (imageFiles.length === 0) newErrors.images = 'At least one product image is required';
    
    // Date validation
    if (formData.packaging.expiryDate) {
      const expiryDate = new Date(formData.packaging.expiryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (expiryDate < today) {
        newErrors.expiryDate = 'Expiry date cannot be in the past';
      }
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      // Scroll to first error
      const firstError = Object.keys(formErrors)[0];
      document.querySelector(`[name="${firstError}"]`)?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      
      // Add image files
      imageFiles.forEach(file => {
        formDataToSend.append('images', file);
      });

      // Prepare data for submission
      const dataToSend = {
        ...formData,
        // Convert string dates to proper format
        packaging: {
          ...formData.packaging,
          expiryDate: new Date(formData.packaging.expiryDate).toISOString()
        },
        // Ensure numeric fields are numbers
        pricing: {
          ...formData.pricing,
          mrp: parseFloat(formData.pricing.mrp),
          discount: parseFloat(formData.pricing.discount) || 0,
          sellingPrice: parseFloat(formData.pricing.sellingPrice)
        },
        stock: {
          ...formData.stock,
          quantity: parseInt(formData.stock.quantity, 10),
          minOrderQuantity: parseInt(formData.stock.minOrderQuantity, 10) || 1,
          maxOrderQuantity: parseInt(formData.stock.maxOrderQuantity, 10) || 10
        }
      };

      // Append all fields to form data
      Object.keys(dataToSend).forEach(key => {
        const value = dataToSend[key];
        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
          // Handle nested objects
          formDataToSend.append(key, JSON.stringify(value));
        } else if (Array.isArray(value)) {
          // Handle arrays
          value.forEach((item, index) => {
            formDataToSend.append(`${key}[${index}]`, item);
          });
        } else if (value !== null && value !== undefined) {
          // Handle primitive values
          formDataToSend.append(key, value);
        }
      });

      // Submit the form
      const response = await API.post('/medicines/add', formDataToSend, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        }
      });

      // Call the onAdd callback with the new medicine
      if (onAdd) {
        onAdd(response.data);
      }
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error('Error adding medicine:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.response?.data?.message || 'Failed to add medicine. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Define tabs configuration
  const tabs = [
    { id: 'basic', name: 'Basic Information' },
    { id: 'composition', name: 'Composition' },
    { id: 'dosage', name: 'Dosage' },
    { id: 'pricing', name: 'Pricing' },
    { id: 'stock', name: 'Stock' },
    { id: 'packaging', name: 'Packaging' },
    { id: 'regulatory', name: 'Regulatory' },
    { id: 'additional', name: 'Additional' },
    { id: 'media', name: 'Media' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 pt-6 pb-2 border-b border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">
                {isEditing ? 'Edit Medicine' : 'Add New Medicine'}
              </h2>
              <p className="text-sm text-gray-500">
                {isEditing 
                  ? 'Update the medicine details below'
                  : 'Fill in the details below to add a new medicine to the inventory'}
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-500 transition-colors"
              disabled={isSubmitting}
              type="button"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-4 border-b border-gray-200 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <div className="flex-1">
              {errors.submit && (
                <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
                  {errors.submit}
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
                      name="productName"
                      value={formData.productName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    {errors.productName && (
                      <p className="mt-1 text-sm text-red-600">{errors.productName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Generic Name *
                    </label>
                    <input
                      type="text"
                      name="genericName"
                      value={formData.genericName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    {errors.genericName && (
                      <p className="mt-1 text-sm text-red-600">{errors.genericName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand Name
                    </label>
                    <input
                      type="text"
                      name="brandName"
                      value={formData.brandName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Manufacturer *
                    </label>
                    <input
                      type="text"
                      name="manufacturer"
                      value={formData.manufacturer}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    {errors.manufacturer && (
                      <p className="mt-1 text-sm text-red-600">{errors.manufacturer}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="OTC">Over the Counter (OTC)</option>
                      <option value="Prescription">Prescription</option>
                      <option value="Ayurvedic">Ayurvedic</option>
                      <option value="Homeopathic">Homeopathic</option>
                      <option value="Surgical">Surgical</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="prescriptionRequired"
                      name="prescriptionRequired"
                      checked={formData.prescriptionRequired}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="prescriptionRequired" className="ml-2 block text-sm text-gray-700">
                      Prescription Required
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Composition Tab */}
            {activeTab === 'composition' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Active Ingredients</h3>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={currentIngredient.type === 'active' ? currentIngredient.value : ''}
                      onChange={(e) => setCurrentIngredient({ type: 'active', value: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddIngredient('active')}
                      placeholder="Add active ingredient"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddIngredient('active')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Add
                    </button>
                  </div>
                  {errors.activeIngredients && (
                    <p className="mt-1 text-sm text-red-600">{errors.activeIngredients}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {formData.composition.activeIngredients.map((ingredient, index) => (
                      <span key={`active-${index}`} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {ingredient}
                        <button
                          type="button"
                          onClick={() => handleRemoveIngredient('active', index)}
                          className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-200 text-blue-600 hover:bg-blue-300 focus:outline-none"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Inactive Ingredients</h3>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={currentIngredient.type === 'inactive' ? currentIngredient.value : ''}
                      onChange={(e) => setCurrentIngredient({ type: 'inactive', value: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddIngredient('inactive')}
                      placeholder="Add inactive ingredient"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddIngredient('inactive')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.composition.inactiveIngredients.map((ingredient, index) => (
                      <span key={`inactive-${index}`} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                        {ingredient}
                        <button
                          type="button"
                          onClick={() => handleRemoveIngredient('inactive', index)}
                          className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 focus:outline-none"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Dosage Tab */}
            {activeTab === 'dosage' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Form *
                    </label>
                    <select
                      value={formData.dosage.form}
                      onChange={(e) => handleNestedChange('dosage', 'form', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select form</option>
                      <option value="Tablet">Tablet</option>
                      <option value="Capsule">Capsule</option>
                      <option value="Syrup">Syrup</option>
                      <option value="Injection">Injection</option>
                      <option value="Ointment">Ointment</option>
                      <option value="Drops">Drops</option>
                      <option value="Inhaler">Inhaler</option>
                      <option value="Powder">Powder</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.dosageForm && (
                      <p className="mt-1 text-sm text-red-600">{errors.dosageForm}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Strength
                    </label>
                    <input
                      type="text"
                      value={formData.dosage.strength}
                      onChange={(e) => handleNestedChange('dosage', 'strength', e.target.value)}
                      placeholder="e.g., 500mg, 10mg/5ml"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Recommended Dosage
                    </label>
                    <textarea
                      value={formData.dosage.recommendedDosage}
                      onChange={(e) => handleNestedChange('dosage', 'recommendedDosage', e.target.value)}
                      placeholder="e.g., 1 tablet twice daily after meals"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Pricing Tab */}
            {activeTab === 'pricing' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      MRP (₹) *
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">₹</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.pricing.mrp}
                        onChange={(e) => handleNestedChange('pricing', 'mrp', parseFloat(e.target.value) || 0)}
                        className="pl-7 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    {errors.mrp && (
                      <p className="mt-1 text-sm text-red-600">{errors.mrp}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount (%)
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.pricing.discount}
                        onChange={(e) => handleNestedChange('pricing', 'discount', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Selling Price (₹)
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">₹</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.pricing.sellingPrice}
                        readOnly
                        className="pl-7 w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stock Tab */}
            {activeTab === 'stock' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="available"
                      checked={formData.stock.available}
                      onChange={(e) => handleNestedChange('stock', 'available', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="available" className="ml-2 block text-sm text-gray-700">
                      Available in Stock
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity in Stock *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.stock.quantity}
                      onChange={(e) => handleNestedChange('stock', 'quantity', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    {errors.stockQuantity && (
                      <p className="mt-1 text-sm text-red-600">{errors.stockQuantity}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Order Quantity
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
                      Maximum Order Quantity
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

            {/* Packaging Tab */}
            {activeTab === 'packaging' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pack Size *
                    </label>
                    <input
                      type="text"
                      value={formData.packaging.packSize}
                      onChange={(e) => handleNestedChange('packaging', 'packSize', e.target.value)}
                      placeholder="e.g., 10 tablets, 100ml"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    {errors.packSize && (
                      <p className="mt-1 text-sm text-red-600">{errors.packSize}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date *
                    </label>
                    <input
                      type="date"
                      value={formData.packaging.expiryDate}
                      onChange={(e) => handleNestedChange('packaging', 'expiryDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    {errors.expiryDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Storage Instructions
                    </label>
                    <textarea
                      value={formData.packaging.storageInstructions}
                      onChange={(e) => handleNestedChange('packaging', 'storageInstructions', e.target.value)}
                      placeholder="e.g., Store in a cool, dry place away from direct sunlight"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Regulatory Tab */}
            {activeTab === 'regulatory' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Drug Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Drug Type
                      </label>
                      <select
                        value={formData.regulatory.drugType}
                        onChange={(e) => handleNestedChange('regulatory', 'drugType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select drug type</option>
                        <option value="Allopathic">Allopathic</option>
                        <option value="Ayurvedic">Ayurvedic</option>
                        <option value="Homeopathic">Homeopathic</option>
                        <option value="Biologic">Biologic</option>
                        <option value="Generic">Generic</option>
                        <option value="Branded">Branded</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Safety Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Side Effects
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={currentRegulatory.type === 'sideEffects' ? currentRegulatory.value : ''}
                        onChange={(e) => setCurrentRegulatory({ type: 'sideEffects', value: e.target.value })}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddRegulatory()}
                        placeholder="Add side effect"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddRegulatory}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Add
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.regulatory.sideEffects.map((effect, index) => (
                        <span key={`side-effect-${index}`} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {effect}
                          <button
                            type="button"
                            onClick={() => handleRemoveRegulatory('sideEffects', index)}
                            className="ml-1.5 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-red-200 text-red-600 hover:bg-red-300 focus:outline-none"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Warnings
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={currentRegulatory.type === 'warnings' ? currentRegulatory.value : ''}
                        onChange={(e) => setCurrentRegulatory({ type: 'warnings', value: e.target.value })}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddRegulatory()}
                        placeholder="Add warning"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentRegulatory({ ...currentRegulatory, type: 'warnings' });
                          handleAddRegulatory();
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Add
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.regulatory.warnings.map((warning, index) => (
                        <span key={`warning-${index}`} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {warning}
                          <button
                            type="button"
                            onClick={() => handleRemoveRegulatory('warnings', index)}
                            className="ml-1.5 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-yellow-200 text-yellow-600 hover:bg-yellow-300 focus:outline-none"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contraindications
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={currentRegulatory.type === 'contraindications' ? currentRegulatory.value : ''}
                        onChange={(e) => setCurrentRegulatory({ type: 'contraindications', value: e.target.value })}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddRegulatory()}
                        placeholder="Add contraindication"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentRegulatory({ ...currentRegulatory, type: 'contraindications' });
                          handleAddRegulatory();
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Add
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.regulatory.contraindications.map((contra, index) => (
                        <span key={`contra-${index}`} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {contra}
                          <button
                            type="button"
                            onClick={() => handleRemoveRegulatory('contraindications', index)}
                            className="ml-1.5 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-purple-200 text-purple-600 hover:bg-purple-300 focus:outline-none"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Drug Interactions
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={currentRegulatory.type === 'interactions' ? currentRegulatory.value : ''}
                        onChange={(e) => setCurrentRegulatory({ type: 'interactions', value: e.target.value })}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddRegulatory()}
                        placeholder="Add drug interaction"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentRegulatory({ ...currentRegulatory, type: 'interactions' });
                          handleAddRegulatory();
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Add
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.regulatory.interactions.map((interaction, index) => (
                        <span key={`interaction-${index}`} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                          {interaction}
                          <button
                            type="button"
                            onClick={() => handleRemoveRegulatory('interactions', index)}
                            className="ml-1.5 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-pink-200 text-pink-600 hover:bg-pink-300 focus:outline-none"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Tab */}
            {activeTab === 'additional' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Alternative Medicines</h3>
                  {!showAlternativeInput ? (
                    <button
                      type="button"
                      onClick={() => setShowAlternativeInput(true)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Alternative Medicine
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={currentAlternative}
                        onChange={(e) => setCurrentAlternative(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddAlternative()}
                        placeholder="Enter alternative medicine name"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleAddAlternative}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAlternativeInput(false);
                          setCurrentAlternative('');
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.additionalFeatures.alternativeMedicines.map((medicine, index) => (
                        <span key={`alt-${index}`} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          {medicine}
                          <button
                            type="button"
                            onClick={() => handleRemoveAlternative(index)}
                            className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-200 text-green-600 hover:bg-green-300 focus:outline-none"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Frequently Asked Questions</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={currentFaq.question}
                          onChange={(e) => setCurrentFaq({ ...currentFaq, question: e.target.value })}
                          placeholder="Question"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <textarea
                          value={currentFaq.answer}
                          onChange={(e) => setCurrentFaq({ ...currentFaq, answer: e.target.value })}
                          placeholder="Answer"
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={handleAddFaq}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            Add FAQ
                          </button>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {formData.additionalFeatures.faqs.map((faq, index) => (
                          <div key={`faq-${index}`} className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-gray-900">{faq.question}</h4>
                                <p className="mt-1 text-sm text-gray-600">{faq.answer}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveFaq(index)}
                                className="text-red-600 hover:text-red-800 focus:outline-none"
                              >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Images</h3>
                    <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                          >
                            <span>Upload files</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              multiple
                              accept="image/*"
                              onChange={handleImageUpload}
                              disabled={formData.images.length >= 5}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 5MB
                        </p>
                      </div>
                    </div>
                    {errors.images && (
                      <p className="mt-1 text-sm text-red-600">{errors.images}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      {formData.images.length} of 5 files uploaded
                    </p>
                  </div>

                {formData.images.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Preview</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {formData.images.map((preview, index) => (
                        <div key={index} className="relative group rounded-md overflow-hidden border border-gray-200">
                          <img
                            src={preview.id}
                            alt={`Preview ${index + 1}`}
                            className="h-32 w-full object-cover rounded-md"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="p-1 bg-red-600 text-white rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                          <div className="absolute top-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1.5 py-0.5 rounded">
                            {preview.name.length > 15 ? `${preview.name.substring(0, 12)}...` : preview.name}
                          </div>
                          <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1.5 py-0.5 rounded">
                            {preview.size}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Form footer buttons */}
          <div className="mt-8 flex justify-end space-x-3 border-t border-gray-200 pt-4 px-6 pb-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isEditing ? 'Updating...' : 'Saving...'}
                </>
              ) : (
                <span>
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {isEditing ? 'Update Medicine' : 'Add Medicine'}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  );
}

AddMedicineModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  isEditing: PropTypes.bool,
};

export default AddMedicineModal;