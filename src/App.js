
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout & Auth
import PrivateRoute from './components/auth/PrivateRoute';
import Login from './components/auth/Login';
import Layout from './components/layout/Layout';

// Pages
import Dashboard from './pages/Dashboard';

// Products
import AllProducts from './pages/products/AllProducts';
import Categories from './pages/products/Categories';
import Inventory from './pages/products/Inventory';
import MissingImages from './pages/products/MissingImages';

// Orders - TODO: Uncomment when components are created
// import AllOrders from './pages/orders/AllOrders';
// import PendingOrders from './pages/orders/PendingOrders';
// import CompletedOrders from './pages/orders/CompletedOrders';
// import CancelledOrders from './pages/orders/CancelledOrders';

// Customers - TODO: Uncomment when component is created
// import CustomerList from './pages/customers/CustomerList';

// Reports - TODO: Uncomment when component is created
// import SalesReport from './pages/reports/SalesReport';

// Settings - TODO: Uncomment when components are created
// import ProfileSettings from './pages/settings/ProfileSettings';
// import StoreSettings from './pages/settings/StoreSettings';

// Wrapper component to apply layout to protected routes
const LayoutWrapper = () => (
  <Layout>
    <Outlet />
  </Layout>
);

function App() {
  return (
    <Router>
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected routes with layout */}
        <Route element={<PrivateRoute />}>
          <Route element={<LayoutWrapper />}>
            {/* Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Products */}
            <Route path="/medicines">
              <Route index element={<Navigate to="all" replace />} />
              <Route path="all" element={<AllProducts />} />
              <Route path="categories" element={<Categories />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="missing-images" element={<MissingImages />} />
            </Route>
            
            {/* Orders - TODO: Uncomment when components are created */}
            {/* <Route path="/orders">
              <Route index element={<Navigate to="all" replace />} />
              <Route path="all" element={<AllOrders />} />
              <Route path="pending" element={<PendingOrders />} />
              <Route path="completed" element={<CompletedOrders />} />
              <Route path="cancelled" element={<CancelledOrders />} />
            </Route> */}
            
            {/* Customers - TODO: Uncomment when component is created */}
            {/* <Route path="/customers" element={<CustomerList />} /> */}
            
            {/* Reports - TODO: Uncomment when component is created */}
            {/* <Route path="/reports" element={<SalesReport />} /> */}
            
            {/* Settings - TODO: Uncomment when components are created */}
            {/* <Route path="/settings">
              <Route index element={<Navigate to="profile" replace />} />
              <Route path="profile" element={<ProfileSettings />} />
              <Route path="store" element={<StoreSettings />} />
            </Route> */}
            
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>
        
        {/* 404 - Not Found */}
        <Route path="*" element={
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800 dark:text-white">404</h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">Page not found</p>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;