import React from 'react';
import { Link } from 'react-router-dom';

interface VerificationMessageProps {
  email?: string;
  isSuccess?: boolean;
  isError?: boolean;
  errorMessage?: string;
}

const VerificationMessage: React.FC<VerificationMessageProps> = ({
  email,
  isSuccess = false,
  isError = false,
  errorMessage = 'The verification link is invalid or has expired.'
}) => {
  // Success verification message
  if (isSuccess) {
    return (
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mt-4">Email Verified!</h2>
          <p className="text-gray-600 mt-2">
            Your email address has been successfully verified.
          </p>
          <p className="text-gray-600 mt-2">
            You can now login to your account and access all features.
          </p>
          <div className="mt-6">
            <Link to="/auth/login" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition duration-200">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Error verification message
  if (isError) {
    return (
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mt-4">Verification Failed</h2>
          <p className="text-gray-600 mt-2">
            {errorMessage}
          </p>
          <div className="mt-6 space-y-3">
            <div>
              <Link to="/auth/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
                Back to Login
              </Link>
            </div>
            <div>
              <Link to="/auth/resend-verification" className="text-emerald-600 hover:text-emerald-700 font-medium">
                Resend Verification Email
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Default: Pending verification message
  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
      <div className="mb-6">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mt-4">Verify Your Email</h2>
        {email ? (
          <p className="text-gray-600 mt-2">
            A verification link has been sent to <span className="font-medium">{email}</span>.
          </p>
        ) : (
          <p className="text-gray-600 mt-2">
            A verification link has been sent to your email address.
          </p>
        )}
        <p className="text-gray-600 mt-2">
          Please check your inbox and click the verification link to activate your account.
        </p>
        <div className="mt-6 space-y-3">
          <div>
            <p className="text-gray-600 text-sm">
              Didn't receive the email?
            </p>
          </div>
          <div>
            <Link to="/auth/resend-verification" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Resend Verification Email
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationMessage;