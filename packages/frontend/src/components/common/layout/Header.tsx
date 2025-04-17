import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { useUI } from '@hooks/useUI';
import { useToast } from '@hooks/useToast';
import { Menu, X, User, LogOut, Menu as MenuIcon } from 'lucide-react';

export const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { toggleSidebar, isSidebarOpen } = useUI();
  const navigate = useNavigate();
  const toast = useToast();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Successfully logged out');
    navigate('/login');
  };

  return (
    <header className="fixed z-40 w-full bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 md:px-6 lg:px-8">
        <div className="flex items-center">
          {isAuthenticated && (
            <button
              onClick={toggleSidebar}
              className="p-2 mr-4 text-gray-500 rounded-md lg:hidden focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {isSidebarOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          )}
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-primary-600">
              Gemstone System
            </span>
          </Link>
        </div>

        <div className="flex items-center">
          {isAuthenticated ? (
            <div className="relative">
              <button
                className="flex items-center p-2 text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              >
                {user?.profile_image_url ? (
                  <img
                    src={user.profile_image_url}
                    alt="Profile"
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-8 h-8 text-white bg-primary-600 rounded-full">
                    {user?.first_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <span className="ml-2 hidden md:block">
                  {user?.first_name} {user?.last_name}
                </span>
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <User className="w-4 h-4 mr-2" />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center">
              <Link
                to="/login"
                className="px-4 py-2 mr-2 text-sm font-medium text-gray-700 rounded-md hover:text-primary-600"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="btn btn-primary"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};