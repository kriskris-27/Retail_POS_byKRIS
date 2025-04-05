import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}!</h1>
        <p className="mt-1 text-sm text-gray-500">
          You are logged in as {user?.role}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Quick Stats */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900">Today's Sales</h3>
          <p className="mt-2 text-3xl font-semibold text-indigo-600">$0.00</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900">Inventory Items</h3>
          <p className="mt-2 text-3xl font-semibold text-indigo-600">0</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900">Low Stock Items</h3>
          <p className="mt-2 text-3xl font-semibold text-red-600">0</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        <div className="mt-4">
          <p className="text-sm text-gray-500">No recent activity</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
