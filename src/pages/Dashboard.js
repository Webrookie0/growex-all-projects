import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { user, loading, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Show loading indicator while checking authentication
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-indigo-600">InfluencerConnect</h1>
              </div>
              <div className="ml-6 flex space-x-4 items-center">
                <button
                  onClick={() => navigate('/chat')}
                  className="px-3 py-2 rounded-md text-sm font-medium text-indigo-700 hover:bg-indigo-100"
                >
                  Messages
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  className="px-3 py-2 rounded-md text-sm font-medium text-indigo-700 hover:bg-indigo-100"
                >
                  Profile
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <motion.div
          className="px-4 py-6 sm:px-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Dashboard
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Welcome to your personal dashboard, {user.username}!
              </p>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-indigo-800 mb-2">User Information</h4>
                  <ul className="space-y-2">
                    <li className="text-gray-700">
                      <span className="font-medium">Username:</span> {user.username || 'N/A'}
                    </li>
                    <li className="text-gray-700">
                      <span className="font-medium">Email:</span> {user.email || 'N/A'}
                    </li>
                    <li className="text-gray-700">
                      <span className="font-medium">User ID:</span> {user.id || 'N/A'}
                    </li>
                    {user.createdAt && (
                      <li className="text-gray-700">
                        <span className="font-medium">Joined:</span> {new Date(user.createdAt).toLocaleString()}
                      </li>
                    )}
                  </ul>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-green-800 mb-2">Authentication Status</h4>
                  <p className="text-gray-700">
                    You are currently <span className="font-bold text-green-600">logged in</span>.
                  </p>
                  <div className="mt-4">
                    <button
                      onClick={() => navigate('/profile')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none mr-2"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={() => navigate('/chat')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                    >
                      Go to Chat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard; 