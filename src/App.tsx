import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import InstallationPage from './pages/InstallationPage';
import HomePage from './pages/HomePage';
import CalendarPage from './pages/CalendarPage';
import Dashboard from './pages/Dashboard';

function App() {
  const [isInstalled, setIsInstalled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkInstallation = async () => {
      try {
        console.log('Checking installation status...');
        const response = await axios.get('/api/installation/status');
        console.log('Installation status:', response.data);
        setIsInstalled(response.data.installed);
      } catch (error) {
        console.error('Error checking installation status:', error);
        setIsInstalled(false);
      } finally {
        setLoading(false);
      }
    };

    checkInstallation();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Always show installation page at /install */}
        <Route path="/install" element={<InstallationPage />} />
        
        {/* If not installed, redirect to installation */}
        <Route
          path="/"
          element={isInstalled ? <HomePage /> : <Navigate to="/install" replace />}
        />
        
        {/* Protected routes - only accessible if installed */}
        <Route
          path="/calendar"
          element={isInstalled ? <CalendarPage /> : <Navigate to="/install" replace />}
        />
        
        {/* Dashboard route */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
