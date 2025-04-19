import React, { useState, useEffect } from 'react';
import userService from '../../../services/api/user.service';
import { UserSettings, UpdateSettingsData } from '../../../types/user.types';

const ProfileSettings: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Settings state
  const [settings, setSettings] = useState<UserSettings | null>(null);
  
  // Form state
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [marketplaceUpdates, setMarketplaceUpdates] = useState(false);
  const [certificateAlerts, setCertificateAlerts] = useState(false);
  const [transferNotifications, setTransferNotifications] = useState(false);
  const [newMessageNotifications, setNewMessageNotifications] = useState(false);
  const [language, setLanguage] = useState('en');
  const [currency, setCurrency] = useState('USD');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  
  // Fetch user settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const settings = await userService.getUserSettings();
        setSettings(settings);
        
        // Initialize form state with fetched settings
        setEmailNotifications(settings.emailNotifications);
        setMarketplaceUpdates(settings.marketplaceUpdates);
        setCertificateAlerts(settings.certificateAlerts);
        setTransferNotifications(settings.transferNotifications);
        setNewMessageNotifications(settings.newMessageNotifications);
        setLanguage(settings.language);
        setCurrency(settings.currency);
        setTheme(settings.theme);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, []);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Only include changed settings
      const updateData: UpdateSettingsData = {};
      
      if (settings?.emailNotifications !== emailNotifications) {
        updateData.emailNotifications = emailNotifications;
      }
      
      if (settings?.marketplaceUpdates !== marketplaceUpdates) {
        updateData.marketplaceUpdates = marketplaceUpdates;
      }
      
      if (settings?.certificateAlerts !== certificateAlerts) {
        updateData.certificateAlerts = certificateAlerts;
      }
      
      if (settings?.transferNotifications !== transferNotifications) {
        updateData.transferNotifications = transferNotifications;
      }
      
      if (settings?.newMessageNotifications !== newMessageNotifications) {
        updateData.newMessageNotifications = newMessageNotifications;
      }
      
      if (settings?.language !== language) {
        updateData.language = language;
      }
      
      if (settings?.currency !== currency) {
        updateData.currency = currency;
      }
      
      if (settings?.theme !== theme) {
        updateData.theme = theme;
      }
      
      // Only submit if there are changes
      if (Object.keys(updateData).length === 0) {
        setIsSaving(false);
        return;
      }
      
      const updatedSettings = await userService.updateSettings(updateData);
      setSettings(updatedSettings);
      setSuccessMessage('Settings updated successfully');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-6 w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded mb-4 w-full"></div>
          <div className="h-4 bg-gray-200 rounded mb-4 w-full"></div>
          <div className="h-4 bg-gray-200 rounded mb-4 w-full"></div>
          <div className="h-4 bg-gray-200 rounded mb-4 w-full"></div>
          <div className="h-4 bg-gray-200 rounded mb-4 w-2/3"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Preferences</h2>
        <p className="text-gray-600 mt-1">Manage your notifications and account preferences</p>
      </div>
      
      {/* Success message */}
      {successMessage && (
        <div className="mb-6 p-3 bg-green-100 border border-green-200 text-green-700 rounded">
          {successMessage}
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="mb-6 p-3 bg-red-100 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Notification Settings */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Notification Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                id="emailNotifications"
                type="checkbox"
                className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
              />
              <label htmlFor="emailNotifications" className="ml-3 text-gray-700">
                Email Notifications
                <p className="text-sm text-gray-500">Receive email notifications for important updates</p>
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="marketplaceUpdates"
                type="checkbox"
                className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                checked={marketplaceUpdates}
                onChange={(e) => setMarketplaceUpdates(e.target.checked)}
              />
              <label htmlFor="marketplaceUpdates" className="ml-3 text-gray-700">
                Marketplace Updates
                <p className="text-sm text-gray-500">Get notified about new listings and marketplace activity</p>
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="certificateAlerts"
                type="checkbox"
                className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                checked={certificateAlerts}
                onChange={(e) => setCertificateAlerts(e.target.checked)}
              />
              <label htmlFor="certificateAlerts" className="ml-3 text-gray-700">
                Certificate Alerts
                <p className="text-sm text-gray-500">Receive alerts about certificate updates and verifications</p>
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="transferNotifications"
                type="checkbox"
                className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                checked={transferNotifications}
                onChange={(e) => setTransferNotifications(e.target.checked)}
              />
              <label htmlFor="transferNotifications" className="ml-3 text-gray-700">
                Transfer Notifications
                <p className="text-sm text-gray-500">Get notified about ownership transfer requests and completions</p>
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="newMessageNotifications"
                type="checkbox"
                className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                checked={newMessageNotifications}
                onChange={(e) => setNewMessageNotifications(e.target.checked)}
              />
              <label htmlFor="newMessageNotifications" className="ml-3 text-gray-700">
                Message Notifications
                <p className="text-sm text-gray-500">Get notified when you receive new messages</p>
              </label>
            </div>
          </div>
        </div>
        
        {/* Language and Regional Settings */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Language and Regional Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <select
                id="language"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="zh">中文</option>
                <option value="ja">日本語</option>
                <option value="ar">العربية</option>
                <option value="ru">Русский</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                id="currency"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
                <option value="GBP">British Pound (£)</option>
                <option value="JPY">Japanese Yen (¥)</option>
                <option value="CAD">Canadian Dollar (CA$)</option>
                <option value="AUD">Australian Dollar (A$)</option>
                <option value="INR">Indian Rupee (₹)</option>
                <option value="CNY">Chinese Yuan (CN¥)</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Appearance Settings */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Appearance</h3>
          <div>
            <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">
              Theme
            </label>
            <div className="grid grid-cols-3 gap-4">
              <div
                className={`border rounded-md p-4 text-center cursor-pointer ${
                  theme === 'light' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setTheme('light')}
              >
                <div className="w-full h-24 mb-2 bg-white border border-gray-200 rounded-md flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="font-medium">Light</span>
              </div>
              
              <div
                className={`border rounded-md p-4 text-center cursor-pointer ${
                  theme === 'dark' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setTheme('dark')}
              >
                <div className="w-full h-24 mb-2 bg-gray-800 border border-gray-700 rounded-md flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                </div>
                <span className="font-medium">Dark</span>
              </div>
              
              <div
                className={`border rounded-md p-4 text-center cursor-pointer ${
                  theme === 'system' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setTheme('system')}
              >
                <div className="w-full h-24 mb-2 bg-gradient-to-r from-white to-gray-800 border border-gray-200 rounded-md flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="font-medium">System</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Submit button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSaving}
          >
            {isSaving ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              'Save Preferences'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;