import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaPills, 
  FaShoppingCart, 
  FaTags, 
  FaTimes, 
  FaSignOutAlt,
  FaChevronDown,
  FaChevronRight,
  FaUserCog,
  FaUsers,
  FaChartLine,
  FaBars,
  FaTimes as FaClose,
  FaFlask,
  FaMagic
} from 'react-icons/fa';

const Sidebar = ({ isMobileMenuOpen, toggleMobileMenu }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { 
      path: '/dashboard', 
      icon: <FaTachometerAlt className="text-lg" />, 
      label: 'Dashboard' 
    },
    { 
      path: '/medicines', 
      icon: <FaPills className="text-lg" />, 
      label: 'Products',
      submenu: [
        { path: '/medicines/all', label: 'All Products' },
        { path: '/medicines/categories', label: 'Categories' },
        { path: '/medicines/inventory', label: 'Inventory' },
        { path: '/medicines/missing-images', label: 'Missing Images' },
        { path: '/medicines/ai-enhance', label: 'AI Product Enhancement', icon: <FaMagic className="mr-2" /> }
      ]
    },
    { 
      path: '/lab-tests', 
      icon: <FaFlask className="text-lg" />, 
      label: 'Lab Tests'
    },
    { 
      path: '/orders', 
      icon: <FaShoppingCart className="text-lg" />, 
      label: 'Orders',
      submenu: [
        { path: '/orders', label: 'All Orders' },
        { path: '/orders/pending', label: 'Pending' },
        { path: '/orders/completed', label: 'Completed' },
        { path: '/orders/cancelled', label: 'Cancelled' },
      ]
    },
    { 
      path: '/customers', 
      icon: <FaUsers className="text-lg" />, 
      label: 'Customers' 
    },
    { 
      path: '/reports', 
      icon: <FaChartLine className="text-lg" />, 
      label: 'Reports' 
    },
    { 
      path: '/settings', 
      icon: <FaUserCog className="text-lg" />, 
      label: 'Settings' 
    },
  ];

  const toggleSubmenu = (index) => {
    setActiveSubmenu(activeSubmenu === index ? null : index);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  const sidebarClasses = `
    bg-gradient-to-b from-gray-800 to-gray-900 text-white h-screen fixed z-40
    transition-all duration-300 ease-in-out overflow-y-auto
    ${isCollapsed ? 'w-20' : 'w-64'}
    ${isMobile ? (isMobileMenuOpen ? 'left-0' : '-left-64') : 'left-0'}
  `;

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      <aside className={sidebarClasses}>
        <div className="p-4 flex justify-between items-center border-b border-gray-700">
          {!isCollapsed && (
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              ArogyaRX
            </h1>
          )}
          <button 
            onClick={isMobile ? toggleMobileMenu : () => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            {isMobile ? (
              <FaClose className="text-xl" />
            ) : isCollapsed ? (
              <FaBars className="text-xl" />
            ) : (
              <FaBars className="text-xl" />
            )}
          </button>
        </div>

        <nav className="mt-6">
          {navItems.map((item, index) => (
            <div key={item.path} className="mb-1">
              <div
                className={`flex items-center justify-between px-4 py-3 mx-2 rounded-lg cursor-pointer
                  ${location.pathname.startsWith(item.path) ? 'bg-gray-700' : 'hover:bg-gray-700'}
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                onClick={() => item.submenu ? toggleSubmenu(index) : navigate(item.path)}
              >
                <div className="flex items-center">
                  <span className="text-gray-300">{item.icon}</span>
                  {!isCollapsed && (
                    <span className="ml-3 text-gray-200">{item.label}</span>
                  )}
                </div>
                {!isCollapsed && item.submenu && (
                  <span className="text-xs text-gray-400">
                    {activeSubmenu === index ? <FaChevronDown /> : <FaChevronRight />}
                  </span>
                )}
              </div>

              {!isCollapsed && item.submenu && activeSubmenu === index && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.submenu.map((subItem) => (
                    <Link
                      key={subItem.path}
                      to={subItem.path}
                      className={`block px-4 py-2 text-sm rounded-lg mx-2
                        ${location.pathname === subItem.path 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-300 hover:bg-gray-700'}`}
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className={`absolute bottom-0 w-full p-4 border-t border-gray-700 ${isCollapsed ? 'px-0' : ''}`}>
          <button 
            onClick={handleLogout}
            className={`flex items-center text-gray-300 hover:text-white w-full rounded-lg p-2 hover:bg-gray-700
              ${isCollapsed ? 'justify-center' : ''}`}
          >
            <FaSignOutAlt className="text-lg" />
            {!isCollapsed && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;