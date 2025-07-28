import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMagic, FaCheck, FaTimes, FaSpinner, FaSearch, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import API from '../../services/api';
import MedicineCard from '../../components/MedicineCard';

const AIProductEnhancement = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [suggestedFields, setSuggestedFields] = useState([]);
  const [selectedFields, setSelectedFields] = useState([]);
  const [isLoadingFields, setIsLoadingFields] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await API.get('/medicines/dashboard');
      setProducts(res.data);
      setFilteredProducts(res.data);
    } catch (err) {
      console.error('Error fetching products:', err);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Get available fields for autofill
  const fetchAvailableFields = async () => {
    try {
      const res = await API.get('/ai/options');
      // Make sure we're getting an array of fields
      const fields = Array.isArray(res.data) ? res.data : 
                  (res.data && Array.isArray(res.data.data) ? res.data.data : []);
      setSuggestedFields(fields);
    } catch (err) {
      console.error('Error fetching fields:', err);
      toast.error('Failed to load available fields');
      setSuggestedFields([]); // Ensure it's always an array
    }
  };

  // Handle search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(products);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = products.filter(product => 
      (product.name || '').toLowerCase().includes(searchLower) ||
      (product.brandName || '').toLowerCase().includes(searchLower) ||
      (product.manufacturer || '').toLowerCase().includes(searchLower) ||
      (product.category || '').toLowerCase().includes(searchLower) ||
      (product.genericName || '').toLowerCase().includes(searchLower)
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  // Initial data fetch
  useEffect(() => {
    fetchProducts();
    fetchAvailableFields();
  }, []);

  // Toggle field selection
  const toggleField = (fieldId) => {
    setSelectedFields(prev => 
      prev.includes(fieldId)
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  // Generate content for selected fields
  const generateContent = async () => {
    if (!selectedProduct || selectedFields.length === 0) return;
    
    setIsGenerating(true);
    try {
      const res = await API.post(`/medicines/${selectedProduct._id}/autofill`, {
        fields: selectedFields
      });
      
      setGeneratedData(res.data.data);
      toast.success(`Generated content for ${res.data.updatedFields.length} fields`);
    } catch (err) {
      console.error('Error generating content:', err);
      toast.error(err.response?.data?.message || 'Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  // Save generated content
  const saveChanges = async () => {
    if (!generatedData) return;
    
    setIsSaving(true);
    try {
      await API.put(`/medicines/${selectedProduct._id}`, generatedData);
      toast.success('Product updated successfully');
      setSelectedProduct(null);
      setGeneratedData(null);
      setSelectedFields([]);
      fetchProducts();
    } catch (err) {
      console.error('Error saving changes:', err);
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  // Group fields by category
  const fieldsByCategory = (suggestedFields || []).reduce((acc, field) => {
    if (field && field.category) {
      if (!acc[field.category]) {
        acc[field.category] = [];
      }
      acc[field.category].push(field);
    }
    return acc;
  }, {});

  if (selectedProduct) {
    return (
      <div className="p-6">
        <button 
          onClick={() => setSelectedProduct(null)}
          className="flex items-center text-blue-600 mb-6 hover:text-blue-800"
        >
          <FaArrowLeft className="mr-2" /> Back to Products
        </button>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">
            AI-Enhance: {selectedProduct.name || 'Product'}
          </h2>
          
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Select Fields to Generate</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(fieldsByCategory).map(([category, fields]) => (
                <div key={category} className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-2">{category}</h4>
                  <div className="space-y-2">
                    {fields.map((field) => (
                      <label key={field.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedFields.includes(field.id)}
                          onChange={() => toggleField(field.id)}
                          className="rounded text-blue-600"
                        />
                        <span>{field.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={generateContent}
              disabled={selectedFields.length === 0 || isGenerating}
              className={`flex items-center px-4 py-2 rounded-md ${
                selectedFields.length === 0 || isGenerating
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isGenerating ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <FaMagic className="mr-2" />
                  Generate Content
                </>
              )}
            </button>

            <button
              onClick={() => setSelectedFields(suggestedFields.map(f => f.id))}
              className="px-4 py-2 border rounded-md hover:bg-gray-100"
            >
              Select All
            </button>

            <button
              onClick={() => setSelectedFields([])}
              className="px-4 py-2 border rounded-md hover:bg-gray-100"
            >
              Clear All
            </button>
          </div>

          {generatedData && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Generated Content</h3>
                <button
                  onClick={saveChanges}
                  disabled={isSaving}
                  className={`flex items-center px-4 py-2 rounded-md ${
                    isSaving ? 'bg-gray-300' : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isSaving ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm">
                  {JSON.stringify(generatedData, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">AI Product Enhancement</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md mb-4 md:mb-0 md:mr-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              className="pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-4xl text-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div 
                key={product._id} 
                className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedProduct(product)}
              >
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">
                    {product.productName || product.name || 'Unnamed Product'}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <span className="font-medium">Brand:</span>
                    <span className="ml-2">{product.brand || product.brandName || 'N/A'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <span className="font-medium">Category:</span>
                    <span className="ml-2">{product.category || 'N/A'}</span>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-blue-600 font-semibold">
                      {product.pricing?.mrp ? `₹${product.pricing.mrp}` : 'N/A'}
                    </span>
                    <button
                      className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProduct(product);
                      }}
                    >
                      <FaMagic className="mr-1" /> Enhance
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredProducts.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                No products found. Try adjusting your search.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIProductEnhancement;
