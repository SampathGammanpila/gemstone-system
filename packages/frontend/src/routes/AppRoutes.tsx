import React from 'react';
import { Route, Routes, Navigate, Link } from 'react-router-dom';

// Layout components
import { UserLayout } from "@components/common/layout/UserLayout";

// Pages
import { Home } from "@pages/Home";
import { Login } from "@pages/Auth/Login";
import { Register } from "@pages/Auth/Register";
import { ProfessionalRegister } from "@pages/Auth/ProfessionalRegister";

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/professional-register" element={<ProfessionalRegister />} />
      
      {/* Protected routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <UserLayout>
              <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
                <p className="text-gray-700">This is a placeholder for the dashboard.</p>
                <p className="text-gray-700 mt-2">More functionality will be added in future development phases.</p>
              </div>
            </UserLayout>
          </ProtectedRoute>
        } 
      />
      
      {/* Marketplace placeholder */}
      <Route 
        path="/marketplace" 
        element={
          <UserLayout>
            <div className="p-4">
              <h1 className="text-2xl font-bold mb-4">Marketplace</h1>
              <p className="text-gray-700">This is a placeholder for the marketplace feature.</p>
              <p className="text-gray-700 mt-2">The marketplace will be implemented in Phase 8 of development.</p>
            </div>
          </UserLayout>
        } 
      />
      
      {/* Valuation placeholder */}
      <Route 
        path="/valuation" 
        element={
          <UserLayout>
            <div className="p-4">
              <h1 className="text-2xl font-bold mb-4">Gemstone Valuation</h1>
              <p className="text-gray-700">This is a placeholder for the valuation feature.</p>
              <p className="text-gray-700 mt-2">The valuation system will be implemented in Phase 3-6 of development.</p>
            </div>
          </UserLayout>
        } 
      />
      
      {/* Verification pending page */}
      <Route 
        path="/verification-pending" 
        element={
          <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Verification Pending</h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                  Your professional account registration is complete, but requires verification.
                </p>
              </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
              <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Next Steps</h3>
                    <ul className="mt-2 list-disc pl-5 text-sm text-gray-600 space-y-2">
                      <li>Our team will review your registration details</li>
                      <li>You may be contacted to provide additional documentation</li>
                      <li>Verification typically takes 2-3 business days</li>
                      <li>You'll receive an email notification once verified</li>
                    </ul>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <Link to="/login" className="text-indigo-600 hover:text-indigo-500">
                      Return to login
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        } 
      />
      
      {/* Catch all route - 404 page */}
      <Route 
        path="*" 
        element={
          <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
              <div className="text-center">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">404 - Page Not Found</h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                  The page you are looking for doesn't exist or has been moved.
                </p>
                <div className="mt-8">
                  <Link to="/" className="text-indigo-600 hover:text-indigo-500">
                    Go back to the homepage
                  </Link>
                </div>
              </div>
            </div>
          </div>
        } 
      />
    </Routes>
  );
};