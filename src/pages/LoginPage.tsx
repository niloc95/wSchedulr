import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function LoginPage() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isInstalled, setIsInstalled] = useState<boolean | null>(null);
  const [loadingCheck, setLoadingCheck] = useState(true);
  
  // Get the API base URL from environment or use default
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Form validation errors
  const [formErrors, setFormErrors] = useState({
    username: '',
    password: ''
  });

  // Check installation status when component mounts
  useEffect(() => {
    const checkInstallationStatus = async () => {
      setLoadingCheck(true);
      try {
        // First check localStorage (faster than API call)
        const localInstallState = localStorage.getItem('isInstalled');
        if (localInstallState === 'true') {
          setIsInstalled(true);
          setLoadingCheck(false);
          return;
        }
        
        // If not in localStorage, check with API
        const response = await axios.get(`${API_URL}/api/installation/status`);

        if (response.data.installed) {
          localStorage.setItem('isInstalled', 'true');
          setIsInstalled(true);
        } else {
          setIsInstalled(false);
        }
      } catch (err) {
        console.error('Error checking installation status:', err);
        // For development purposes only - assume installed if API fails
        // In production, you might want to set this to false
        setIsInstalled(true);
      } finally {
        setLoadingCheck(false);
      }
    };

    checkInstallationStatus();
  }, [API_URL]);

  // Redirect to installation if system is not installed
  useEffect(() => {
    if (isInstalled === false) {
      navigate('/install');
    }
  }, [isInstalled, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    // Clear validation errors when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
    
    setCredentials({
      ...credentials,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const validateForm = () => {
    let valid = true;
    const errors = {
      username: '',
      password: ''
    };
    
    if (!credentials.username.trim()) {
      errors.username = 'Username is required';
      valid = false;
    }
    
    if (!credentials.password) {
      errors.password = 'Password is required';
      valid = false;
    } else if (credentials.password.length < 7) {
      errors.password = 'Password must be at least 7 characters';
      valid = false;
    }
    
    setFormErrors(errors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate form before submitting
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      console.log(`Attempting to login with username: ${credentials.username}`);
      console.log(`API URL: ${API_URL}/api/auth/login`);
      
      // Make API request to authenticate user
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        username: credentials.username,
        password: credentials.password
      });

      console.log('Login response:', response.data);

      if (response.data.success) {
        // Store authentication token
        localStorage.setItem('auth_token', response.data.token);
        
        // Store user data if provided
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }

        // If remember me is checked, set a longer expiration
        if (credentials.rememberMe) {
          localStorage.setItem('remember_me', 'true');
        }

        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        setError(response.data.message || 'Authentication failed');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Get error message from response if available
      const errorMessage = err.response?.data?.message || 
                          'Authentication failed. Please check your credentials.';
      
      setError(errorMessage);
      
      // For development purposes only
      if (import.meta.env.DEV) {
        console.log('DEV MODE: For testing, you can bypass auth by setting shouldBypassAuth=true');
        
        // Set this to true ONLY for local development when you need to bypass auth
        const shouldBypassAuth = false;
        
        if (shouldBypassAuth) {
          console.warn('⚠️ DEV MODE: Bypassing authentication - REMOVE IN PRODUCTION ⚠️');
          localStorage.setItem('auth_token', 'dev-token-123');
          localStorage.setItem('user', JSON.stringify({ 
            id: 1, 
            first_name: 'Dev',
            last_name: 'User',
            email: 'dev@example.com',
            username: 'admin',
            is_admin: true
          }));
          navigate('/dashboard');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking installation status
  if (loadingCheck) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-gray-600">Checking system status...</p>
        </div>
      </div>
    );
  }

  // Show installation message if system is not installed
  if (isInstalled === false) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-4">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 max-w-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                System is not installed yet. Please complete the installation process.
              </p>
            </div>
          </div>
        </div>
        <Link
          to="/install"
          className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Go to Installation
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/install" className="font-medium text-blue-600 hover:text-blue-500">
            setup a new installation
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={credentials.username}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border ${formErrors.username ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                />
                {formErrors.username && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.username}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={credentials.password}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border ${formErrors.password ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                />
                {formErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={credentials.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div>
                <a
                  href="#"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  {/* Google icon */}
                  <span className="sr-only">Sign in with Google</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M15.545 6.558a9.42 9.42 0 0 0 .139 1.626c-2.842.255-5.268 1.671-6.708 3.807-1.44 2.136-1.689 4.962-.715 7.227C10.294 20.526 12.88 21.5 15.636 21.5c3.501 0 6.363-2.858 6.363-6.364a6.37 6.37 0 0 0-6.363-6.364c-1.267 0-2.448.377-3.43 1.022l-.673-1.237zM14.546 8.5a4.546 4.546 0 1 1 0 9.091 4.546 4.546 0 0 1 0-9.091z" />
                  </svg>
                </a>
              </div>

              <div>
                <a
                  href="#"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  {/* Facebook icon */}
                  <span className="sr-only">Sign in with Facebook</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>

              <div>
                <a
                  href="#"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  {/* Twitter icon */}
                  <span className="sr-only">Sign in with Twitter</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}