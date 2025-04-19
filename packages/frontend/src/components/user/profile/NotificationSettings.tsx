import React, { useState, useEffect } from 'react';
import userService from '../../../services/api/user.service';
import { UserSettings, UpdateSettingsData } from '../../../types/user.types';

const NotificationSettings: React.FC = () => {
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
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load notification settings');
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
      
      // Only submit if there are changes
      if (Object.keys(updateData).length === 0) {
        setIsSaving(false);
        return;
      }
      
      const updatedSettings = await userService.updateSettings(updateData);
      setSettings(updatedSettings);
      setSuccessMessage('Notification settings updated successfully');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update notification settings');
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
          <div className="h-4 bg-gray-200 rounded mb-4 w-2/3"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Notification Settings</h2>
        <p className="text-gray-600 mt-1">Manage how and when you receive notifications</p>
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
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Notifications */}
        <div className="border border-gray-200 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-800">Email Notifications</h3>
              <p className="text-gray-600 mt-1">Receive email notifications for important updates</p>
            </div>
            <div className="relative inline-block w-12 h-6 mr-2">
              <input
                id="emailNotifications"
                type="checkbox"
                className="sr-only"
                checked={emailNotifications}
                onChange={() => setEmailNotifications(!emailNotifications)}
              />
              <span
                className={`absolute inset-0 rounded-full transition-colors duration-200 ease-in-out ${
                  emailNotifications ? 'bg-emerald-600' : 'bg-gray-200'
                }`}
              ></span>
              <span
                className={`absolute left-0 top-0 w-6 h-6 bg-white rounded-full transition-transform duration-200 ease-in-out transform ${
                  emailNotifications ? 'translate-x-6' : 'translate-x-0'
                } shadow-md`}
              ></span>
            </div>
          </div>
        </div>
        
        {/* Marketplace Updates */}
        <div className="border border-gray-200 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-800">Marketplace Updates</h3>
              <p className="text-gray-600 mt-1">Get notified about new listings and marketplace activity</p>
            </div>
            <div className="relative inline-block w-12 h-6 mr-2">
              <input
                id="marketplaceUpdates"
                type="checkbox"
                className="sr-only"
                checked={marketplaceUpdates}
                onChange={() => setMarketplaceUpdates(!marketplaceUpdates)}
              />
              <span
                className={`absolute inset-0 rounded-full transition-colors duration-200 ease-in-out ${
                  marketplaceUpdates ? 'bg-emerald-600' : 'bg-gray-200'
                }`}
              ></span>
              <span
                className={`absolute left-0 top-0 w-6 h-6 bg-white rounded-full transition-transform duration-200 ease-in-out transform ${
                  marketplaceUpdates ? 'translate-x-6' : 'translate-x-0'
                } shadow-md`}
              ></span>
            </div>
          </div>
        </div>
        
        {/* Certificate Alerts */}
        <div className="border border-gray-200 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-800">Certificate Alerts</h3>
              <p className="text-gray-600 mt-1">Receive alerts about certificate updates and verifications</p>
            </div>
            <div className="relative inline-block w-12 h-6 mr-2">
              <input
                id="certificateAlerts"
                type="checkbox"
                className="sr-only"
                checked={certificateAlerts}
                onChange={() => setCertificateAlerts(!certificateAlerts)}
              />
              <span
                className={`absolute inset-0 rounded-full transition-colors duration-200 ease-in-out ${
                  certificateAlerts ? 'bg-emerald-600' : 'bg-gray-200'
                }`}
              ></span>
              <span
                className={`absolute left-0 top-0 w-6 h-6 bg-white rounded-full transition-transform duration-200 ease-in-out transform ${
                  certificateAlerts ? 'translate-x-6' : 'translate-x-0'
                } shadow-md`}
              ></span>
            </div>
          </div>
        </div>
        
        {/* Transfer Notifications */}
        <div className="border border-gray-200 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-800">Transfer Notifications</h3>
              <p className="text-gray-600 mt-1">Get notified about ownership transfer requests and completions</p>
            </div>
            <div className="relative inline-block w-12 h-6 mr-2">
              <input
                id="transferNotifications"
                type="checkbox"
                className="sr-only"
                checked={transferNotifications}
                onChange={() => setTransferNotifications(!transferNotifications)}
              />
              <span
                className={`absolute inset-0 rounded-full transition-colors duration-200 ease-in-out ${
                  transferNotifications ? 'bg-emerald-600' : 'bg-gray-200'
                }`}
              ></span>
              <span
                className={`absolute left-0 top-0 w-6 h-6 bg-white rounded-full transition-transform duration-200 ease-in-out transform ${
                  transferNotifications ? 'translate-x-6' : 'translate-x-0'
                } shadow-md`}
              ></span>
            </div>
          </div>
        </div>
        
        {/* Message Notifications */}
        <div className="border border-gray-200 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-800">Message Notifications</h3>
              <p className="text-gray-600 mt-1">Get notified when you receive new messages</p>
            </div>
            <div className="relative inline-block w-12 h-6 mr-2">
              <input
                id="newMessageNotifications"
                type="checkbox"
                className="sr-only"
                checked={newMessageNotifications}
                onChange={() => setNewMessageNotifications(!newMessageNotifications)}
              />
              <span
                className={`absolute inset-0 rounded-full transition-colors duration-200 ease-in-out ${
                  newMessageNotifications ? 'bg-emerald-600' : 'bg-gray-200'
                }`}
              ></span>
              <span
                className={`absolute left-0 top-0 w-6 h-6 bg-white rounded-full transition-transform duration-200 ease-in-out transform ${
                  newMessageNotifications ? 'translate-x-6' : 'translate-x-0'
                } shadow-md`}
              ></span>
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
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NotificationSettings;