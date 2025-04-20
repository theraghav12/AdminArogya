const MedicineCard = ({ medicine, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 overflow-hidden">
      <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
        {medicine.images?.[0] ? (
          <img src={medicine.images[0]} alt={medicine.productName} className="w-full h-full object-cover" />
        ) : (
          <span className="text-gray-400">No Image Available</span>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-1">{medicine.productName}</h3>
        <p className="text-gray-600 mb-2">{medicine.brandName}</p>

        <div className="flex justify-between items-center mt-4">
          <span className="text-lg font-bold text-blue-600">
            Rs. {medicine.pricing?.sellingPrice || 'N/A'}
          </span>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              medicine.stock?.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {medicine.stock?.available ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>

        <div className="mt-2 text-sm text-gray-700">
          <p>
            <strong>Pack Size:</strong> {medicine.packaging?.packSize || 'Not Available'}
          </p>
          <p>
            <strong>Expiry Date:</strong>{' '}
            {medicine.packaging?.expiryDate
              ? new Date(medicine.packaging.expiryDate).toLocaleDateString()
              : 'Not Available'}
          </p>
        </div>

        <div className="flex justify-between mt-4">
          <button onClick={onEdit} className="text-blue-500 hover:text-blue-700">
            <i className="fa fa-edit"></i> Edit
          </button>
          <button onClick={onDelete} className="text-red-500 hover:text-red-700">
            <i className="fa fa-trash"></i> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedicineCard;
