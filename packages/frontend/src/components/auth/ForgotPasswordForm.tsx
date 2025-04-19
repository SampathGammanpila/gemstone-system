import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { validateEmail } from '../../utils/validation';

const ForgotPasswordForm: React.FC = () => {
  const { forgotPassword, isLoading, error, clearError } = useAuth();
  
  // Form state
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  
  // Validate email field
  const validateField = () => {
    const error = validateEmail(email);
    setEmailError(error);
    return !error;
  };
  
  // Clear server error when user starts typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) {
      clearError();
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    
    if (!validateField()) {
      return;
    }
    
    try {
      await forgotPassword({ email });
      setRequestSent(true);
    } catch (error) {
      // Error is already handled in the forgotPassword function
      console.error('Forgot password request failed', error);
    }
  };
  
  // If request was sent successfully, show confirmation
  if (requestSent) {
    return (
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mt-4">Reset Link Sent!</h2>
          <p className="text-gray-600 mt-2">
            If an account exists with the email <span className="font-medium">{email}</span>,
            you will receive a password reset link shortly.
          </p>
          <p className="text-gray-600 mt-4">
            Please check your email and follow the instructions to reset your password.
          </p>
          <div className="mt-6">
            <Link to="/auth/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold text-gray-800">Forgot Password</h2>
        <p className="text-gray-600 mt-2">
          Enter your email address and we'll send you a link to reset your password.
        </p>
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
            onChange={handleInputChange}
            onBlur={validateField}
          />
          {formSubmitted && emailError && (
            <p className="mt-1 text-sm text-red-600">{emailError}</p>
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
              Sending...
            </span>
          ) : (
            'Send Reset Link'
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

export default ForgotPasswordForm;