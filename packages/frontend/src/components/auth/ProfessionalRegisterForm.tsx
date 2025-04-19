import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
  validateRequired,
  validateTermsAgreement,
  validatePhone,
  validateUrl
} from '../../utils/validation';

const ProfessionalRegisterForm: React.FC = () => {
  const { registerProfessional, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  
  // Form state - Basic info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Form state - Professional info
  const [professionalType, setProfessionalType] = useState<'dealer' | 'cutter' | 'appraiser'>('dealer');
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [experience, setExperience] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1);
  
  // Validation state - Basic info
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  // Validation state - Professional info
  const [businessNameError, setBusinessNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [websiteError, setWebsiteError] = useState('');
  const [agreeToTermsError, setAgreeToTermsError] = useState('');
  
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  // Validate form fields
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
      
      case 'businessName':
        const businessNameError = validateRequired(businessName, 'Business name');
        setBusinessNameError(businessNameError);
        return !businessNameError;
      
      case 'phone':
        const phoneError = validatePhone(phone);
        setPhoneError(phoneError);
        return !phoneError;
      
      case 'website':
        const websiteError = validateUrl(website);
        setWebsiteError(websiteError);
        return !websiteError;
      
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
  
  // Validate step 1 fields
  const validateStep1 = () => {
    const isFirstNameValid = validateField('firstName');
    const isLastNameValid = validateField('lastName');
    const isEmailValid = validateField('email');
    const isPasswordValid = validateField('password');
    const isConfirmPasswordValid = validateField('confirmPassword');
    
    return isFirstNameValid && isLastNameValid && isEmailValid && 
           isPasswordValid && isConfirmPasswordValid;
  };
  
  // Validate step 2 fields
  const validateStep2 = () => {
    const isBusinessNameValid = validateField('businessName');
    const isPhoneValid = validateField('phone');
    const isWebsiteValid = validateField('website');
    const isAgreeToTermsValid = validateField('agreeToTerms');
    
    return isBusinessNameValid && isPhoneValid && isWebsiteValid && isAgreeToTermsValid;
  };
  
  // Handle next step
  const handleNextStep = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
    }
  };
  
  // Handle previous step
  const handlePrevStep = () => {
    setCurrentStep(1);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    
    if (!validateStep2()) {
      return;
    }
    
    try {
      const specialtiesArray = specialties.split(',')
        .map(item => item.trim())
        .filter(item => item !== '');
      
      const experienceYears = experience ? parseInt(experience, 10) : undefined;
      
      await registerProfessional({
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        agreeToTerms,
        professionalType,
        businessName,
        businessAddress,
        phone,
        website: website || undefined,
        licenseNumber: licenseNumber || undefined,
        experience: experienceYears,
        specialties: specialtiesArray.length > 0 ? specialtiesArray : undefined
      });
      
      // Show success message
      setRegistrationSuccess(true);
      
      // Redirect to login page after 5 seconds
      setTimeout(() => {
        navigate('/auth/login');
      }, 5000);
    } catch (error) {
      // Error is already handled in the registerProfessional function
      console.error('Professional registration failed', error);
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
          <h2 className="text-2xl font-bold text-gray-800 mt-4">Registration Submitted!</h2>
          <p className="text-gray-600 mt-2">
            Your professional registration has been submitted for review.
          </p>
          <p className="text-gray-600 mt-2">
            We'll verify your information and notify you via email when your account is approved.
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
        <h2 className="text-3xl font-bold text-gray-800">Professional Registration</h2>
        <p className="text-gray-600 mt-2">Join our network of gemstone professionals</p>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {/* Step indicator */}
      <div className="mb-6">
        <div className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            currentStep === 1 ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700'
          }`}>
            1
          </div>
          <div className="flex-1 h-1 mx-2 bg-gray-200">
            <div className={`h-full ${currentStep === 2 ? 'bg-emerald-600' : 'bg-gray-200'}`}></div>
          </div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            currentStep === 2 ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700'
          }`}>
            2
          </div>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-600">Account Information</span>
          <span className="text-xs text-gray-600">Professional Details</span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <>
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
            
            {/* Next button */}
            <button
              type="button"
              className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition duration-200"
              onClick={handleNextStep}
            >
              Next Step
            </button>
          </>
        )}
        
        {/* Step 2: Professional Info */}
        {currentStep === 2 && (
          <>
            {/* Professional type */}
            <div>
              <label htmlFor="professionalType" className="block text-sm font-medium text-gray-700 mb-1">
                Professional Type
              </label>
              <select
                id="professionalType"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={professionalType}
                onChange={(e) => setProfessionalType(e.target.value as 'dealer' | 'cutter' | 'appraiser')}
              >
                <option value="dealer">Dealer</option>
                <option value="cutter">Cutter</option>
                <option value="appraiser">Appraiser</option>
              </select>
            </div>
            
            {/* Business name field */}
            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
                Business Name
              </label>
              <input
                id="businessName"
                type="text"
                className={`w-full px-4 py-2 border ${
                  formSubmitted && businessNameError ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                placeholder="Your Business Name"
                value={businessName}
                onChange={(e) => {
                  setBusinessName(e.target.value);
                  handleInputChange();
                }}
                onBlur={() => validateField('businessName')}
              />
              {formSubmitted && businessNameError && (
                <p className="mt-1 text-sm text-red-600">{businessNameError}</p>
              )}
            </div>
            
            {/* Business address field */}
            <div>
              <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700 mb-1">
                Business Address (Optional)
              </label>
              <textarea
                id="businessAddress"
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="123 Main St, City, Country"
                value={businessAddress}
                onChange={(e) => setBusinessAddress(e.target.value)}
              />
            </div>
            
            {/* Phone field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                className={`w-full px-4 py-2 border ${
                  formSubmitted && phoneError ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                placeholder="+1 (123) 456-7890"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  handleInputChange();
                }}
                onBlur={() => validateField('phone')}
              />
              {formSubmitted && phoneError && (
                <p className="mt-1 text-sm text-red-600">{phoneError}</p>
              )}
            </div>
            
            {/* Website field */}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                Website (Optional)
              </label>
              <input
                id="website"
                type="url"
                className={`w-full px-4 py-2 border ${
                  formSubmitted && websiteError ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                placeholder="https://yourbusiness.com"
                value={website}
                onChange={(e) => {
                  setWebsite(e.target.value);
                  handleInputChange();
                }}
                onBlur={() => validateField('website')}
              />
              {formSubmitted && websiteError && (
                <p className="mt-1 text-sm text-red-600">{websiteError}</p>
              )}
            </div>
            
            {/* License number field */}
            <div>
              <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-1">
                License Number (Optional)
              </label>
              <input
                id="licenseNumber"
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="License or certification number"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
              />
            </div>
            
            {/* Experience field */}
            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                Years of Experience (Optional)
              </label>
              <input
                id="experience"
                type="number"
                min="0"
                max="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="10"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              />
            </div>
            
            {/* Specialties field */}
            <div>
              <label htmlFor="specialties" className="block text-sm font-medium text-gray-700 mb-1">
                Specialties (Optional, comma separated)
              </label>
              <input
                id="specialties"
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Diamonds, Emeralds, Faceting"
                value={specialties}
                onChange={(e) => setSpecialties(e.target.value)}
              />
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
            
            {/* Submit and Back buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-200"
                onClick={handlePrevStep}
              >
                Back
              </button>
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
                    Submitting...
                  </span>
                ) : (
                  'Submit Registration'
                )}
              </button>
            </div>
          </>
        )}
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
    </div>
  );
};

export default ProfessionalRegisterForm;