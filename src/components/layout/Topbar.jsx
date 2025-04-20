import React from 'react';

const Topbar = () => {
  return (
    <div className="bg-white shadow-sm">
      <div className="ml-64 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome, Admin</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;