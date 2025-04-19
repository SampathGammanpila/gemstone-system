import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { validateEmail, validatePassword } from '../../utils/validation';

const LoginForm: React.FC = () => {
  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get redirect path from location state or default to dashboard
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  
  // Validation state
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  // Validate form fields on input change
  const validateField = (field: 'email' | 'password') => {
    if (field === 'email') {
      const error = validateEmail(email);
      setEmailError(error);
      return !error;
    } else if (field === 'password') {
      const error = validatePassword(password);
      setPasswordError(error);
      return !error;
    }
    return true;
  };
  
  // Clear server error when user starts typing
  const handleInputChange = () => {
    if (error) {
      clearError();
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    
    // Validate all fields
    const isEmailValid = validateField('email');
    const isPasswordValid = validateField('password');
    
    if (!isEmailValid || !isPasswordValid) {
      return;
    }
    
    try {
      await login({ email, password, remember });
      navigate(from, { replace: true });
    } catch (error) {
      // Error is already handled in the login function
      console.error('Login failed', error);
    }
  };
  
  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
        <p className="text-gray-600 mt-2">Sign in to your account</p>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            className={`w-full px-4 py-2 border ${
              formSubmitted && emailError ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500`}
            placeholder="your@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              handleInputChange();
            }}
            onBlur={() => validateField('email')}
          />
          {formSubmitted && emailError && (
            <p className="mt-1 text-sm text-red-600">{emailError}</p>
          )}
        </div>
        
        {/* Password field */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <Link to="/auth/forgot-password" className="text-sm text-emerald-600 hover:text-emerald-700">
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            className={`w-full px-4 py-2 border ${
              formSubmitted && passwordError ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500`}
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              handleInputChange();
            }}
            onBlur={() => validateField('password')}
          />
          {formSubmitted && passwordError && (
            <p className="mt-1 text-sm text-red-600">{passwordError}</p>
          )}
        </div>
        
        {/* Remember me checkbox */}
        <div className="flex items-center">
          <input
            id="remember"
            type="checkbox"
            className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
            Remember me
          </label>
        </div>
        
        {/* Submit button */}
        <button
          type="submit"
          className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </span>
          ) : (
            'Sign in'
          )}
        </button>
      </form>
      
      {/* Registration link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/auth/register" className="text-emerald-600 font-medium hover:text-emerald-700">
            Sign up
          </Link>
        </p>
      </div>
      
      {/* Professional link */}
      <div className="mt-2 text-center">
        <p className="text-sm text-gray-600">
          Professional dealer, cutter, or appraiser?{' '}
          <Link to="/auth/professional-register" className="text-emerald-600 font-medium hover:text-emerald-700">
            Register as Professional
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;