import API from './api';

/**
 * Create a new lab test
 * @param {Object} labTestData - Lab test data to create
 * @returns {Promise<Object>} Created lab test data
 */
export const createLabTest = async (labTestData) => {
  try {
    console.log('Sending lab test data:', JSON.stringify(labTestData, null, 2));
    const response = await API.post('/lab-tests', labTestData);
    return response.data;
  } catch (error) {
    console.error('Error creating lab test:', error);
    
    // Log the full error response for debugging
    if (error.response) {
      console.error('Full error response:', JSON.stringify(error.response.data, null, 2));
      
      // Handle validation errors
      if (error.response.status === 400 && error.response.data.errors) {
        console.error('Validation errors:', error.response.data.errors);
        const validationErrors = error.response.data.errors.map(err => ({
          field: err.param || err.path || 'unknown',
          message: err.msg || err.message || 'Validation error'
        }));
        throw { 
          message: 'Validation failed',
          errors: validationErrors
        };
      }
      
      // Handle other types of errors
      throw error.response.data.message || error.message || 'Failed to create lab test';
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      throw 'No response received from server. Please check your connection.';
    } else {
      // Something happened in setting up the request
      console.error('Request setup error:', error.message);
      throw error.message || 'Failed to create lab test';
    }
  }
};

/**
 * Update an existing lab test
 * @param {string} id - Lab test ID
 * @param {Object} labTestData - Updated lab test data
 * @returns {Promise<Object>} Updated lab test data
 */
export const updateLabTest = async (id, labTestData) => {
  try {
    console.log(`Updating lab test ${id} with data:`, JSON.stringify(labTestData, null, 2));
    const response = await API.put(`/lab-tests/${id}`, labTestData);
    return response.data;
  } catch (error) {
    console.error('Error updating lab test:', error);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response data:', error.response.data);
      console.error('Status code:', error.response.status);
      console.error('Headers:', error.response.headers);
      
      // Handle validation errors
      if (error.response.status === 400 && error.response.data.errors) {
        const validationErrors = error.response.data.errors.map(err => ({
          field: err.param || err.path || 'unknown',
          message: err.msg || err.message || 'Validation error'
        }));
        throw { 
          message: 'Validation failed',
          errors: validationErrors
        };
      }
      
      throw error.response.data.message || error.message || 'Failed to update lab test';
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      throw 'No response received from server. Please check your connection.';
    } else {
      // Something happened in setting up the request
      console.error('Request setup error:', error.message);
      throw error.message || 'Failed to update lab test';
    }
  }
};

/**
 * Get all lab tests with optional filters
 * @param {Object} params - Query parameters for filtering and pagination
 * @returns {Promise<Object>} Object containing lab tests and pagination info
 */
export const getLabTests = async (params = {}) => {
  try {
    const response = await API.get('/lab-tests', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching lab tests:', error);
    throw error.response?.data?.message || 'Failed to fetch lab tests';
  }
};

/**
 * Get a single lab test by ID
 * @param {string} id - Lab test ID
 * @returns {Promise<Object>} Lab test data
 */
export const getLabTestById = async (id) => {
  try {
    const response = await API.get(`/lab-tests/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching lab test:', error);
    throw error.response?.data?.message || 'Failed to fetch lab test';
  }
};

/**
 * Delete a lab test
 * @param {string} id - Lab test ID to delete
 * @returns {Promise<Object>} Deletion status
 */
export const deleteLabTest = async (id) => {
  try {
    const response = await API.delete(`/lab-tests/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting lab test:', error);
    throw error.response?.data?.message || 'Failed to delete lab test';
  }
};

/**
 * Get all available lab test categories
 * @returns {Promise<Array>} Array of category names
 */
export const getLabTestCategories = async () => {
  try {
    const response = await API.get('/lab-tests/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching lab test categories:', error);
    // Return default categories if API fails
    return [
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
  }
};

/**
 * Search lab tests by query string
 * @param {string} query - Search query
 * @param {Object} filters - Additional filters
 * @returns {Promise<Array>} Array of matching lab tests
 */
export const searchLabTests = async (query, filters = {}) => {
  try {
    const response = await API.get('/lab-tests/search', {
      params: { q: query, ...filters }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching lab tests:', error);
    throw error.response?.data?.message || 'Failed to search lab tests';
  }
};

/**
 * Update lab test status
 * @param {string} id - Lab test ID
 * @param {string} status - New status (active/inactive/temporarily_unavailable)
 * @returns {Promise<Object>} Updated lab test data
 */
export const updateLabTestStatus = async (id, status) => {
  try {
    const response = await API.patch(`/lab-tests/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating lab test status:', error);
    throw error.response?.data?.message || 'Failed to update lab test status';
  }
};

/**
 * Bulk update lab tests
 * @param {Array<string>} ids - Array of lab test IDs
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Bulk update result
 */
export const bulkUpdateLabTests = async (ids, updates) => {
  try {
    const response = await API.patch('/lab-tests/bulk-update', { ids, updates });
    return response.data;
  } catch (error) {
    console.error('Error bulk updating lab tests:', error);
    throw error.response?.data?.message || 'Failed to bulk update lab tests';
  }
};

/**
 * Bulk delete lab tests
 * @param {Array<string>} ids - Array of lab test IDs to delete
 * @returns {Promise<Object>} Bulk delete result
 */
export const bulkDeleteLabTests = async (ids) => {
  try {
    const response = await API.post('/lab-tests/bulk-delete', { ids });
    return response.data;
  } catch (error) {
    console.error('Error bulk deleting lab tests:', error);
    throw error.response?.data?.message || 'Failed to bulk delete lab tests';
  }
};

/**
 * Export lab tests to CSV
 * @param {Object} filters - Filters to apply
 * @returns {Promise<Blob>} CSV file as Blob
 */
export const exportLabTestsToCSV = async (filters = {}) => {
  try {
    const response = await API.get('/lab-tests/export/csv', {
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting lab tests to CSV:', error);
    throw error.response?.data?.message || 'Failed to export lab tests to CSV';
  }
};

