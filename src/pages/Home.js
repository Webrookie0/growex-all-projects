import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';

// Firebase screenshots
const chatScreenshot = "https://firebasestorage.googleapis.com/v0/b/influencer-connect-app.appspot.com/o/screenshots%2Fchat-screenshot.jpg?alt=media";
const dashboardScreenshot = "https://firebasestorage.googleapis.com/v0/b/influencer-connect-app.appspot.com/o/screenshots%2Fdashboard-screenshot.jpg?alt=media";

const Home = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-16">
          <motion.div 
            className="md:w-1/2 text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              InfluencerConnect
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-indigo-200">
              Connect with influencers and brands for collaboration opportunities
            </p>
            <div className="flex flex-wrap gap-4">
              <motion.button
                className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-100 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signup')}
              >
                Get Started
              </motion.button>
              
              {!isAuthenticated && (
                <motion.button
                  className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/login')}
                >
                  Login
                </motion.button>
              )}
              
              {isAuthenticated && (
                <motion.button
                  className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/dashboard')}
                >
                  Dashboard
                </motion.button>
              )}
            </div>
          </motion.div>
          
          <motion.div 
            className="md:w-1/2 mt-12 md:mt-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-2xl">
              <img 
                src="https://source.unsplash.com/random/600x400/?influencer,marketing" 
                alt="Influencer Marketing" 
                className="rounded-xl shadow-lg w-full h-auto" 
              />
            </div>
          </motion.div>
        </div>
        
        {/* Features Section */}
        <motion.div
          className="py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">Key Features</h2>
            <p className="mt-4 text-xl text-indigo-200">Connect, collaborate, and chat in real-time</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Chat Feature */}
            <motion.div 
              className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-xl"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h3 className="text-2xl font-bold text-white mb-4">Real-time Messaging</h3>
              <p className="text-indigo-200 mb-6">
                Search for users by username and exchange messages instantly. All conversations are saved securely in Firebase.
              </p>
              <div className="rounded-xl overflow-hidden shadow-lg">
                <img 
                  src={chatScreenshot} 
                  alt="Chat Interface" 
                  className="w-full h-auto"
                />
              </div>
              <div className="mt-4 text-sm text-indigo-200">
                <p>How to use:</p>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Sign up with your email and username</li>
                  <li>Visit the chat section from dashboard</li>
                  <li>Search for other users</li>
                  <li>Start messaging in real-time</li>
                </ol>
              </div>
            </motion.div>
            
            {/* Dashboard Feature */}
            <motion.div 
              className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-xl"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h3 className="text-2xl font-bold text-white mb-4">User Dashboard</h3>
              <p className="text-indigo-200 mb-6">
                Access your personalized dashboard with quick links to messages, profile settings, and account information.
              </p>
              <div className="rounded-xl overflow-hidden shadow-lg">
                <img 
                  src={dashboardScreenshot} 
                  alt="Dashboard Interface" 
                  className="w-full h-auto"
                />
              </div>
              <div className="mt-4 text-sm text-indigo-200">
                <p>Features:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>View your account information</li>
                  <li>Access chat from navigation menu</li>
                  <li>Edit your profile information</li>
                  <li>All data securely stored in Firebase</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home; 