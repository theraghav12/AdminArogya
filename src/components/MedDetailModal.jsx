import React from "react";

const Modal = ({ medicine, onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-96 p-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">{medicine.productName}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">X</button>
        </div>
        <div className="mt-4">
          <p><strong>Brand:</strong> {medicine.brandName}</p>
          <p><strong>Composition:</strong> {JSON.stringify(medicine.composition)}</p>
          <p><strong>Dosage:</strong> {JSON.stringify(medicine.dosage)}</p>
          <p><strong>Pricing:</strong> Rs. {medicine.pricing?.sellingPrice || 'N/A'}</p>
          <p><strong>Stock:</strong> {medicine.stock?.quantity || 0}</p>
          <p><strong>Pack Size:</strong> {medicine.packaging?.packSize || 'N/A'}</p>
          <p><strong>Expiry Date:</strong> {medicine.packaging?.expiryDate || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
};

export default Modal;
