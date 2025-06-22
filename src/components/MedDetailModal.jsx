import React from "react";

const Modal = ({ medicine, onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-96 p-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">{medicine.productName}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">X</button>
        </div>
        <div className="mt-4 space-y-2 text-sm max-h-[70vh] overflow-y-auto">
          <div>
            <strong>Product Name:</strong> {medicine.productName}
          </div>
          <div>
            <strong>Brand:</strong> {medicine.brandName}
          </div>
          <div>
            <strong>Generic Name:</strong> {medicine.genericName}
          </div>
          <div>
            <strong>Manufacturer:</strong> {medicine.manufacturer}
          </div>
          <div>
            <strong>Description:</strong> {medicine.description}
          </div>
          <div>
            <strong>Category:</strong> {medicine.category}
          </div>
          <div>
            <strong>Prescription Required:</strong> {medicine.prescriptionRequired ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Composition:</strong> <pre className="whitespace-pre-wrap bg-gray-100 rounded p-1">{JSON.stringify(medicine.composition, null, 2)}</pre>
          </div>
          <div>
            <strong>Dosage:</strong> <pre className="whitespace-pre-wrap bg-gray-100 rounded p-1">{JSON.stringify(medicine.dosage, null, 2)}</pre>
          </div>
          <div>
            <strong>Pricing:</strong> <br />
            MRP: Rs. {medicine.pricing?.mrp || 'N/A'}<br />
            Discount: {medicine.pricing?.discount || 0}%<br />
            Selling Price: Rs. {medicine.pricing?.sellingPrice || 'N/A'}
          </div>
          <div>
            <strong>Stock:</strong> <br />
            Quantity: {medicine.stock?.quantity || 0}<br />
            Min Order: {medicine.stock?.minOrderQuantity || 1}<br />
            Max Order: {medicine.stock?.maxOrderQuantity || 10}<br />
            In Stock: {medicine.stock?.available ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Packaging:</strong> <br />
            Pack Size: {medicine.packaging?.packSize || 'N/A'}<br />
            Expiry Date: {medicine.packaging?.expiryDate || 'N/A'}<br />
            Storage: {medicine.packaging?.storageInstructions || 'N/A'}
          </div>
          <div>
            <strong>Regulatory:</strong> <pre className="whitespace-pre-wrap bg-gray-100 rounded p-1">{JSON.stringify(medicine.regulatory, null, 2)}</pre>
          </div>
          <div>
            <strong>Additional Features:</strong>
            <pre className="whitespace-pre-wrap bg-gray-100 rounded p-1">{JSON.stringify(medicine.additionalFeatures, null, 2)}</pre>
          </div>
          {medicine.images && medicine.images.length > 0 && (
            <div>
              <strong>Images:</strong>
              <div className="flex gap-2 flex-wrap mt-1">
                {medicine.images.map((img, idx) => (
                  <img key={idx} src={img.url || img} alt="medicine" className="w-16 h-16 object-cover rounded border" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
