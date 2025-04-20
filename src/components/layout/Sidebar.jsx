import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaTachometerAlt, FaPills, FaShoppingCart, 
  FaTags, FaTimes, FaSignOutAlt 
} from 'react-icons/fa';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
    { path: '/medicines', icon: <FaPills />, label: 'Products' },
    { path: '/orders', icon: <FaShoppingCart />, label: 'Orders' },
    { path: '/orders-new', icon: <FaShoppingCart />, label: 'New Orders' },
    { path: '/coupons', icon: <FaTags />, label: 'Coupons' },
    { path: '/canceled', icon: <FaTimes />, label: 'Canceled' },
  ];

  return (
    <div className="w-64 bg-gray-800 text-white h-screen fixed">
      <div className="p-4">
        <h1 className="text-2xl font-bold">ArogyaRX</h1>
        <p className="text-gray-400">Admin Panel</p>
      </div>
      <nav className="mt-6">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-6 py-3 ${location.pathname === item.path ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          >
            <span className="mr-3">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="absolute bottom-0 w-full p-4">
        <button 
          onClick={() => {
            localStorage.removeItem('adminToken');
            window.location.href = '/login';
          }}
          className="flex items-center text-gray-300 hover:text-white w-full"
        >
          <FaSignOutAlt className="mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;