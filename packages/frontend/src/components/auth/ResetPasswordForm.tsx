import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { validatePassword, validatePasswordConfirmation } from '../../utils/validation';

const ResetPasswordForm: React.FC = () => {
  const { resetPassword, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  
  // Form state
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Validation state
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [tokenInvalid, setTokenInvalid] = useState(false);
  
  // Check if token exists
  useEffect(() => {
    if (!token) {
      setTokenInvalid(true);
    }
  }, [token]);
  
  // Validate form fields
  const validateField = (field: 'password' | 'confirmPassword') => {
    if (field === 'password') {
      const error = validatePassword(password);
      setPasswordError(error);
      
      // Also validate confirm password when password changes
      if (confirmPassword) {
        const confirmError = validatePasswordConfirmation(password, confirmPassword);
        setConfirmPasswordError(confirmError);
      }
      
      return !error;
    } else if (field === 'confirmPassword') {
      const error = validatePasswordConfirmation(password, confirmPassword);
      setConfirmPasswordError(error);
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
    
    if (!token) {
      setTokenInvalid(true);
      return;
    }
    
    // Validate all fields
    const isPasswordValid = validateField('password');
    const isConfirmPasswordValid = validateField('confirmPassword');
    
    if (!isPasswordValid || !isConfirmPasswordValid) {
      return;
    }
    
    try {
      await resetPassword({
        token,
        password,
        confirmPassword
      });
      
      // Show success message
      setResetSuccess(true);
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/auth/login');
      }, 3000);
      
    } catch (error) {
      // Error is already handled in the resetPassword function
      console.error('Password reset failed', error);
    }
  };
  
  // If token is invalid, show error
  if (tokenInvalid) {
    return (
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mt-4">Invalid Reset Link</h2>
          <p className="text-gray-600 mt-2">
            The password reset link is invalid or has expired.
          </p>
          <p className="text-gray-600 mt-2">
            Please request a new password reset link.
          </p>
          <div className="mt-6">
            <Link to="/auth/forgot-password" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Request New Reset Link
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // If reset was successful, show confirmation
  if (resetSuccess) {
    return (
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mt-4">Password Reset Successful!</h2>
          <p className="text-gray-600 mt-2">
            Your password has been successfully updated.
          </p>
          <p className="text-gray-600 mt-2">
            You'll be redirected to the login page shortly...
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold text-gray-800">Reset Password</h2>
        <p className="text-gray-600 mt-2">
          Enter your new password below
        </p>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Password field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
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
        
        {/* Confirm password field */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            className={`w-full px-4 py-2 border ${
              formSubmitted && confirmPasswordError ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500`}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              handleInputChange();
            }}
            onBlur={() => validateField('confirmPassword')}
          />
          {formSubmitted && confirmPasswordError && (
            <p className="mt-1 text-sm text-red-600">{confirmPasswordError}</p>
          )}
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
              Resetting Password...
            </span>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>
      
      {/* Back to login */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Remember your password?{' '}
          <Link to="/auth/login" className="text-emerald-600 font-medium hover:text-emerald-700">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordForm;