import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { createLabTest, updateLabTest, getLabTestById } from '../services/labTestService';
import { toast } from 'react-toastify';

const AddLabTestModal = ({ isOpen, onClose, testId, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showParameters, setShowParameters] = useState(false);
  const [showFAQs, setShowFAQs] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  // Categories from the model
  const categories = [
    'Blood Tests',
    'Imaging',
    'Pathology',
    'Cardiology',
    'Neurology',
    'Endocrinology',
    'Microbiology',
    'Genetics',
    'Other'
  ];

  // Initial form state
  const initialFormState = {
    testName: '',
    testCode: '',
    category: 'Blood Tests',
    description: '',
    preparation: '',
    reportTime: '24-48 hours',
    parameters: [],
    price: 0,
    discount: 0,
    isHomeCollectionAvailable: false,
    homeCollectionPrice: 0,
    isPopular: false,
    isRecommended: false,
    includedTests: [],
    excludedTests: [],
    faqs: [],
    status: 'active'
  };

  const [formData, setFormData] = useState(initialFormState);
  const [newParameter, setNewParameter] = useState({ name: '', unit: '', referenceRange: '', description: '' });
  const [newFAQ, setNewFAQ] = useState({ question: '', answer: '' });
  const [newIncludedTest, setNewIncludedTest] = useState('');
  const [newExcludedTest, setNewExcludedTest] = useState('');

  // Load test data if in edit mode
  useEffect(() => {
    if (testId) {
      const loadTestData = async () => {
        try {
          setIsLoading(true);
          const data = await getLabTestById(testId);
          setFormData({
            ...data.data,
            // Ensure all arrays are initialized
            parameters: data.data.parameters || [],
            includedTests: data.data.includedTests || [],
            excludedTests: data.data.excludedTests || [],
            faqs: data.data.faqs || []
          });
        } catch (error) {
          console.error('Error loading test data:', error);
          toast.error('Failed to load test data');
        } finally {
          setIsLoading(false);
        }
      };
      loadTestData();
    } else {
      // Reset form for new test
      setFormData(initialFormState);
    }
  }, [testId]);

  const handleInputChange = (e) => {
    const { name, type, checked, value } = e.target;
    
    // Special handling for testCode field
    if (name === 'testCode') {
      // Convert to uppercase and remove any invalid characters
      const formattedValue = value.toUpperCase().replace(/[^A-Z0-9_-]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } 
    // Handle checkboxes
    else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    }
    // Handle other input types
    else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear validation error for this field when user types
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleNestedInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const addParameter = () => {
    if (!newParameter.name) return;
    
    setFormData(prev => ({
      ...prev,
      parameters: [...prev.parameters, { ...newParameter }]
    }));
    
    // Reset parameter form
    setNewParameter({ name: '', unit: '', referenceRange: '', description: '' });
  };

  const removeParameter = (index) => {
    setFormData(prev => ({
      ...prev,
      parameters: prev.parameters.filter((_, i) => i !== index)
    }));
  };

  const addFAQ = () => {
    if (!newFAQ.question || !newFAQ.answer) return;
    
    setFormData(prev => ({
      ...prev,
      faqs: [...prev.faqs, { ...newFAQ }]
    }));
    
    // Reset FAQ form
    setNewFAQ({ question: '', answer: '' });
  };

  const removeFAQ = (index) => {
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index)
    }));
  };

  const addIncludedTest = () => {
    if (!newIncludedTest) return;
    
    setFormData(prev => ({
      ...prev,
      includedTests: [...prev.includedTests, newIncludedTest]
    }));
    
    setNewIncludedTest('');
  };

  const removeIncludedTest = (index) => {
    setFormData(prev => ({
      ...prev,
      includedTests: prev.includedTests.filter((_, i) => i !== index)
    }));
  };

  const addExcludedTest = () => {
    if (!newExcludedTest) return;
    
    setFormData(prev => ({
      ...prev,
      excludedTests: [...prev.excludedTests, newExcludedTest]
    }));
    
    setNewExcludedTest('');
  };

  const removeExcludedTest = (index) => {
    setFormData(prev => ({
      ...prev,
      excludedTests: prev.excludedTests.filter((_, i) => i !== index)
    }));
  };

  const getFieldError = (fieldName) => {
    return validationErrors[fieldName] || null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setValidationErrors({});
    
    try {
      console.log('Form data before submission:', JSON.stringify(formData, null, 2));
      
      // Prepare data for submission with proper type conversion
      // Exclude metadata and system fields that shouldn't be updated
      const { _id, __v, createdAt, updatedAt, ...dataToUpdate } = formData;
      
      const dataToSubmit = {
        ...dataToUpdate,
        // Convert string values to numbers where needed
        price: parseFloat(formData.price) || 0,
        discount: parseFloat(formData.discount) || 0,
        homeCollectionPrice: parseFloat(formData.homeCollectionPrice) || 0,
        // Ensure boolean fields are actual booleans
        isHomeCollectionAvailable: Boolean(formData.isHomeCollectionAvailable),
        isPopular: Boolean(formData.isPopular),
        isRecommended: Boolean(formData.isRecommended),
        // Process arrays
        parameters: (formData.parameters || []).map(p => ({
          ...p,
          isIncluded: Boolean(p.isIncluded)
        })),
        includedTests: formData.includedTests || [],
        excludedTests: formData.excludedTests || [],
        faqs: formData.faqs || []
      };
      
      // Remove any remaining metadata fields that might have been added by Mongoose
      delete dataToSubmit.metadata;
      delete dataToSubmit._doc;
      
      console.log('Data being submitted:', JSON.stringify(dataToSubmit, null, 2));
      
      if (testId) {
        // Update existing test
        await updateLabTest(testId, dataToSubmit);
        toast.success('Test updated successfully');
      } else {
        // Create new test
        await createLabTest(dataToSubmit);
        toast.success('Test created successfully');
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving test:', error);
      
      // Handle validation errors
      if (error.errors && Array.isArray(error.errors)) {
        // Convert array of errors to an object keyed by field name
        const errors = {};
        error.errors.forEach(err => {
          // Handle nested fields like 'parameters[0].name'
          const field = err.field.replace(/\[(\d+)\]./g, '');
          errors[field] = err.message;
        });
        setValidationErrors(errors);
        
        // Show all validation errors in console for debugging
        console.log('Validation errors:', errors);
        
        // Show the first error in a toast
        const firstError = error.errors[0];
        if (firstError) {
          toast.error(`Validation error: ${firstError.field} - ${firstError.message}`);
        }
      } else {
        // Show generic error
        toast.error(error.message || 'Failed to save test');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold">
            {testId ? 'Edit Lab Test' : 'Add New Lab Test'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Name *
                </label>
                <input
                  type="text"
                  id="testName"
                  name="testName"
                  value={formData.testName}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md ${getFieldError('testName') ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
                  required
                />
                {getFieldError('testName') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('testName')}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Code *
                </label>
                <input
                  type="text"
                  id="testCode"
                  name="testCode"
                  value={formData.testCode}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md ${getFieldError('testCode') ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
                  required
                  placeholder="e.g., CBC, LFT, KFT"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Must be uppercase and can only contain letters, numbers, hyphens (-), and underscores (_)
                </p>
                {getFieldError('testCode') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('testCode')}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Time *
                </label>
                <input
                  type="text"
                  name="reportTime"
                  value={formData.reportTime}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  required
                  placeholder="e.g., 24-48 hours"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount (%)
                </label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className="w-full p-2 border rounded-md"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isHomeCollectionAvailable"
                  name="isHomeCollectionAvailable"
                  checked={formData.isHomeCollectionAvailable}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isHomeCollectionAvailable" className="ml-2 block text-sm text-gray-700">
                  Home Collection Available
                </label>
              </div>
              
              {formData.isHomeCollectionAvailable && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Home Collection Price (₹)
                  </label>
                  <input
                    type="number"
                    name="homeCollectionPrice"
                    value={formData.homeCollectionPrice}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              )}
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPopular"
                  name="isPopular"
                  checked={formData.isPopular}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isPopular" className="ml-2 block text-sm text-gray-700">
                  Mark as Popular
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isRecommended"
                  name="isRecommended"
                  checked={formData.isRecommended}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isRecommended" className="ml-2 block text-sm text-gray-700">
                  Mark as Recommended
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="temporarily_unavailable">Temporarily Unavailable</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full p-2 border rounded-md"
                required
                placeholder="Detailed description of the test..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preparation Instructions *
              </label>
              <textarea
                name="preparation"
                value={formData.preparation}
                onChange={handleInputChange}
                rows="2"
                className="w-full p-2 border rounded-md"
                required
                placeholder="e.g., Fasting required for 8-10 hours..."
              />
            </div>
          </div>
          
          {/* Test Parameters */}
          <div className="border-t pt-4">
            <div 
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setShowParameters(!showParameters)}
            >
              <h3 className="text-lg font-medium">Test Parameters</h3>
              {showParameters ? <ChevronUp /> : <ChevronDown />}
            </div>
            
            {showParameters && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parameter Name *
                    </label>
                    <input
                      type="text"
                      value={newParameter.name}
                      onChange={(e) => setNewParameter({...newParameter, name: e.target.value})}
                      className="w-full p-2 border rounded-md"
                      placeholder="e.g., Hemoglobin"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit
                    </label>
                    <input
                      type="text"
                      value={newParameter.unit}
                      onChange={(e) => setNewParameter({...newParameter, unit: e.target.value})}
                      className="w-full p-2 border rounded-md"
                      placeholder="e.g., g/dL"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reference Range
                    </label>
                    <input
                      type="text"
                      value={newParameter.referenceRange}
                      onChange={(e) => setNewParameter({...newParameter, referenceRange: e.target.value})}
                      className="w-full p-2 border rounded-md"
                      placeholder="e.g., 12.0-16.0"
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={addParameter}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                      disabled={!newParameter.name}
                    >
                      <Plus size={16} className="mr-1" /> Add
                    </button>
                  </div>
                </div>
                
                {formData.parameters.length > 0 && (
                  <div className="border rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Parameter
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Unit
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Reference Range
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {formData.parameters.map((param, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {param.name}
                              {param.description && (
                                <p className="text-xs text-gray-500">{param.description}</p>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {param.unit || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {param.referenceRange || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                type="button"
                                onClick={() => removeParameter(index)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Included Tests */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-4">Included Tests</h3>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newIncludedTest}
                onChange={(e) => setNewIncludedTest(e.target.value)}
                className="flex-1 p-2 border rounded-md"
                placeholder="Add included test"
              />
              <button
                type="button"
                onClick={addIncludedTest}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                disabled={!newIncludedTest}
              >
                <Plus size={16} className="mr-1" /> Add
              </button>
            </div>
            
            {formData.includedTests.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.includedTests.map((test, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {test}
                    <button
                      type="button"
                      onClick={() => removeIncludedTest(index)}
                      className="ml-2 text-blue-600 hover:text-blue-900"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* Excluded Tests */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-4">Excluded Tests</h3>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newExcludedTest}
                onChange={(e) => setNewExcludedTest(e.target.value)}
                className="flex-1 p-2 border rounded-md"
                placeholder="Add excluded test"
              />
              <button
                type="button"
                onClick={addExcludedTest}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                disabled={!newExcludedTest}
              >
                <Plus size={16} className="mr-1" /> Add
              </button>
            </div>
            
            {formData.excludedTests.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.excludedTests.map((test, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800"
                  >
                    {test}
                    <button
                      type="button"
                      onClick={() => removeExcludedTest(index)}
                      className="ml-2 text-red-600 hover:text-red-900"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* FAQs */}
          <div className="border-t pt-4">
            <div 
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setShowFAQs(!showFAQs)}
            >
              <h3 className="text-lg font-medium">FAQs</h3>
              {showFAQs ? <ChevronUp /> : <ChevronDown />}
            </div>
            
            {showFAQs && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Question *
                    </label>
                    <input
                      type="text"
                      value={newFAQ.question}
                      onChange={(e) => setNewFAQ({...newFAQ, question: e.target.value})}
                      className="w-full p-2 border rounded-md"
                      placeholder="e.g., Is fasting required?"
                    />
                  </div>
                  
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Answer *
                    </label>
                    <input
                      type="text"
                      value={newFAQ.answer}
                      onChange={(e) => setNewFAQ({...newFAQ, answer: e.target.value})}
                      className="w-full p-2 border rounded-md"
                      placeholder="e.g., Yes, 8-10 hours of fasting is required."
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={addFAQ}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                      disabled={!newFAQ.question || !newFAQ.answer}
                    >
                      <Plus size={16} className="mr-1" /> Add FAQ
                    </button>
                  </div>
                </div>
                
                {formData.faqs.length > 0 && (
                  <div className="space-y-2">
                    {formData.faqs.map((faq, index) => (
                      <div key={index} className="border rounded-md p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">Q: {faq.question}</p>
                            <p className="text-gray-600 mt-1">A: {faq.answer}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFAQ(index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {testId ? 'Updating...' : 'Creating...'}
                </>
              ) : testId ? 'Update Test' : 'Create Test'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

AddLabTestModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  testId: PropTypes.string,
  onSuccess: PropTypes.func
};

export default AddLabTestModal;
