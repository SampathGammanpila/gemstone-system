import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { 
  Home, 
  Diamond, 
  Gem, 
  ShoppingBag, 
  FileText, 
  User, 
  Settings, 
  Box, 
  Users, 
  Award
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const roles = user?.roles || [];

  const navLinkClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center px-4 py-2 text-sm font-medium ${
      isActive 
        ? 'text-primary-600 bg-primary-50' 
        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
    }`;

  return (
    <div className="flex flex-col h-full py-4 overflow-y-auto bg-white">
      <div className="px-4 mb-6">
        <h3 className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
          Main
        </h3>
      </div>

      <nav className="flex-1 space-y-1">
        <NavLink to="/dashboard" className={navLinkClass}>
          <Home className="w-5 h-5 mr-3" />
          Dashboard
        </NavLink>

        <div className="px-4 mt-6 mb-2">
          <h3 className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
            Gemstones
          </h3>
        </div>

        <NavLink to="/gemstones" className={navLinkClass}>
          <Diamond className="w-5 h-5 mr-3" />
          Cut Gemstones
        </NavLink>

        <NavLink to="/rough-stones" className={navLinkClass}>
          <Box className="w-5 h-5 mr-3" />
          Rough Stones
        </NavLink>

        <NavLink to="/jewelry" className={navLinkClass}>
          <Gem className="w-5 h-5 mr-3" />
          Jewelry
        </NavLink>

        <div className="px-4 mt-6 mb-2">
          <h3 className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
            Marketplace
          </h3>
        </div>

        <NavLink to="/marketplace" className={navLinkClass}>
          <ShoppingBag className="w-5 h-5 mr-3" />
          Browse Marketplace
        </NavLink>

        <NavLink to="/orders" className={navLinkClass}>
          <FileText className="w-5 h-5 mr-3" />
          My Orders
        </NavLink>

        {(roles.includes('dealer') || roles.includes('cutter') || roles.includes('appraiser')) && (
          <>
            <div className="px-4 mt-6 mb-2">
              <h3 className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                Professional
              </h3>
            </div>

            {roles.includes('dealer') && (
              <NavLink to="/professional/inventory" className={navLinkClass}>
                <Diamond className="w-5 h-5 mr-3" />
                My Inventory
              </NavLink>
            )}

            {roles.includes('cutter') && (
              <NavLink to="/professional/cutting" className={navLinkClass}>
                <Gem className="w-5 h-5 mr-3" />
                Cutting Projects
              </NavLink>
            )}

            {roles.includes('appraiser') && (
              <NavLink to="/professional/appraisals" className={navLinkClass}>
                <Award className="w-5 h-5 mr-3" />
                Appraisals
              </NavLink>
            )}

            <NavLink to="/professional/dashboard" className={navLinkClass}>
              <Users className="w-5 h-5 mr-3" />
              Professional Dashboard
            </NavLink>
          </>
        )}

        <div className="px-4 mt-6 mb-2">
          <h3 className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
            Account
          </h3>
        </div>

        <NavLink to="/profile" className={navLinkClass}>
          <User className="w-5 h-5 mr-3" />
          Profile
        </NavLink>

        <NavLink to="/settings" className={navLinkClass}>
          <Settings className="w-5 h-5 mr-3" />
          Settings
        </NavLink>
      </nav>
    </div>
  );
};