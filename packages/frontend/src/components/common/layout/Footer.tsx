import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="py-6 bg-white border-t border-gray-200">
      <div className="container px-4 mx-auto max-w-7xl md:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div>
            <Link to="/" className="text-xl font-bold text-primary-600">
              Gemstone System
            </Link>
            <p className="mt-2 text-sm text-gray-500">
              The complete platform for gemstone lifecycle management
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link to="/about" className="text-gray-600 hover:text-primary-600">
              About
            </Link>
            <Link to="/contact" className="text-gray-600 hover:text-primary-600">
              Contact
            </Link>
            <Link to="/privacy" className="text-gray-600 hover:text-primary-600">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-600 hover:text-primary-600">
              Terms of Service
            </Link>
          </div>
        </div>
        
        <div className="mt-6 border-t border-gray-200 pt-6 text-center text-sm text-gray-500">
          &copy; {year} Gemstone System. All rights reserved.
        </div>
      </div>
    </footer>
  );
};