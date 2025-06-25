import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Filter, Download, ChevronDown, ChevronRight } from 'lucide-react';
import { getLabTests, deleteLabTest } from '../services/labTestService';
import { toast } from 'react-toastify';
import AddLabTestModal from '../components/AddLabTestModal';

const LabTests = () => {
  const [labTests, setLabTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
  });
  const [expandedTest, setExpandedTest] = useState(null);

  // Fetch lab tests
  const fetchLabTests = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (searchTerm) params.search = searchTerm;
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.category !== 'all') params.category = filters.category;
      
      const data = await getLabTests(params);
      setLabTests(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error('Error fetching lab tests:', error);
      toast.error('Failed to load lab tests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabTests();
  }, [searchTerm, filters]);

  // Handle delete test
  const handleDeleteTest = async (testId) => {
    if (window.confirm('Are you sure you want to delete this test? This action cannot be undone.')) {
      try {
        await deleteLabTest(testId);
        toast.success('Test deleted successfully');
        fetchLabTests(); // Refresh the list
      } catch (error) {
        console.error('Error deleting test:', error);
        toast.error(error.message || 'Failed to delete test');
      }
    }
  };

  // Handle edit test
  const handleEditTest = (test) => {
    setEditingTest(test);
    setIsAddModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsAddModalOpen(false);
    setEditingTest(null);
  };

  // Handle successful test creation/update
  const handleTestSaved = () => {
    fetchLabTests(); // Refresh the list
    handleModalClose();
  };

  // Toggle test details expansion
  const toggleTestExpansion = (testId) => {
    setExpandedTest(expandedTest === testId ? null : testId);
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'temporarily_unavailable':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  // Format status text
  const formatStatus = (status) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get unique categories for filter
  const categories = [
    'All',
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

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lab Tests</h1>
          <p className="text-gray-500">Manage and monitor all lab tests</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Test
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                placeholder="Search tests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="temporarily_unavailable">Temporarily Unavailable</option>
            </select>
          </div>
          
          <div>
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
            >
              {categories.map((category) => (
                <option key={category} value={category === 'All' ? 'all' : category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lab Tests Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : labTests.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tests found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filters.status !== 'all' || filters.category !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating a new test.'}
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                New Test
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Test Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {labTests.map((test) => (
                  <>
                    <tr 
                      key={test._id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleTestExpansion(test._id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <button 
                            className="mr-2 text-gray-500 hover:text-gray-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTestExpansion(test._id);
                            }}
                          >
                            {expandedTest === test._id ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{test.testName}</div>
                            <div className="text-xs text-gray-500">{test.testCode}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{test.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ₹{test.price.toFixed(2)}
                          {test.discount > 0 && (
                            <span className="ml-2 text-xs text-green-600">
                              {test.discount}% off
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(test.status)}`}>
                          {formatStatus(test.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditTest(test);
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTest(test._id);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expanded row with test details */}
                    {expandedTest === test._id && (
                      <tr className="bg-gray-50">
                        <td colSpan="5" className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Test Details</h4>
                              <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm">
                                <div className="flex">
                                  <dt className="w-32 text-gray-500">Test Code:</dt>
                                  <dd className="text-gray-900">{test.testCode}</dd>
                                </div>
                                <div className="flex">
                                  <dt className="w-32 text-gray-500">Category:</dt>
                                  <dd className="text-gray-900">{test.category}</dd>
                                </div>
                                <div className="flex">
                                  <dt className="w-32 text-gray-500">Report Time:</dt>
                                  <dd className="text-gray-900">{test.reportTime || 'N/A'}</dd>
                                </div>
                                <div className="flex">
                                  <dt className="w-32 text-gray-500">Home Collection:</dt>
                                  <dd className="text-gray-900">
                                    {test.isHomeCollectionAvailable 
                                      ? `Yes (₹${test.homeCollectionPrice?.toFixed(2) || '0.00'})` 
                                      : 'No'}
                                  </dd>
                                </div>
                              </dl>
                              
                              {test.preparation && (
                                <div className="mt-4">
                                  <h4 className="text-sm font-medium text-gray-900 mb-1">Preparation</h4>
                                  <p className="text-sm text-gray-600">{test.preparation}</p>
                                </div>
                              )}
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Pricing</h4>
                              <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm">
                                <div className="flex justify-between">
                                  <dt className="text-gray-500">Base Price:</dt>
                                  <dd className="text-gray-900">₹{test.price?.toFixed(2) || '0.00'}</dd>
                                </div>
                                {test.discount > 0 && (
                                  <div className="flex justify-between">
                                    <dt className="text-gray-500">Discount ({test.discount}%):</dt>
                                    <dd className="text-green-600">-₹{((test.price * test.discount) / 100).toFixed(2)}</dd>
                                  </div>
                                )}
                                <div className="flex justify-between font-medium border-t pt-2 mt-1">
                                  <dt className="text-gray-700">Final Price:</dt>
                                  <dd className="text-gray-900">
                                    ₹{(test.price - (test.price * (test.discount || 0)) / 100).toFixed(2)}
                                  </dd>
                                </div>
                              </dl>
                              
                              {test.parameters?.length > 0 && (
                                <div className="mt-4">
                                  <h4 className="text-sm font-medium text-gray-900 mb-2">Parameters ({test.parameters.length})</h4>
                                  <div className="space-y-2">
                                    {test.parameters.slice(0, 3).map((param, idx) => (
                                      <div key={idx} className="text-sm text-gray-600">
                                        {param.name} 
                                        {param.referenceRange && ` (${param.referenceRange})`}
                                      </div>
                                    ))}
                                    {test.parameters.length > 3 && (
                                      <div className="text-sm text-blue-600">+{test.parameters.length - 3} more</div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AddLabTestModal
        isOpen={isAddModalOpen}
        onClose={handleModalClose}
        testId={editingTest?._id}
        onSuccess={handleTestSaved}
      />
    </div>
  );
};

export default LabTests;
