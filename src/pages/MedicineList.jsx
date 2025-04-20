import { useState, useEffect } from 'react';
import API from '../services/api';
import MedicineCard from '../components/MedicineCard';
import AddMedicineModal from '../components/AddMedicineModal';
import EditMedicineModal from '../components/EditMedicineModal';

const MedicineList = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const res = await API.get('/medicines/dashboard');
      setMedicines(res.data);
    } catch (err) {
      console.error('Error fetching medicines:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this medicine?')) return;
    try {
      await API.delete(`/medicines/${id}`);
      setMedicines((prev) => prev.filter((med) => med._id !== id));
    } catch (err) {
      console.error('Error deleting medicine:', err);
    }
  };

  const handleEdit = (medicine) => {
    setSelectedMedicine(medicine);
  };

  const handleAddMedicine = (newMedicine) => {
    setMedicines([newMedicine, ...medicines]);
  };

  const handleUpdateMedicine = (updatedMedicine) => {
    setMedicines((prev) =>
      prev.map((med) => (med._id === updatedMedicine._id ? updatedMedicine : med))
    );
    setSelectedMedicine(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Medicine Inventory</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          Add New Medicine
        </button>
      </div>

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {medicines.map((medicine) => (
            <MedicineCard
              key={medicine._id}
              medicine={medicine}
              onEdit={() => handleEdit(medicine)}
              onDelete={() => handleDelete(medicine._id)}
            />
          ))}
        </div>
      )}

      <AddMedicineModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddMedicine}
      />

      {selectedMedicine && (
        <EditMedicineModal
          medicine={selectedMedicine}
          onClose={() => setSelectedMedicine(null)}
          onUpdate={handleUpdateMedicine}
        />
      )}
    </div>
  );
};

export default MedicineList;
