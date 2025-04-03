/* ----------------------------------------------------------------------------
 * @webSchedulr - Online Appointment Scheduler
 *
 * @package     @webSchedulr - Your all-in-one scheduling solution for managing appointments with ease
 * @author      N N.Cara <nilo.cara@frontend.co.za>
 * @copyright   Copyright (c) Nilo Cara 2025
 * @license     https://opensource.org/licenses/GPL-3.0 - GPLv3
 * @link        https://webschedulr.co.za
 * @since       v1.0.0
 * ---------------------------------------------------------------------------- */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function HomePage() {
  const [isInstalled, setIsInstalled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Get the API base URL from environment or use default
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Check installation status when component mounts
  useEffect(() => {
    const checkInstallation = async () => {
      try {
        // First check localStorage (faster than API call)
        const localInstallState = localStorage.getItem('isInstalled');
        if (localInstallState === 'true') {
          setIsInstalled(true);
          setLoading(false);
          return;
        }
        
        // If not in localStorage, check with API
        const response = await axios.get(`${API_URL}/api/installation/status`);
        
        if (response.data.installed) {
          localStorage.setItem('isInstalled', 'true');
          setIsInstalled(true);
        } else {
          localStorage.removeItem('isInstalled');
          setIsInstalled(false);
        }
      } catch (error) {
        console.error('Error checking installation status:', error);
        // For development purposes only - assume not installed if API fails
        localStorage.removeItem('isInstalled');
        setIsInstalled(false);
      } finally {
        setLoading(false);
      }
    };

    checkInstallation();
  }, [API_URL]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">wSchedulr</h1>
          <nav className="flex space-x-4">
            <Link to="/" className="text-gray-900 font-medium hover:text-blue-600">Home</Link>
            {isInstalled && (
              <Link to="/login" className="text-gray-500 hover:text-blue-600">Login</Link>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          // Loading state
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="ml-3 text-gray-600">Checking system status...</p>
          </div>
        ) : (
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Welcome to wSchedulr
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Your comprehensive scheduling and calendar management solution
            </p>
            
            {/* Conditional rendering based on installation status */}
            <div className="mt-8 flex justify-center space-x-4">
              {isInstalled ? (
                // System is installed - show login button
                <Link
                  to="/login"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Login to Dashboard
                </Link>
              ) : (
                // System needs installation - show install button
                <Link
                  to="/install"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                >
                  Install wSchedulr
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Feature highlights */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 mt-12">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Easy Scheduling</h3>
              <p className="mt-2 text-sm text-gray-500">
                Create and manage appointments with our intuitive interface
              </p>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Calendar Integration</h3>
              <p className="mt-2 text-sm text-gray-500">
                Sync with your favorite calendar applications
              </p>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Team Management</h3>
              <p className="mt-2 text-sm text-gray-500">
                Coordinate schedules across your entire team
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            &copy; 2025 wSchedulr. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
