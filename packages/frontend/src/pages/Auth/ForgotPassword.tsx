import React from 'react';
import ForgotPasswordForm from '../../components/auth/ForgotPasswordForm';

// Using both named and default export to support both import styles
export const ForgotPassword: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <img src="/assets/images/logos/logo.svg" alt="Gemstone System" className="h-12 mx-auto" />
          </div>
          <ForgotPasswordForm />
        </div>
      </div>
      
      {/* Image section (hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 bg-emerald-700">
        <div className="relative w-full h-full">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/90 to-emerald-900/90"></div>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/assets/images/backgrounds/gemstone-bg.jpg')" }}></div>
          <div className="absolute inset-0 flex flex-col justify-center items-center p-12 text-white">
            <h1 className="text-4xl font-bold mb-4 text-center">Password Recovery</h1>
            <p className="text-lg text-center max-w-lg">
              We'll help you reset your password and restore access to your account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
