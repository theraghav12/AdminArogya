import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Grid,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  MenuItem,
  DialogActions,
  Snackbar,
  Alert,
  Chip,
  IconButton
} from '@mui/material';

import { RemoveCircle } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const ProductsPage = () => {
  const [medicines, setMedicines] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [newMedicine, setNewMedicine] = useState({
    productName: '',
    genericName: '',
    brandName: '',
    manufacturer: '',
    images: [],
    description: '',
    category: 'OTC',
    prescriptionRequired: false,
    composition: {
      activeIngredients: [''],
      inactiveIngredients: ['']
    },
    dosage: {
      form: '',
      strength: '',
      recommendedDosage: ''
    },
    pricing: {
      mrp: 0,
      discount: 0,
      sellingPrice: 0
    },
    stock: {
      available: true,
      quantity: 0,
      minOrderQuantity: 1
    },
    packaging: {
      packSize: '',
      expiryDate: '',
      storageInstructions: ''
    },
    regulatory: {
      drugType: '',
      sideEffects: [''],
      warnings: [''],
      contraindications: [''],
      interactions: ['']
    }
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const response = await API.get('/medicines/dashboard');
      setMedicines(response.data);
    } catch (error) {
      console.error('Error fetching medicines:', error);
      setSnackbarMessage('Failed to fetch medicines');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleAddMedicine = () => {
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setNewMedicine({
      productName: '',
      genericName: '',
      brandName: '',
      manufacturer: '',
      images: [],
      description: '',
      category: 'OTC',
      prescriptionRequired: false,
      composition: {
        activeIngredients: [''],
        inactiveIngredients: ['']
      },
      dosage: {
        form: '',
        strength: '',
        recommendedDosage: ''
      },
      pricing: {
        mrp: 0,
        discount: 0,
        sellingPrice: 0
      },
      stock: {
        available: true,
        quantity: 0,
        minOrderQuantity: 1
      },
      packaging: {
        packSize: '',
        expiryDate: '',
        storageInstructions: ''
      },
      regulatory: {
        drugType: '',
        sideEffects: [''],
        warnings: [''],
        contraindications: [''],
        interactions: ['']
      }
    });
    setSelectedImages([]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested objects
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setNewMedicine(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setNewMedicine(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleArrayChange = (arrayName, index, value) => {
    setNewMedicine(prev => {
      const newArray = [...prev[arrayName]];
      newArray[index] = value;
      return {
        ...prev,
        [arrayName]: newArray
      };
    });
  };

  const handleAddArrayItem = (arrayName) => {
    setNewMedicine(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], '']
    }));
  };

  const handleRemoveArrayItem = (arrayName, index) => {
    setNewMedicine(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index)
    }));
  };

  const handleImageChange = (e) => {
    setSelectedImages([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      
      // Append all medicine data
      formData.append('productName', newMedicine.productName);
      formData.append('genericName', newMedicine.genericName);
      formData.append('brandName', newMedicine.brandName);
      formData.append('manufacturer', newMedicine.manufacturer);
      formData.append('description', newMedicine.description);
      formData.append('category', newMedicine.category);
      formData.append('prescriptionRequired', newMedicine.prescriptionRequired);
      
      // Append composition
      formData.append('composition[activeIngredients]', JSON.stringify(newMedicine.composition.activeIngredients));
      formData.append('composition[inactiveIngredients]', JSON.stringify(newMedicine.composition.inactiveIngredients));
      
      // Append dosage
      formData.append('dosage[form]', newMedicine.dosage.form);
      formData.append('dosage[strength]', newMedicine.dosage.strength);
      formData.append('dosage[recommendedDosage]', newMedicine.dosage.recommendedDosage);
      
      // Append pricing
      formData.append('pricing[mrp]', newMedicine.pricing.mrp);
      formData.append('pricing[discount]', newMedicine.pricing.discount);
      formData.append('pricing[sellingPrice]', newMedicine.pricing.sellingPrice);
      
      // Append stock
      formData.append('stock[available]', newMedicine.stock.available);
      formData.append('stock[quantity]', newMedicine.stock.quantity);
      formData.append('stock[minOrderQuantity]', newMedicine.stock.minOrderQuantity);
      
      // Append packaging
      formData.append('packaging[packSize]', newMedicine.packaging.packSize);
      formData.append('packaging[expiryDate]', newMedicine.packaging.expiryDate);
      formData.append('packaging[storageInstructions]', newMedicine.packaging.storageInstructions);
      
      // Append regulatory
      formData.append('regulatory[drugType]', newMedicine.regulatory.drugType);
      formData.append('regulatory[sideEffects]', JSON.stringify(newMedicine.regulatory.sideEffects));
      formData.append('regulatory[warnings]', JSON.stringify(newMedicine.regulatory.warnings));
      formData.append('regulatory[contraindications]', JSON.stringify(newMedicine.regulatory.contraindications));
      formData.append('regulatory[interactions]', JSON.stringify(newMedicine.regulatory.interactions));
      
      // Append images
      selectedImages.forEach(image => {
        formData.append('images', image);
      });

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      };

      await API.post('/medicines/add', formData, config);
      
      setSnackbarMessage('Medicine added successfully');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      fetchMedicines();
      handleCloseAddDialog();
    } catch (error) {
      console.error('Error adding medicine:', error);
      setSnackbarMessage('Failed to add medicine');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleViewDetails = (id) => {
    navigate(`/medicines/${id}`);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Medicine Products
      </Typography>
      
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleAddMedicine}
        sx={{ mb: 3 }}
      >
        Add Medicine
      </Button>
      
      <Grid container spacing={3}>
        {medicines.map((medicine) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={medicine._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {medicine.images && medicine.images.length > 0 && (
                <CardMedia
                  component="img"
                  height="140"
                  image={medicine.images[0]}
                  alt={medicine.productName}
                />
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="div">
                  {medicine.productName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {medicine.brandName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {medicine.category}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {medicine.dosage.form} - {medicine.dosage.strength}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  MRP: ₹{medicine.pricing.mrp} (₹{medicine.pricing.sellingPrice} after {medicine.pricing.discount}% off)
                </Typography>
                <Chip
                  label={medicine.stock.available ? 'In Stock' : 'Out of Stock'}
                  color={medicine.stock.available ? 'success' : 'error'}
                  size="small"
                  sx={{ mt: 1 }}
                />
                {medicine.prescriptionRequired && (
                  <Chip
                    label="Prescription Required"
                    color="warning"
                    size="small"
                    sx={{ mt: 1, ml: 1 }}
                  />
                )}
              </CardContent>
              <Button
                size="small"
                onClick={() => handleViewDetails(medicine._id)}
                sx={{ mb: 2 }}
              >
                View Details
              </Button>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add Medicine Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="md" fullWidth>
        <DialogTitle>Add New Medicine</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Product Name"
                  name="productName"
                  value={newMedicine.productName}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Generic Name"
                  name="genericName"
                  value={newMedicine.genericName}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Brand Name"
                  name="brandName"
                  value={newMedicine.brandName}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Manufacturer"
                  name="manufacturer"
                  value={newMedicine.manufacturer}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={newMedicine.description}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Category"
                  name="category"
                  value={newMedicine.category}
                  onChange={handleInputChange}
                  required
                >
                  <MenuItem value="OTC">OTC</MenuItem>
                  <MenuItem value="Prescription">Prescription</MenuItem>
                  <MenuItem value="Ayurvedic">Ayurvedic</MenuItem>
                  <MenuItem value="Homeopathic">Homeopathic</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Prescription Required"
                  name="prescriptionRequired"
                  value={newMedicine.prescriptionRequired}
                  onChange={(e) => setNewMedicine({...newMedicine, prescriptionRequired: e.target.value === 'true'})}
                  required
                >
                  <MenuItem value={true}>Yes</MenuItem>
                  <MenuItem value={false}>No</MenuItem>
                </TextField>
              </Grid>
              
              {/* Composition */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Composition</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Active Ingredients</Typography>
                {newMedicine.composition.activeIngredients.map((ingredient, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <TextField
                      fullWidth
                      value={ingredient}
                      onChange={(e) => {
                        const newIngredients = [...newMedicine.composition.activeIngredients];
                        newIngredients[index] = e.target.value;
                        setNewMedicine({
                          ...newMedicine,
                          composition: {
                            ...newMedicine.composition,
                            activeIngredients: newIngredients
                          }
                        });
                      }}
                      required
                    />
                    {index === newMedicine.composition.activeIngredients.length - 1 ? (
                      <IconButton onClick={() => handleAddArrayItem('composition.activeIngredients')}>
                        <AddIcon />
                      </IconButton>
                    ) : (
                      <IconButton onClick={() => handleRemoveArrayItem('composition.activeIngredients', index)}>
                        <RemoveCircle/>
                      </IconButton>
                    )}
                  </div>
                ))}
              </Grid>
              
              {/* Similar implementation for inactiveIngredients, dosage, pricing, etc. */}
              {/* ... */}
              
              {/* Images */}
              <Grid item xs={12}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="medicine-images"
                  type="file"
                  multiple
                  onChange={handleImageChange}
                />
                <label htmlFor="medicine-images">
                  <Button
                    variant="contained"
                    component="span"
                    startIcon={<CloudUploadIcon />}
                  >
                    Upload Images
                  </Button>
                </label>
                {selectedImages.length > 0 && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {selectedImages.length} image(s) selected
                  </Typography>
                )}
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProductsPage;