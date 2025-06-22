import React, { useState } from 'react';
import { 
  FaBox, 
  FaShoppingCart, 
  FaDollarSign, 
  FaTimes, 
  FaArrowUp, 
  FaArrowDown, 
  FaChartLine, 
  FaUserPlus,
  FaRegBell,
  FaEllipsisH
} from 'react-icons/fa';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('week');

  // Sample data for charts
  const salesData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Sales',
        data: [6500, 5900, 8000, 8100, 8600, 9250, 10500],
        borderColor: 'rgba(79, 70, 229, 1)',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const ordersData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Orders',
        data: [12, 19, 15, 25, 22, 30, 17],
        backgroundColor: 'rgba(79, 70, 229, 0.8)',
        borderRadius: 4,
      },
    ],
  };

  const stats = [
    {
      title: 'Total Products',
      value: '1,248',
      change: '+12.5%',
      isPositive: true,
      icon: <FaBox className="w-6 h-6 text-blue-500" />,
      color: 'blue',
    },
    {
      title: 'Total Orders',
      value: '356',
      change: '+8.2%',
      isPositive: true,
      icon: <FaShoppingCart className="w-6 h-6 text-green-500" />,
      color: 'green',
    },
    {
      title: 'Total Revenue',
      value: '$24,780',
      change: '+15.3%',
      isPositive: true,
      icon: <FaDollarSign className="w-6 h-6 text-purple-500" />,
      color: 'purple',
    },
    {
      title: 'Cancelled Orders',
      value: '24',
      change: '-5.2%',
      isPositive: false,
      icon: <FaTimes className="w-6 h-6 text-red-500" />,
      color: 'red',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'order',
      title: 'New order #ORD-2023-0012',
      description: 'Customer: John Doe',
      time: '10 minutes ago',
      icon: <FaShoppingCart className="text-blue-500" />,
    },
    {
      id: 2,
      type: 'user',
      title: 'New user registered',
      description: 'jane.doe@example.com',
      time: '2 hours ago',
      icon: <FaUserPlus className="text-green-500" />,
    },
    {
      id: 3,
      type: 'alert',
      title: 'Low stock alert',
      description: 'Paracetamol is running low (12 left)',
      time: '5 hours ago',
      icon: <FaRegBell className="text-yellow-500" />,
    },
    {
      id: 4,
      type: 'sale',
      title: 'Big sale',
      description: '30% off on all antibiotics',
      time: '1 day ago',
      icon: <FaChartLine className="text-purple-500" />,
    },
  ];

  const topProducts = [
    { id: 1, name: 'Paracetamol 500mg', sales: 245, revenue: '$1,225' },
    { id: 2, name: 'Ibuprofen 400mg', sales: 198, revenue: '$1,188' },
    { id: 3, name: 'Vitamin C 1000mg', sales: 176, revenue: '$880' },
    { id: 4, name: 'Azithromycin 250mg', sales: 154, revenue: '$1,078' },
    { id: 5, name: 'Cetirizine 10mg', sales: 132, revenue: '$528' },
  ];

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back, Admin! Here's what's happening.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            {['day', 'week', 'month', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 text-sm font-medium ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                } border border-gray-200 dark:border-gray-700 ${
                  range === 'day' ? 'rounded-l-lg' : ''
                } ${
                  range === 'year' ? 'rounded-r-lg' : ''
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => (
          <div 
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</h3>
                <div className={`flex items-center mt-2 text-sm ${
                  stat.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {stat.isPositive ? (
                    <FaArrowUp className="mr-1" />
                  ) : (
                    <FaArrowDown className="mr-1" />
                  )}
                  <span>{stat.change} from last {timeRange}</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg bg-${stat.color}-100 dark:bg-opacity-20`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Overview</h3>
            <button className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
              <FaEllipsisH />
            </button>
          </div>
          <div className="h-80">
            <Line 
              data={salesData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(0, 0, 0, 0.05)',
                    },
                    ticks: {
                      callback: (value) => `$${value}`,
                    },
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                  },
                },
              }} 
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Orders This Week</h3>
            <button className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
              <FaEllipsisH />
            </button>
          </div>
          <div className="h-80">
            <Bar 
              data={ordersData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(0, 0, 0, 0.05)',
                    },
                    ticks: {
                      precision: 0,
                    },
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                  },
                },
              }} 
            />
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activities</h3>
            <button className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0 last:mb-0">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {activity.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {activity.description}
                  </p>
                </div>
                <div className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                  {activity.time}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Selling Products</h3>
            <button className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Sales
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {topProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {product.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">
                      {product.sales}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white text-right">
                      {product.revenue}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;