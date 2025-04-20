import { useState, useCallback } from 'react';
import API from '../services/api';

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
    regulatory: { drugType: '', sideEffects: [], warnings: [], contraindications: [], interactions: [] },
    additionalFeatures: { doctorAdvice: '', faqs: [] }
  });
  
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData((prev) => {
      const updatedParent = {
        ...prev[parent],
        [field]: value
      };

      if (parent === 'pricing' && (field === 'mrp' || field === 'discount')) {
        const mrp = field === 'mrp' ? parseFloat(value) : parseFloat(updatedParent.mrp);
        const discount = field === 'discount' ? parseFloat(value) : parseFloat(updatedParent.discount);
        const sellingPrice = isNaN(mrp) || isNaN(discount) ? 0 : mrp - (mrp * discount / 100);
        updatedParent.sellingPrice = parseFloat(sellingPrice.toFixed(2));
      }

      return {
        ...prev,
        [parent]: updatedParent
      };
    });
  };

  const handleImageUpload = useCallback((e) => {
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
  }, []);

  const removeImage = useCallback((index) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    const newErrors = {};
    if (!formData.productName) newErrors.productName = 'Product name is required';
    if (!formData.packaging.packSize) newErrors.packSize = 'Pack size is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      
      // Add image files
      imageFiles.forEach(file => {
        formDataToSend.append('images', file);
      });

      // Prepare and validate data
      const dataToSend = {
        ...formData,
        packaging: {
          ...formData.packaging,
          expiryDate: formData.packaging.expiryDate 
            ? new Date(formData.packaging.expiryDate).toISOString() 
            : ''
        }
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

      const response = await API.post('/medicines/add', formDataToSend, {
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

      onAdd(response.data.medicine);
      onClose();
    } catch (error) {
      console.error('Error adding medicine:', error);
      setErrors({
        submit: error.response?.data?.message || 'Error adding medicine. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const inputClass = "w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none";
  const errorClass = "text-red-500 text-sm mt-1";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-semibold text-gray-800">Add New Medicine</h2>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700"
              disabled={isSubmitting}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {errors.submit && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div>
                <label>Product Name*</label>
                <input 
                  type="text" 
                  name="productName" 
                  value={formData.productName} 
                  onChange={handleChange} 
                  className={`${inputClass} ${errors.productName ? 'border-red-500' : ''}`} 
                />
                {errors.productName && <p className={errorClass}>{errors.productName}</p>}
                
                <label>Generic Name</label>
                <input type="text" name="genericName" value={formData.genericName} onChange={handleChange} className={inputClass} />
                
                <label>Brand Name</label>
                <input type="text" name="brandName" value={formData.brandName} onChange={handleChange} className={inputClass} />
                
                <label>Manufacturer</label>
                <input type="text" name="manufacturer" value={formData.manufacturer} onChange={handleChange} className={inputClass} />
                
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} className={inputClass} />
                
                <label>Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className={inputClass}>
                  <option>OTC</option>
                  <option>Prescription</option>
                  <option>Ayurvedic</option>
                  <option>Homeopathic</option>
                </select>
                
                <label className="flex items-center mt-2">
                  <input 
                    type="checkbox" 
                    name="prescriptionRequired" 
                    checked={formData.prescriptionRequired} 
                    onChange={handleChange} 
                    className="mr-2" 
                  /> 
                  Prescription Required
                </label>
              </div>

              {/* Pricing and Stock */}
              <div>
                <label>MRP</label>
                <input type="number" value={formData.pricing.mrp} onChange={e => handleNestedChange('pricing', 'mrp', e.target.value)} className={inputClass} />
                
                <label>Discount (%)</label>
                <input type="number" value={formData.pricing.discount} onChange={e => handleNestedChange('pricing', 'discount', e.target.value)} className={inputClass} />
                
                <label>Selling Price</label>
                <input type="number" value={formData.pricing.sellingPrice} readOnly className={`${inputClass} bg-gray-100 cursor-not-allowed`} />
                
                <label>Stock Quantity</label>
                <input type="number" value={formData.stock.quantity} onChange={e => handleNestedChange('stock', 'quantity', e.target.value)} className={inputClass} />
                
                <label>Min Order</label>
                <input type="number" value={formData.stock.minOrderQuantity} onChange={e => handleNestedChange('stock', 'minOrderQuantity', e.target.value)} className={inputClass} />
                
                <label>Max Order</label>
                <input type="number" value={formData.stock.maxOrderQuantity} onChange={e => handleNestedChange('stock', 'maxOrderQuantity', e.target.value)} className={inputClass} />
              </div>

              {/* Composition and Dosage */}
              <div>
                <label>Active Ingredients</label>
                <input type="text" onChange={e => handleNestedChange('composition', 'activeIngredients', e.target.value.split(','))} className={inputClass} />
                
                <label>Inactive Ingredients</label>
                <input type="text" onChange={e => handleNestedChange('composition', 'inactiveIngredients', e.target.value.split(','))} className={inputClass} />
                
                <label>Form</label>
                <input type="text" value={formData.dosage.form} onChange={e => handleNestedChange('dosage', 'form', e.target.value)} className={inputClass} />
                
                <label>Strength</label>
                <input type="text" value={formData.dosage.strength} onChange={e => handleNestedChange('dosage', 'strength', e.target.value)} className={inputClass} />
                
                <label>Recommended Dosage</label>
                <input type="text" value={formData.dosage.recommendedDosage} onChange={e => handleNestedChange('dosage', 'recommendedDosage', e.target.value)} className={inputClass} />
              </div>

              {/* Packaging & Regulatory */}
              <div>
                <label>Pack Size*</label>
                <input 
                  type="text" 
                  value={formData.packaging.packSize} 
                  onChange={e => handleNestedChange('packaging', 'packSize', e.target.value)} 
                  className={`${inputClass} ${errors.packSize ? 'border-red-500' : ''}`} 
                />
                {errors.packSize && <p className={errorClass}>{errors.packSize}</p>}
                
                <label>Expiry Date</label>
                <input type="date" value={formData.packaging.expiryDate} onChange={e => handleNestedChange('packaging', 'expiryDate', e.target.value)} className={inputClass} />
                
                <label>Storage Instructions</label>
                <input type="text" value={formData.packaging.storageInstructions} onChange={e => handleNestedChange('packaging', 'storageInstructions', e.target.value)} className={inputClass} />
                
                <label>Drug Type</label>
                <input type="text" value={formData.regulatory.drugType} onChange={e => handleNestedChange('regulatory', 'drugType', e.target.value)} className={inputClass} />
                
                {['sideEffects', 'warnings', 'contraindications', 'interactions'].map(field => (
                  <div key={field}>
                    <label>{field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}</label>
                    <input 
                      type="text" 
                      onChange={e => setFormData(prev => ({
                        ...prev,
                        regulatory: { ...prev.regulatory, [field]: e.target.value.split(',') }
                      }))} 
                      className={inputClass} 
                    />
                  </div>
                ))}
              </div>

              {/* Additional Features */}
              <div>
                <label>Doctor Advice</label>
                <textarea value={formData.additionalFeatures.doctorAdvice} onChange={e => handleNestedChange('additionalFeatures', 'doctorAdvice', e.target.value)} className={inputClass} />
                
                <label>FAQs (Q::A|Q::A)</label>
                <textarea 
                  onChange={e => {
                    const faqPairs = e.target.value.split('|').map(pair => {
                      const [question, answer] = pair.split('::');
                      return { question, answer };
                    });
                    handleNestedChange('additionalFeatures', 'faqs', faqPairs);
                  }} 
                  className={inputClass} 
                />
              </div>

              {/* Images Section */}
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
                    {imageFiles.length} {imageFiles.length === 1 ? 'image' : 'images'} selected
                  </span>
                </div>
                
                {errors.images && <p className={errorClass}>{errors.images}</p>}
                
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={preview.id} className="relative group">
                        <img 
                          src={preview.id} 
                          alt={`Preview ${index}`} 
                          className="w-full h-32 object-cover rounded-md border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <p className="text-xs text-gray-500 truncate mt-1">{preview.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-4 py-2 border rounded-md hover:bg-gray-100"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isSubmitting ? 'Adding Medicine...' : 'Add Medicine'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMedicineModal;