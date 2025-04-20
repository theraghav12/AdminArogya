import { useState, useEffect } from 'react';
import MedicineCard from '../components/MedicineCard';
import AddMedicineModal from '../components/AddMedicineModal';

const MedicineList = () => {
  const [medicines, setMedicines] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedicines = async () => {
      const token = localStorage.getItem('adminToken'); // Get token from localStorage
      if(!token){
        console.error('No admin token');
        return;
      }
      

      try {
        const response = await fetch('http://localhost:5000/api/medicines/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`, // Include token in Authorization header
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch medicines');
        }

        const data = await response.json();
        setMedicines(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching medicines:', error);
        setLoading(false);
      }
    };

    fetchMedicines();
  }, []);

  const handleAddMedicine = (newMedicine) => {
    setMedicines([newMedicine, ...medicines]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Medicine Inventory</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md transition duration-300"
        >
          Add New Medicine
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {medicines.map((medicine) => (
            <MedicineCard key={medicine._id} medicine={medicine} />
          ))}
        </div>
      )}

      <AddMedicineModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddMedicine}
      />
    </div>
  );
};

export default MedicineList;
