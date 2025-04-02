import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import InstallationPage from './pages/InstallationPage';
import HomePage from './pages/HomePage';
import CalendarPage from './pages/CalendarPage';
import DashboardPage from './pages/DashboardPage';
import TestDashboard from './pages/TestDashboard';

function App() {
  const [isInstalled, setIsInstalled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkInstallation = async () => {
      try {
        console.log('Checking installation status...');
        
        // First check localStorage (faster than API call)
        const localInstallState = localStorage.getItem('isInstalled');
        if (localInstallState === 'true') {
          console.log('Found local installation state: installed');
          setIsInstalled(true);
          setLoading(false);
          return;
        }
        
        // If not in localStorage, check with API
        const response = await axios.get('/api/installation/status');
        console.log('Installation status API response:', response.data);
        
        if (response.data.installed) {
          localStorage.setItem('isInstalled', 'true');
        }
        
        setIsInstalled(response.data.installed);
      } catch (error) {
        console.error('Error checking installation status:', error);
        // For development purposes, allow access to dashboard even if API fails
        setIsInstalled(true); // Change this to false in production
      } finally {
        setLoading(false);
      }
    };

    checkInstallation();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-3 text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* For development/testing */}
        <Route path="/test-dashboard" element={<TestDashboard />} />

        {/* Always show installation page at /install */}
        <Route path="/install" element={<InstallationPage />} />
        
        {/* Allow access to dashboard for debugging */}
        <Route path="/dashboard" element={<DashboardPage />} />
        
        {/* Protected routes - only accessible if installed */}
        <Route
          path="/calendar"
          element={isInstalled ? <CalendarPage /> : <Navigate to="/install" replace />}
        />
        
        {/* Home route */}
        <Route
          path="/"
          element={isInstalled ? <HomePage /> : <Navigate to="/install" replace />}
        />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
