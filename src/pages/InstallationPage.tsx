/**
 * InstallationPage Component
 * 
 * This component provides a multi-step installation form for setting up:
 * 1. Administrator account details
 * 2. Company information
 * 3. Database configuration
 * 
 * Features:
 * - Form validation for all fields
 * - Database connection testing
 * - Dark mode support
 * - Loading states for async operations
 * - Success/error feedback
 * 
 * After successful installation, redirects to the calendar page
 */

import { useState, ChangeEvent, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

// Minimum password length requirement
const MIN_PASSWORD_LENGTH = 7;

// Define interface for admin form data
interface AdminFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  username: string;
  password: string;
  password_confirm: string;
  language: string;
}

// Define interface for company form data
interface CompanyFormData {
  company_name: string;
  company_email: string;
  company_link: string;
}

// Define interface for form errors
interface FormErrors {
  [key: string]: string;
}

// Define interface for alert state
interface AlertState {
  show: boolean;
  message: string;
  type: 'error' | 'success' | '';
}

// Define interface for database connection
interface DatabaseConfig {
  type: 'mysql' | 'sqlite' | 'postgres';
  host?: string;
  port?: string;
  username?: string;
  password?: string;
  database?: string;
  filename?: string; // For SQLite
  reinstall?: boolean; // Reinstall flag
}

export default function InstallationPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [alert, setAlert] = useState<AlertState>({ show: false, message: '', type: '' });

  // Check if user is already logged in and redirect if necessary
  useEffect(() => {
    const checkInstallationAndAuth = async () => {
      try {
        // Check if the app is already installed
        const isInstalled = localStorage.getItem('isInstalled') === 'true';
        
        if (isInstalled) {
          // Get token from localStorage
          const token = localStorage.getItem('token');
          
          if (token) {
            try {
              // Check if user is logged in by verifying authentication status
              // Note: Adjust the API URL to match your backend structure
              const response = await axios.get('/auth/check', {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              });
              
              if (response.data && response.data.authenticated) {
                console.log("User is authenticated, redirecting to dashboard");
                // User is authenticated, redirect to dashboard
                navigate('/dashboard');
                return;
              }
            } catch (authError) {
              console.error('Authentication check failed:', authError);
              // If auth check fails, we'll stay on the installation page
              // Consider clearing invalid token
              if (axios.isAxiosError(authError) && authError.response?.status === 401) {
                localStorage.removeItem('token');
              }
            }
          }
          
          // If we get here, the app is installed but user is not authenticated
          // Redirect to login instead
          console.log("App installed but user not authenticated, redirecting to login");
          navigate('/login');
        }
      } catch (error) {
        console.error('Error checking installation status:', error);
      }
    };
    
    checkInstallationAndAuth();
  }, [navigate]);

  // Admin Form State
  const [adminForm, setAdminForm] = useState<AdminFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    username: '',
    password: '',
    password_confirm: '',
    language: 'en'
  });

  // Company Form State
  const [companyForm, setCompanyForm] = useState<CompanyFormData>({
    company_name: '',
    company_email: '',
    company_link: ''
  });

  // Database Config State
  const [dbConfig, setDbConfig] = useState<DatabaseConfig>({
    type: 'mysql',
    host: 'localhost',
    port: '3306',
    username: '',
    password: '',
    database: 'webschedulr',
    reinstall: false
  });

  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
  }>({
    tested: false,
    success: false,
    message: ''
  });

  // Form Validation Errors
  const [errors, setErrors] = useState<FormErrors>({});

  // Handler for admin form changes
  const handleAdminChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setAdminForm({
      ...adminForm,
      [e.target.name]: e.target.value
    });
  };

  // Handler for company form changes
  const handleCompanyChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCompanyForm({
      ...companyForm,
      [e.target.name]: e.target.value
    });
  };

  // Handler for database type changes
  const handleDBTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const dbType = e.target.value as 'mysql' | 'sqlite' | 'postgres';
    if (dbType === 'sqlite') {
      setDbConfig({
        type: dbType,
        filename: 'webschedulr.db',
        reinstall: false
      });
    } else {
      setDbConfig({
        type: dbType,
        host: 'localhost',
        port: dbType === 'postgres' ? '5432' : '3306',
        username: '',
        password: '',
        database: 'webschedulr',
        reinstall: false
      });
    }
  };

  // Handler for database config changes
  const handleDBConfigChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDbConfig({
      ...dbConfig,
      [e.target.name]: e.target.value
    });
  };

  // Email validation helper
  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Form validation function
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    // Check for empty fields
    Object.entries({ ...adminForm, ...companyForm }).forEach(([key, value]) => {
      if (!value && key !== 'password_confirm') {
        newErrors[key] = 'This field is required';
      }
    });

    // Validate passwords
    if (adminForm.password !== adminForm.password_confirm) {
      newErrors.password = 'Passwords do not match';
      newErrors.password_confirm = 'Passwords do not match';
    }

    if (adminForm.password && adminForm.password.length < MIN_PASSWORD_LENGTH) {
      newErrors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
    }

    // Validate emails
    if (adminForm.email && !validateEmail(adminForm.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (companyForm.company_email && !validateEmail(companyForm.company_email)) {
      newErrors.company_email = 'Invalid email format';
    }

    // Validate database connection
    if (!connectionStatus.tested || !connectionStatus.success) {
      setAlert({
        show: true,
        message: 'Please test and verify your database connection before proceeding',
        type: 'error'
      });
      return false;
    }

    // Validate database configuration
    if (dbConfig.type !== 'sqlite') {
      if (!dbConfig.host) newErrors.dbHost = 'Database host is required';
      if (!dbConfig.username) newErrors.dbUsername = 'Database username is required';
      if (!dbConfig.database) newErrors.dbDatabase = 'Database name is required';
    } else {
      if (!dbConfig.filename) newErrors.dbFilename = 'Database filename is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Test database connection
  const testConnection = async () => {
    setTestingConnection(true);
    try {
      const response = await axios.post('/api/installation/test-connection', dbConfig);
      
      setConnectionStatus({
        tested: true,
        success: true,
        message: response.data.message || 'Connection successful!'
      });
    } catch (error) {
      let errorMessage = 'Connection failed.';
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED' || !error.response) {
          errorMessage = 'Cannot connect to the server. Please make sure the backend is running.';
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = 'Connection failed. Please check your credentials.';
        }
      }
      
      setConnectionStatus({
        tested: true,
        success: false,
        message: errorMessage
      });
    } finally {
      setTestingConnection(false);
    }
  };

  // Form submission handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert({ show: false, message: '', type: '' });
    
    // Validate form before submission
    if (!validate()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare form data with all configurations
      const formData = {
        admin: {
          first_name: adminForm.first_name,
          last_name: adminForm.last_name,
          email: adminForm.email,
          username: adminForm.username,
          password: adminForm.password,
        },
        company: {
          name: companyForm.company_name,
          email: companyForm.company_email,
          website: companyForm.company_link,
        },
        database: dbConfig,
      };
      
      // Send installation request
      const response = await axios.post('/api/installation/perform', formData);
      
      // Handle successful response
      if (response.data.success) {
        setAlert({
          show: true,
          message: response.data.message || 'Installation completed successfully!',
          type: 'success'
        });
        
        // Store installation state in localStorage
        localStorage.setItem('isInstalled', 'true');
        
        // Redirect to login page instead of dashboard
        setTimeout(() => {
          navigate('/login'); // Redirect to login page
        }, 2000);
      }
    } catch (error: unknown) {
      console.error('Installation error:', error);
      let errorMessage = 'Installation failed. Please try again.';
      
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      setAlert({
        show: true,
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Render the installation form
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-12">
      {/* Form container */}
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">
            WebSchedulr Installation
          </h1>

          {/* Alert message */}
          {alert.show && (
            <div className={`p-4 mb-6 rounded-md ${alert.type === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200' : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'}`}>
              {alert.message}
            </div>
          )}

          <form onSubmit={handleFormSubmit}>
            {/* Admin section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Administrator</h2>
              {/* Admin form fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={adminForm.first_name}
                    onChange={handleAdminChange}
                    className={`w-full p-2 border rounded ${errors.first_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white`}
                  />
                  {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
                </div>
                
                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={adminForm.last_name}
                    onChange={handleAdminChange}
                    className={`w-full p-2 border rounded ${errors.last_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white`}
                  />
                  {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
                </div>
                
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={adminForm.email}
                    onChange={handleAdminChange}
                    className={`w-full p-2 border rounded ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                
                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone_number"
                    value={adminForm.phone_number}
                    onChange={handleAdminChange}
                    className={`w-full p-2 border rounded ${errors.phone_number ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white`}
                  />
                  {errors.phone_number && <p className="text-red-500 text-xs mt-1">{errors.phone_number}</p>}
                </div>
                
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={adminForm.username}
                    onChange={handleAdminChange}
                    className={`w-full p-2 border rounded ${errors.username ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white`}
                  />
                  {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                </div>
                
                {/* Language */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Language
                  </label>
                  <select
                    name="language"
                    value={adminForm.language}
                    onChange={handleAdminChange}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
                
                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={adminForm.password}
                    onChange={handleAdminChange}
                    className={`w-full p-2 border rounded ${errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white`}
                  />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>
                
                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="password_confirm"
                    value={adminForm.password_confirm}
                    onChange={handleAdminChange}
                    className={`w-full p-2 border rounded ${errors.password_confirm ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white`}
                  />
                  {errors.password_confirm && <p className="text-red-500 text-xs mt-1">{errors.password_confirm}</p>}
                </div>
              </div>
            </div>

            {/* Company section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Company Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    value={companyForm.company_name}
                    onChange={handleCompanyChange}
                    className={`w-full p-2 border rounded ${errors.company_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white`}
                  />
                  {errors.company_name && <p className="text-red-500 text-xs mt-1">{errors.company_name}</p>}
                </div>
                
                {/* Company Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Company Email
                  </label>
                  <input
                    type="email"
                    name="company_email"
                    value={companyForm.company_email}
                    onChange={handleCompanyChange}
                    className={`w-full p-2 border rounded ${errors.company_email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white`}
                  />
                  {errors.company_email && <p className="text-red-500 text-xs mt-1">{errors.company_email}</p>}
                </div>
                
                {/* Company Website */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Company Website
                  </label>
                  <input
                    type="url"
                    name="company_link"
                    value={companyForm.company_link}
                    onChange={handleCompanyChange}
                    className={`w-full p-2 border rounded ${errors.company_link ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white`}
                  />
                  {errors.company_link && <p className="text-red-500 text-xs mt-1">{errors.company_link}</p>}
                </div>
              </div>
            </div>

            {/* Database section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Database Configuration</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Database Type
                </label>
                <select
                  name="type"
                  value={dbConfig.type}
                  onChange={handleDBTypeChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                >
                  <option value="mysql">MySQL</option>
                  {/* <option value="postgres">PostgreSQL</option> */}
                  <option value="sqlite">SQLite (Simple file-based database)</option>
                </select>
              </div>
              
              {dbConfig.type !== 'sqlite' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Host */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Host
                    </label>
                    <input
                      type="text"
                      name="host"
                      value={dbConfig.host}
                      onChange={handleDBConfigChange}
                      className="w-full p-2 border rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  {/* Port */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Port
                    </label>
                    <input
                      type="text"
                      name="port"
                      value={dbConfig.port}
                      onChange={handleDBConfigChange}
                      className="w-full p-2 border rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={dbConfig.username}
                      onChange={handleDBConfigChange}
                      className="w-full p-2 border rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={dbConfig.password}
                      onChange={handleDBConfigChange}
                      className="w-full p-2 border rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  {/* Database Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Database Name
                    </label>
                    <input
                      type="text"
                      name="database"
                      value={dbConfig.database}
                      onChange={handleDBConfigChange}
                      className="w-full p-2 border rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  {/* Important Note */}
                  <div className="md:col-span-2 mt-2">
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      <strong>Important:</strong> Please confirm you have permissions to create databases, or that this database already exists and you have full access to it.
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    SQLite Database File
                  </label>
                  <input
                    type="text"
                    name="filename"
                    value={dbConfig.filename}
                    onChange={handleDBConfigChange}
                    className="w-full p-2 border rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    A SQLite database file will be created automatically during installation. No additional setup required.
                  </p>
                </div>
              )}

              {/* Reinstall Option */}
              <div className="mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="reinstall"
                    checked={dbConfig.reinstall}
                    onChange={e => setDbConfig({ ...dbConfig, reinstall: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="reinstall" className="text-sm text-red-600 font-medium">
                    Reinstall (Warning: This will delete all existing data)
                  </label>
                </div>
              </div>
              
              <div className="mt-4">
                <button
                  type="button"
                  onClick={testConnection}
                  disabled={testingConnection}
                  className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
                >
                  {testingConnection ? (
                    <span className="flex items-center">
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                      Testing...
                    </span>
                  ) : (
                    "Test Connection"
                  )}
                </button>
                
                {connectionStatus.tested && (
                  <div className={`mt-2 p-2 rounded text-sm ${connectionStatus.success ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'}`}>
                    {connectionStatus.message}
                  </div>
                )}
              </div>
            </div>

            {/* Submit button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <span className="flex items-center">
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                    Installing...
                  </span>
                ) : (
                  "Install WebSchedulr"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}