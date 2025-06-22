import { FaEdit, FaTrash, FaInfoCircle, FaPills, FaBox } from 'react-icons/fa';
import { MdDiscount } from 'react-icons/md';
import { useState } from 'react';

const MedicineCard = ({ 
  medicine, 
  onEdit, 
  onDelete,
  onView 
}) => {
  const [showDetails, setShowDetails] = useState(false);
  
  // Extract product information with fallbacks
  const productName = medicine.name || medicine.productName || 'Unnamed Product';
  const brandName = medicine.brandName || medicine.manufacturer || 'Generic';
  const category = medicine.category || 'Medicine';
  const description = medicine.description || 'No description available';
  
  // Extract pricing information with fallbacks
  const mrp = medicine.pricing?.mrp || medicine.price || 0;
  const sellingPrice = medicine.pricing?.sellingPrice || medicine.price || 0;
  const discount = medicine.pricing?.discount || 0;
  const hasDiscount = discount > 0;
  const discountPercentage = hasDiscount 
    ? Math.round(((mrp - sellingPrice) / mrp) * 100) 
    : 0;
  
  // Extract stock information with fallbacks
  const stockQuantity = medicine.stock?.quantity || medicine.stockQuantity || 0;
  const isOutOfStock = stockQuantity <= 0;
  const isLowStock = !isOutOfStock && stockQuantity < 10;
  const stockStatus = isOutOfStock 
    ? 'Out of Stock' 
    : isLowStock 
      ? `Low Stock (${stockQuantity})` 
      : 'In Stock';

  // Extract packaging information with fallbacks
  const packSize = medicine.packaging?.packSize || medicine.packSize || 'N/A';
  const expiryDate = medicine.packaging?.expiryDate || medicine.expiryDate;
  const expiryStatus = expiryDate 
    ? new Date(expiryDate).toLocaleDateString()
    : 'N/A';

  // Handle image error
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
  };

  // Format price with Indian Rupee symbol
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Image Section */}
      <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center overflow-hidden group">
        {medicine.images?.[0] || medicine.imageUrl ? (
          <img 
            src={medicine.images?.[0] || medicine.imageUrl} 
            alt={productName} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={handleImageError}
          />
        ) : (
          <div className="flex flex-col items-center text-gray-300 dark:text-gray-600">
            <FaPills className="text-4xl mb-2" />
            <span className="text-sm">No Image Available</span>
          </div>
        )}
        
        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
            <MdDiscount className="mr-1" />
            {discountPercentage}% OFF
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {category}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2" title={productName}>
          {productName}
        </h3>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          {brandName}
          {medicine.genericName && ` (${medicine.genericName})`}
        </p>

        {/* Price Section */}
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-baseline">
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {formatPrice(sellingPrice)}
              </span>
              {hasDiscount && (
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 line-through">
                  {formatPrice(mrp)}
                </span>
              )}
            </div>
            <span 
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isOutOfStock 
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  : isLowStock
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              }`}
            >
              {stockStatus}
            </span>
          </div>

          {/* Details Section */}
          {showDetails && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <p className="flex items-center">
                <FaPills className="mr-2 text-blue-500" />
                <span className="font-medium">Dosage:</span> {medicine.dosage?.form || 'N/A'}
                {medicine.dosage?.strength && ` (${medicine.dosage.strength})`}
              </p>
              <p className="flex items-center">
                <FaBox className="mr-2 text-blue-500" />
                <span className="font-medium">Pack Size:</span> {packSize}
              </p>
              <p>
                <span className="font-medium">Expiry:</span> {expiryStatus}
              </p>
              <p className="line-clamp-2">
                <span className="font-medium">Description:</span> {description}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-4 flex justify-between space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onView) onView(medicine);
                else setShowDetails(!showDetails);
              }}
              className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <FaInfoCircle className="mr-2" />
              {showDetails ? 'Hide Details' : 'View Details'}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onEdit) onEdit(medicine);
              }}
              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
              title="Edit"
            >
              <FaEdit />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onDelete && window.confirm('Are you sure you want to delete this product?')) {
                  onDelete(medicine._id || medicine.id);
                }
              }}
              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg transition-colors"
              title="Delete"
            >
              <FaTrash />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicineCard;
