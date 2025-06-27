
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { toast } from 'react-toastify';
import API from '../services/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch orders on mount
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await API.get('/admin/orders');
      setOrders(response.data);
    } catch (err) {
      toast.error('Failed to load orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await API.put(`/admin/order/${orderId}/status`, { status: newStatus });
      toast.success('Order status updated');
      fetchOrders();
    } catch (err) {
      toast.error('Error updating order status');
      console.error(err);
    }
  };

  const handlePaymentStatusChange = async (orderId, newStatus) => {
    try {
      await API.put(`/admin/order/payment-status/${orderId}`, { paymentStatus: newStatus });
      toast.success('Payment status updated');
      fetchOrders();
    } catch (err) {
      toast.error('Error updating payment status');
      console.error(err);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    const confirm = window.confirm('Are you sure you want to delete this order?');
    if (!confirm) return;

    try {
      await API.delete(`/admin/order/${orderId}`);
      toast.success('Order deleted');
      fetchOrders();
    } catch (err) {
      toast.error('Error deleting order');
      console.error(err);
    }
  };

  const formatDate = (date) => new Date(date).toLocaleString();

  if (loading) {
    return (
      <Box p={3}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Orders Management
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell>Ordered At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {orders.map((order) => (
              <TableRow key={order._id}>
                <TableCell>{order._id.slice(0, 8)}...</TableCell>
                <TableCell>
                  {order.userId?.name || 'Guest'}
                  <br />
                  {order.userId?.email || order.customerEmail}
                </TableCell>
                <TableCell>
                  {order.items.map((item, idx) => (
                    <div key={idx}>
                      {item.medicineId?.productName || 'Unknown'} × {item.quantity}
                    </div>
                  ))}
                </TableCell>
                <TableCell>₹{order.totalAmount}</TableCell>
                <TableCell>
                  <Select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    size="small"
                  >
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Processing">Processing</MenuItem>
                    <MenuItem value="Shipped">Shipped</MenuItem>
                    <MenuItem value="Delivered">Delivered</MenuItem>
                    <MenuItem value="Cancelled">Cancelled</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={order.paymentStatus}
                    onChange={(e) => handlePaymentStatusChange(order._id, e.target.value)}
                    size="small"
                  >
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                    <MenuItem value="Failed">Failed</MenuItem>
                    <MenuItem value="Refunded">Refunded</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>{formatDate(order.orderedAt)}</TableCell>
                <TableCell>
                  <IconButton color="error" onClick={() => handleDeleteOrder(order._id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

        </Table>
      </TableContainer>
    </Box>
  );
};

export default Orders;
