import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  MenuItem,
  Select,
  TextField,
  InputAdornment,
  Chip
} from '@mui/material';
import {
  Search,
  Delete,
  Edit,
  Payment,
} from '@mui/icons-material';
import API from '../services/api';
import { format, isValid, parseISO } from 'date-fns';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [searchTerm, statusFilter, orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await API.get('/admin/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showSnackbar('Failed to fetch orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let result = [...orders];
    const term = searchTerm.toLowerCase();

    if (term) {
      result = result.filter(order =>
        (order._id?.toLowerCase().includes(term)) ||
        (order.user?.name?.toLowerCase().includes(term)) ||
        (order.user?.email?.toLowerCase().includes(term))
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(result);
  };

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !selectedStatus) return;

    try {
      await API.put(`/admin/order/${selectedOrder._id}/status`, { status: selectedStatus });
      showSnackbar('Order status updated successfully', 'success');
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      showSnackbar('Failed to update order status', 'error');
    } finally {
      setOpenStatusDialog(false);
    }
  };

  const handlePaymentStatusUpdate = async () => {
    if (!selectedOrder || !paymentStatus) return;

    try {
      await API.put(`/admin/order/payment-status/${selectedOrder._id}`, { paymentStatus });
      showSnackbar('Payment status updated successfully', 'success');
      fetchOrders();
    } catch (error) {
      console.error('Error updating payment status:', error);
      showSnackbar('Failed to update payment status', 'error');
    } finally {
      setOpenPaymentDialog(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;

    try {
      await API.delete(`/admin/order/${orderId}`);
      showSnackbar('Order deleted successfully', 'success');
      fetchOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
      showSnackbar('Failed to delete order', 'error');
    }
  };

  const statusColors = {
    'Pending': 'warning',
    'Processing': 'info',
    'Shipped': 'primary',
    'Delivered': 'success',
    'Cancelled': 'error'
  };

  const paymentStatusColors = {
    'Completed': 'success',
    'Failed': 'error',
    'Pending': 'warning'
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
      return isValid(date) ? format(date, 'MMM dd, yyyy HH:mm') : 'Invalid Date';
    } catch {
      return 'Invalid Date';
    }
  };

  return (
    <Container 
      maxWidth="xl" 
      sx={{ 
        py: 4, 
        bgcolor: '#111827', 
        minHeight: '100vh',
        color: '#E5E7EB'
      }}
    >
      <Typography 
        variant="h4" 
        component="h1" 
        sx={{ 
          mb: 4, 
          fontWeight: 700,
          color: '#F9FAFB'
        }}
      >
        Orders Dashboard
      </Typography>

      <Card sx={{ 
        bgcolor: '#1F2937', 
        mb: 4, 
        border: '1px solid #374151',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <CardContent>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '16px', 
            marginBottom: '24px',
            '@media (min-width: 768px)': {
              flexDirection: 'row'
            }
          }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#9CA3AF' }} />
                  </InputAdornment>
                ),
                sx: {
                  color: '#F3F4F6',
                  bgcolor: '#111827',
                  borderRadius: '8px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#374151'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#4B5563'
                  }
                }
              }}
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              displayEmpty
              sx={{ 
                minWidth: 200,
                color: '#F3F4F6',
                bgcolor: '#111827',
                borderRadius: '8px',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#374151'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#4B5563'
                }
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: '#1F2937',
                    color: '#F3F4F6',
                    border: '1px solid #374151'
                  }
                }
              }}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Processing">Processing</MenuItem>
              <MenuItem value="Shipped">Shipped</MenuItem>
              <MenuItem value="Delivered">Delivered</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </Select>
          </div>

          <TableContainer 
            component={Paper} 
            sx={{ 
              bgcolor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px'
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#111827' }}>
                  <TableCell sx={{ color: '#F9FAFB', fontWeight: 600 }}>Order ID</TableCell>
                  <TableCell sx={{ color: '#F9FAFB', fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ color: '#F9FAFB', fontWeight: 600 }}>Customer</TableCell>
                  <TableCell sx={{ color: '#F9FAFB', fontWeight: 600 }}>Items</TableCell>
                  <TableCell sx={{ color: '#F9FAFB', fontWeight: 600 }}>Total</TableCell>
                  <TableCell sx={{ color: '#F9FAFB', fontWeight: 600 }}>Payment</TableCell>
                  <TableCell sx={{ color: '#F9FAFB', fontWeight: 600 }}>Status</TableCell>
                  <TableCell align="right" sx={{ color: '#F9FAFB', fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ color: '#9CA3AF', py: 4 }}>
                      Loading orders...
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ color: '#9CA3AF', py: 4 }}>
                      No orders match your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow 
                      key={order._id} 
                      hover 
                      sx={{ 
                        '&:hover': { bgcolor: '#1F2937' },
                        borderBottom: '1px solid #374151'
                      }}
                    >
                      <TableCell sx={{ color: '#E5E7EB' }}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {order._id || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ color: '#E5E7EB' }}>
                        {formatDate(order.orderedAt)}
                      </TableCell>
                      <TableCell sx={{ color: '#E5E7EB' }}>
                        <Typography>{order.userId?.name || 'Guest'}</Typography>
                        <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                          {order.contact}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                          {order.address}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ color: '#E5E7EB' }}>
                        {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                      </TableCell>
                      <TableCell sx={{ color: '#E5E7EB' }}>
                        ₹{order.totalAmount?.toFixed(2) || '0.00'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={order.paymentStatus}
                          color={paymentStatusColors[order.paymentStatus] || 'default'}
                          size="small"
                          sx={{ 
                            fontWeight: 500,
                            textTransform: 'capitalize'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={order.status}
                          color={statusColors[order.status] || 'default'}
                          size="small"
                          sx={{ 
                            fontWeight: 500,
                            textTransform: 'capitalize'
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedOrder(order);
                            setSelectedStatus(order.status);
                            setOpenStatusDialog(true);
                          }}
                          title="Update Status"
                          sx={{ color: '#60A5FA', '&:hover': { bgcolor: 'rgba(96, 165, 250, 0.1)' } }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedOrder(order);
                            setPaymentStatus(order.paymentStatus);
                            setOpenPaymentDialog(true);
                          }}
                          title="Update Payment"
                          sx={{ color: '#34D399', '&:hover': { bgcolor: 'rgba(52, 211, 153, 0.1)' } }}
                        >
                          <Payment fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteOrder(order._id)}
                          title="Delete Order"
                          sx={{ color: '#F87171', '&:hover': { bgcolor: 'rgba(248, 113, 113, 0.1)' } }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Status Dialog */}
      <Dialog 
        open={openStatusDialog} 
        onClose={() => setOpenStatusDialog(false)}
        PaperProps={{
          sx: {
            bgcolor: '#1F2937',
            color: '#E5E7EB',
            borderRadius: '8px',
            border: '1px solid #374151'
          }
        }}
      >
        <DialogTitle sx={{ color: '#F9FAFB', borderBottom: '1px solid #374151' }}>
          Update Order Status
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            fullWidth
            sx={{ 
              color: '#F3F4F6',
              bgcolor: '#111827',
              borderRadius: '6px',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#374151'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#4B5563'
              }
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  bgcolor: '#1F2937',
                  color: '#F3F4F6',
                  border: '1px solid #374151'
                }
              }
            }}
          >
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Processing">Processing</MenuItem>
            <MenuItem value="Shipped">Shipped</MenuItem>
            <MenuItem value="Delivered">Delivered</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #374151', px: 3, py: 2 }}>
          <Button 
            onClick={() => setOpenStatusDialog(false)}
            sx={{ 
              color: '#9CA3AF',
              '&:hover': {
                bgcolor: 'rgba(156, 163, 175, 0.1)'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleStatusUpdate} 
            variant="contained"
            sx={{ 
              bgcolor: '#3B82F6',
              color: '#FFFFFF',
              borderRadius: '6px',
              '&:hover': {
                bgcolor: '#2563EB'
              }
            }}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog 
        open={openPaymentDialog} 
        onClose={() => setOpenPaymentDialog(false)}
        PaperProps={{
          sx: {
            bgcolor: '#1F2937',
            color: '#E5E7EB',
            borderRadius: '8px',
            border: '1px solid #374151'
          }
        }}
      >
        <DialogTitle sx={{ color: '#F9FAFB', borderBottom: '1px solid #374151' }}>
          Update Payment Status
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            fullWidth
            sx={{ 
              color: '#F3F4F6',
              bgcolor: '#111827',
              borderRadius: '6px',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#374151'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#4B5563'
              }
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  bgcolor: '#1F2937',
                  color: '#F3F4F6',
                  border: '1px solid #374151'
                }
              }
            }}
          >
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="Failed">Failed</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #374151', px: 3, py: 2 }}>
          <Button 
            onClick={() => setOpenPaymentDialog(false)}
            sx={{ 
              color: '#9CA3AF',
              '&:hover': {
                bgcolor: 'rgba(156, 163, 175, 0.1)'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handlePaymentStatusUpdate} 
            variant="contained"
            sx={{ 
              bgcolor: '#10B981',
              color: '#FFFFFF',
              borderRadius: '6px',
              '&:hover': {
                bgcolor: '#059669'
              }
            }}
          >
            Update Payment
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={6000} 
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity={snackbarSeverity} 
          variant="filled"
          sx={{ 
            width: '100%',
            bgcolor: snackbarSeverity === 'error' ? '#EF4444' : '#10B981',
            color: '#FFFFFF',
            borderRadius: '8px'
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Orders;