import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import VerificationMessage from '../../components/auth/VerificationMessage';
import { useAuth } from '../../hooks/useAuth';

// Using both named and default export to support both import styles
export const VerifyEmail: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { verifyEmail, error } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  
  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setIsError(true);
        setIsVerifying(false);
        return;
      }
      
      try {
        await verifyEmail({ token });
        setIsSuccess(true);
      } catch (error) {
        setIsError(true);
      } finally {
        setIsVerifying(false);
      }
    };
    
    verify();
  }, [token, verifyEmail]);
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <img src="/assets/images/logos/logo.svg" alt="Gemstone System" className="h-12 mx-auto" />
          </div>
          
          {isVerifying ? (
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="flex justify-center">
                <div className="w-12 h-12 border-t-4 border-b-4 border-emerald-500 rounded-full animate-spin"></div>
              </div>
              <p className="mt-4 text-gray-600">Verifying your email...</p>
            </div>
          ) : (
            <VerificationMessage 
              isSuccess={isSuccess} 
              isError={isError}
              errorMessage={error || 'The verification link is invalid or has expired.'}
            />
          )}
        </div>
      </div>
      
      {/* Image section (hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 bg-emerald-700">
        <div className="relative w-full h-full">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/90 to-emerald-900/90"></div>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/assets/images/backgrounds/gemstone-bg.jpg')" }}></div>
          <div className="absolute inset-0 flex flex-col justify-center items-center p-12 text-white">
            <h1 className="text-4xl font-bold mb-4 text-center">Email Verification</h1>
            <p className="text-lg text-center max-w-lg">
              Verify your email address to complete your account setup.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
