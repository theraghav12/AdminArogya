import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import API from '../services/api';

const REQUIRED_FIELDS = [
  'id',
  'productName',
  'sellingPrice',
  'manufacturer',
  'description',
  'packSize',
  'genericName',
];

const BulkUploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setError('');
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file.');
      return;
    }
    setParsing(true);
    setError('');
    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
      // Validate required fields
      const missingFields = REQUIRED_FIELDS.filter(field => !Object.keys(json[0] || {}).includes(field));
      if (missingFields.length > 0) {
        setError('Missing required fields in Excel: ' + missingFields.join(', '));
        setParsing(false);
        return;
      }
      // Convert images field from comma-separated string to array
      const processed = json.map(row => ({
        ...row,
        images: row.images ? row.images.split(',').map(url => url.trim()).filter(Boolean) : []
      }));
      // Send to backend
      const response = await API.post('/medicines/bulk-upload', { medicines: processed });
      onUploadSuccess(response.data);
      onClose();
    } catch (err) {
      setError('Error parsing or uploading file.');
      console.error(err);
    }
    setParsing(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
        <h2 className="text-lg font-bold mb-2">Bulk Upload Medicines from Excel</h2>
        <p className="mb-2 text-sm text-gray-700">Required columns in your Excel sheet:</p>
        <ul className="mb-4 list-disc list-inside text-sm text-gray-800">
          {REQUIRED_FIELDS.map(field => (
            <li key={field}><b>{field}</b></li>
          ))}
        </ul>
        <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} className="mb-4" />
        {error && <div className="mb-2 text-red-600 text-sm">{error}</div>}
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>
          <button onClick={handleUpload} disabled={parsing || !selectedFile} className="bg-green-600 text-white px-4 py-2 rounded">
            {parsing ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadModal;
