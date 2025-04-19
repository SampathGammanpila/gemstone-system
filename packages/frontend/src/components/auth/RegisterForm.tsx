import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
  validateRequired,
  validateTermsAgreement
} from '../../utils/validation';

const RegisterForm: React.FC = () => {
  const { register, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  // Validation state
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [agreeToTermsError, setAgreeToTermsError] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  // Validate form fields on input change
  const validateField = (field: string) => {
    switch (field) {
      case 'firstName':
        const firstNameError = validateRequired(firstName, 'First name');
        setFirstNameError(firstNameError);
        return !firstNameError;
      
      case 'lastName':
        const lastNameError = validateRequired(lastName, 'Last name');
        setLastNameError(lastNameError);
        return !lastNameError;
      
      case 'email':
        const emailError = validateEmail(email);
        setEmailError(emailError);
        return !emailError;
      
      case 'password':
        const passwordError = validatePassword(password);
        setPasswordError(passwordError);
        
        // Also validate confirm password when password changes
        if (confirmPassword) {
          const confirmError = validatePasswordConfirmation(password, confirmPassword);
          setConfirmPasswordError(confirmError);
        }
        
        return !passwordError;
      
      case 'confirmPassword':
        const confirmError = validatePasswordConfirmation(password, confirmPassword);
        setConfirmPasswordError(confirmError);
        return !confirmError;
      
      case 'agreeToTerms':
        const agreeError = validateTermsAgreement(agreeToTerms);
        setAgreeToTermsError(agreeError);
        return !agreeError;
      
      default:
        return true;
    }
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
    const isFirstNameValid = validateField('firstName');
    const isLastNameValid = validateField('lastName');
    const isEmailValid = validateField('email');
    const isPasswordValid = validateField('password');
    const isConfirmPasswordValid = validateField('confirmPassword');
    const isAgreeToTermsValid = validateField('agreeToTerms');
    
    if (!isFirstNameValid || !isLastNameValid || !isEmailValid || 
        !isPasswordValid || !isConfirmPasswordValid || !isAgreeToTermsValid) {
      return;
    }
    
    try {
      await register({
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        agreeToTerms
      });
      
      // Show success message
      setRegistrationSuccess(true);
      
      // Reset form after successful registration
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setAgreeToTerms(false);
      setFormSubmitted(false);
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/auth/login');
      }, 3000);
      
    } catch (error) {
      // Error is already handled in the register function
      console.error('Registration failed', error);
    }
  };
  
  if (registrationSuccess) {
    return (
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mt-4">Registration Successful!</h2>
          <p className="text-gray-600 mt-2">
            A verification link has been sent to your email address. Please check your inbox.
          </p>
          <p className="text-gray-600 mt-4">
            You'll be redirected to the login page shortly...
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
        <p className="text-gray-600 mt-2">Sign up to start your gemstone journey</p>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name fields - two columns */}
        <div className="grid grid-cols-2 gap-4">
          {/* First name field */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              className={`w-full px-4 py-2 border ${
                formSubmitted && firstNameError ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500`}
              placeholder="John"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                handleInputChange();
              }}
              onBlur={() => validateField('firstName')}
            />
            {formSubmitted && firstNameError && (
              <p className="mt-1 text-sm text-red-600">{firstNameError}</p>
            )}
          </div>
          
          {/* Last name field */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              className={`w-full px-4 py-2 border ${
                formSubmitted && lastNameError ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500`}
              placeholder="Doe"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                handleInputChange();
              }}
              onBlur={() => validateField('lastName')}
            />
            {formSubmitted && lastNameError && (
              <p className="mt-1 text-sm text-red-600">{lastNameError}</p>
            )}
          </div>
        </div>
        
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
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
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
            Confirm Password
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
        
        {/* Terms and conditions checkbox */}
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="agreeToTerms"
              type="checkbox"
              className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
              checked={agreeToTerms}
              onChange={(e) => {
                setAgreeToTerms(e.target.checked);
                handleInputChange();
              }}
              onBlur={() => validateField('agreeToTerms')}
            />
          </div>
          <div className="ml-3">
            <label htmlFor="agreeToTerms" className="text-sm text-gray-700">
              I agree to the{' '}
              <Link to="/terms" className="text-emerald-600 hover:text-emerald-700">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-emerald-600 hover:text-emerald-700">
                Privacy Policy
              </Link>
            </label>
            {formSubmitted && agreeToTermsError && (
              <p className="mt-1 text-sm text-red-600">{agreeToTermsError}</p>
            )}
          </div>
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
              Creating account...
            </span>
          ) : (
            'Create Account'
          )}
        </button>
      </form>
      
      {/* Login link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-emerald-600 font-medium hover:text-emerald-700">
            Sign in
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

export default RegisterForm;