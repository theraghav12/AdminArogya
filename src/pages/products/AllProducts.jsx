import { useState, useEffect } from 'react';
import API from '../../services/api';
import { FaPlus, FaSearch, FaThLarge, FaThList, FaEdit, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import AddMedicineModal from '../../components/AddMedicineModal';
import MedicineCard from '../../components/MedicineCard';
import EditMedicineModal from '../../components/EditMedicineModal';

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('name_asc');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await API.get('/medicines/dashboard');
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching products:', err);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort products based on search term and sort criteria
  useEffect(() => {
    let result = [...products];
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(product => 
        (product.name || '').toLowerCase().includes(searchLower) ||
        (product.brandName || '').toLowerCase().includes(searchLower) ||
        (product.manufacturer || '').toLowerCase().includes(searchLower) ||
        (product.category || '').toLowerCase().includes(searchLower) ||
        (product.genericName || '').toLowerCase().includes(searchLower)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name_asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'name_desc':
          return (b.name || '').localeCompare(a.name || '');
        case 'price_asc':
          return (a.pricing?.mrp || 0) - (b.pricing?.mrp || 0);
        case 'price_desc':
          return (b.pricing?.mrp || 0) - (a.pricing?.mrp || 0);
        case 'stock_asc':
          return (a.stock?.quantity || 0) - (b.stock?.quantity || 0);
        case 'stock_desc':
          return (b.stock?.quantity || 0) - (a.stock?.quantity || 0);
        default:
          return 0;
      }
    });
    
    setFilteredProducts(result);
  }, [products, searchTerm, sortBy]);
  
  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await API.delete(`/medicines/${id}`);
      setProducts(prev => prev.filter(product => product._id !== id));
      toast.success('Product deleted successfully');
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error('Failed to delete product');
    }
  };

  const handleAddMedicine = async (newMedicine) => {
    try {
      const response = await API.post('/medicines', newMedicine);
      setProducts(prev => [response.data.medicine, ...prev]);
      setIsAddModalOpen(false);
      toast.success('Medicine added successfully');
    } catch (err) {
      console.error('Error adding medicine:', err);
      toast.error('Failed to add medicine');
    }
  };

  const handleUpdateMedicine = async (updatedMedicine) => {
    try {
      const response = await API.put(`/medicines/${updatedMedicine._id}`, updatedMedicine);
      setProducts(prev => 
        prev.map(med => med._id === updatedMedicine._id ? response.data.medicine : med)
      );
      setIsEditModalOpen(false);
      setSelectedProduct(null);
      toast.success('Medicine updated successfully');
    } catch (err) {
      console.error('Error updating medicine:', err);
      toast.error('Failed to update medicine');
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {searchTerm ? 'Search Results' : 'All Products'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
            {searchTerm && ` for "${searchTerm}"`}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, brand, or category..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm font-medium rounded-l-lg border ${
                  viewMode === 'grid'
                    ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
                title="Grid view"
              >
                <FaThLarge />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm font-medium rounded-r-lg border ${
                  viewMode === 'list'
                    ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
                title="List view"
              >
                <FaThList />
              </button>
            </div>
            
            <div className="relative">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="name_asc">Name (A-Z)</option>
                <option value="name_desc">Name (Z-A)</option>
                <option value="price_asc">Price (Low to High)</option>
                <option value="price_desc">Price (High to Low)</option>
                <option value="stock_asc">Stock (Low to High)</option>
                <option value="stock_desc">Stock (High to Low)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors whitespace-nowrap"
            >
              <FaPlus className="mr-2" />
              Add Product
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          {viewMode === 'grid' ? (
            <div className="p-6">
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <MedicineCard
                      key={product._id}
                      medicine={{
                        ...product,
                        name: product.name || product.productName,
                        manufacturer: product.manufacturer || 'Generic',
                        category: product.category || 'Uncategorized',
                        pricing: product.pricing || { 
                          mrp: product.price || 0,
                          sellingPrice: product.price || 0,
                          discount: 0
                        },
                        stock: product.stock || { quantity: product.stockQuantity || 0 },
                        packaging: product.packaging || {
                          packSize: product.packSize || 'N/A',
                          expiryDate: product.expiryDate
                        },
                        images: product.images || (product.imageUrl ? [product.imageUrl] : []),
                        imageUrl: product.imageUrl,
                        genericName: product.genericName
                      }}
                      onEdit={() => {
                        setSelectedProduct(product);
                        setIsEditModalOpen(true);
                      }}
                      onDelete={handleDelete}
                      onView={() => {
                        setSelectedProduct(product);
                        setIsEditModalOpen(true);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-gray-100 dark:bg-gray-700">
                    <FaSearch className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No products found</h3>
                  <p className="mt-1 text-gray-500 dark:text-gray-400">
                    {searchTerm 
                      ? 'No products match your search criteria.' 
                      : 'Get started by adding a new product.'}
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FaPlus className="-ml-1 mr-2 h-4 w-4" />
                      Add Product
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Product
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Stock
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => {
                      const productName = product.name || product.productName || 'Unnamed Product';
                      const manufacturer = product.manufacturer || 'Unknown Manufacturer';
                      const category = product.category || 'Uncategorized';
                      const price = product.price || (product.pricing && product.pricing.mrp) || 0;
                      const stock = product.stock?.quantity || (product.stockQuantity !== undefined ? product.stockQuantity : 0);
                      const image = product.images?.[0] || product.imageUrl || 'https://via.placeholder.com/40';

                      return (
                        <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img 
                                  className="h-10 w-10 rounded-md object-cover" 
                                  src={image} 
                                  alt={productName}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/40';
                                  }}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {productName}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {manufacturer}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {category}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              ₹{typeof price === 'number' ? price.toFixed(2) : '0.00'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              stock > 10 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                : stock > 0 
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {stock > 0 ? `${stock} in stock` : 'Out of stock'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <button
                              onClick={() => {
                                setSelectedProduct(product);
                                setIsEditModalOpen(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              title="View Details"
                            >
                              <FaSearch className="inline" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedProduct(product);
                                setIsEditModalOpen(true);
                              }}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                              title="Edit"
                            >
                              <FaEdit className="inline" />
                            </button>
                            <button
                              onClick={() => handleDelete(product._id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title="Delete"
                            >
                              <FaTrash className="inline" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-gray-100 dark:bg-gray-700">
                          <FaSearch className="h-12 w-12 text-gray-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No products found</h3>
                        <p className="mt-1 text-gray-500 dark:text-gray-400">
                          {searchTerm 
                            ? 'No products match your search criteria.' 
                            : 'Get started by adding a new product.'}
                        </p>
                        <div className="mt-6">
                          <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <FaPlus className="-ml-1 mr-2 h-4 w-4" />
                            Add Product
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add Medicine Modal */}
      <AddMedicineModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddMedicine}
      />

      {/* Edit Medicine Modal */}
      {selectedProduct && (
        <EditMedicineModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedProduct(null);
          }}
          medicine={selectedProduct}
          onUpdate={handleUpdateMedicine}
        />
      )}
    </div>
  );
};

export default AllProducts;
