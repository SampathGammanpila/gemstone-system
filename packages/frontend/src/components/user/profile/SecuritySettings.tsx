import React, { useState, useEffect } from 'react';
import userService from '../../../services/api/user.service';
import { SecuritySettings as SecuritySettingsType, UpdateSecurityData, UpdatePasswordData } from '../../../types/user.types';
import { validatePassword, validatePasswordConfirmation } from '../../../utils/validation';

const SecuritySettings: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Settings state
  const [settings, setSettings] = useState<SecuritySettingsType | null>(null);
  
  // Form state for security settings
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorMethod, setTwoFactorMethod] = useState<'app' | 'sms' | 'email' | null>(null);
  const [sessionTimeout, setSessionTimeout] = useState(30); // Minutes
  
  // Two-factor setup state
  const [isTwoFactorSetupOpen, setIsTwoFactorSetupOpen] = useState(false);
  const [setupMethod, setSetupMethod] = useState<'app' | 'sms' | 'email'>('app');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isSettingUp2FA, setIsSettingUp2FA] = useState(false);
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);
  
  // Password change form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Fetch security settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const settings = await userService.getSecuritySettings();
        setSettings(settings);
        
        // Initialize form state with fetched settings
        setTwoFactorEnabled(settings.twoFactorEnabled);
        setTwoFactorMethod(settings.twoFactorMethod);
        setSessionTimeout(settings.sessionTimeout);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load security settings');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, []);
  
  // Handle security settings form submission
  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Only include changed settings
      const updateData: UpdateSecurityData = {};
      
      if (settings?.sessionTimeout !== sessionTimeout) {
        updateData.sessionTimeout = sessionTimeout;
      }
      
      // Only submit if there are changes
      if (Object.keys(updateData).length === 0) {
        setIsSaving(false);
        return;
      }
      
      const updatedSettings = await userService.updateSecurity(updateData);
      setSettings(updatedSettings);
      setSuccessMessage('Security settings updated successfully');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update security settings');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle password change form submission
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password
    const currentPasswordError = currentPassword ? '' : 'Current password is required';
    const newPasswordError = validatePassword(newPassword);
    const confirmPasswordError = validatePasswordConfirmation(newPassword, confirmPassword);
    
    setPasswordErrors({
      currentPassword: currentPasswordError,
      newPassword: newPasswordError,
      confirmPassword: confirmPasswordError
    });
    
    if (currentPasswordError || newPasswordError || confirmPasswordError) {
      return;
    }
    
    setIsChangingPassword(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      await userService.updatePassword({
        currentPassword,
        newPassword,
        confirmPassword
      });
      
      setSuccessMessage('Password updated successfully');
      
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update password');
    } finally {
      setIsChangingPassword(false);
    }
  };
  
  // Setup two-factor authentication
  const handleSetup2FA = async () => {
    setIsSettingUp2FA(true);
    setSetupError(null);
    
    try {
      const result = await userService.setupTwoFactor(setupMethod);
      if (result.qrCode) {
        setQrCode(result.qrCode);
      }
      if (result.secret) {
        setSecret(result.secret);
      }
    } catch (error) {
      setSetupError(error instanceof Error ? error.message : 'Failed to setup two-factor authentication');
    } finally {
      setIsSettingUp2FA(false);
    }
  };
  
  // Verify two-factor authentication
  const handleVerify2FA = async () => {
    if (!verificationCode) {
      setSetupError('Verification code is required');
      return;
    }
    
    setIsVerifying2FA(true);
    setSetupError(null);
    
    try {
      await userService.verifyTwoFactor(verificationCode);
      
      // Update local state
      setTwoFactorEnabled(true);
      setTwoFactorMethod(setupMethod);
      
      // Close setup modal
      setIsTwoFactorSetupOpen(false);
      setQrCode(null);
      setSecret(null);
      setVerificationCode('');
      
      setSuccessMessage('Two-factor authentication enabled successfully');
    } catch (error) {
      setSetupError(error instanceof Error ? error.message : 'Failed to verify code. Please try again.');
    } finally {
      setIsVerifying2FA(false);
    }
  };
  
  // Disable two-factor authentication
  const handleDisable2FA = async () => {
    if (!verificationCode) {
      setSetupError('Verification code is required');
      return;
    }
    
    setIsVerifying2FA(true);
    setSetupError(null);
    
    try {
      await userService.disableTwoFactor(verificationCode);
      
      // Update local state
      setTwoFactorEnabled(false);
      setTwoFactorMethod(null);
      
      // Close setup modal
      setIsTwoFactorSetupOpen(false);
      setVerificationCode('');
      
      setSuccessMessage('Two-factor authentication disabled successfully');
    } catch (error) {
      setSetupError(error instanceof Error ? error.message : 'Failed to disable two-factor authentication');
    } finally {
      setIsVerifying2FA(false);
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
        <h2 className="text-2xl font-bold text-gray-800">Security Settings</h2>
        <p className="text-gray-600 mt-1">Manage your account security and password</p>
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
      
      <div className="space-y-8">
        {/* Two-Factor Authentication */}
        <div className="p-6 border border-gray-200 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-800">Two-Factor Authentication</h3>
              <p className="text-gray-600 mt-1">
                Add an extra layer of security to your account
              </p>
            </div>
            {twoFactorEnabled ? (
              <div className="flex items-center">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                <span className="text-green-600 font-medium">Enabled</span>
              </div>
            ) : (
              <div className="flex items-center">
                <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                <span className="text-red-600 font-medium">Disabled</span>
              </div>
            )}
          </div>
          
          <div className="mt-4">
            {twoFactorEnabled ? (
              <div>
                <p className="text-gray-700 mb-2">
                  You're currently using{' '}
                  <span className="font-medium">
                    {twoFactorMethod === 'app' ? 'Authenticator App' : 
                     twoFactorMethod === 'sms' ? 'SMS' : 
                     'Email'}
                  </span>{' '}
                  for two-factor authentication.
                </p>
                <button
                  type="button"
                  onClick={() => setIsTwoFactorSetupOpen(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Disable Two-Factor
                </button>
              </div>
            ) : (
              <div>
                <p className="text-gray-700 mb-2">
                  We strongly recommend enabling two-factor authentication for added security.
                </p>
                <button
                  type="button"
                  onClick={() => setIsTwoFactorSetupOpen(true)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  Enable Two-Factor
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Password Change */}
        <div className="p-6 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800">Change Password</h3>
          <p className="text-gray-600 mt-1 mb-4">
            Update your password to maintain account security
          </p>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {/* Current Password */}
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                id="currentPassword"
                type="password"
                className={`w-full px-4 py-2 border ${
                  passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              {passwordErrors.currentPassword && (
                <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword}</p>
              )}
            </div>
            
            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                className={`w-full px-4 py-2 border ${
                  passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              {passwordErrors.newPassword && (
                <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
              )}
            </div>
            
            {/* Confirm New Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                className={`w-full px-4 py-2 border ${
                  passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {passwordErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
              )}
            </div>
            
            {/* Password requirements */}
            <div className="text-sm text-gray-600">
              <p>Password requirements:</p>
              <ul className="list-disc list-inside ml-2 mt-1">
                <li>At least 8 characters long</li>
                <li>At least one uppercase letter</li>
                <li>At least one lowercase letter</li>
                <li>At least one number</li>
              </ul>
            </div>
            
            {/* Submit button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isChangingPassword}
              >
                {isChangingPassword ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating Password...
                  </span>
                ) : (
                  'Update Password'
                )}
              </button>
            </div>
          </form>
        </div>
        
        {/* Session Settings */}
        <div className="p-6 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800">Session Settings</h3>
          <p className="text-gray-600 mt-1 mb-4">
            Configure how long you can remain signed in
          </p>
          
          <form onSubmit={handleSecuritySubmit} className="space-y-4">
            <div>
              <label htmlFor="sessionTimeout" className="block text-sm font-medium text-gray-700 mb-1">
                Session Timeout (minutes)
              </label>
              <select
                id="sessionTimeout"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(parseInt(e.target.value, 10))}
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={120}>2 hours</option>
                <option value={240}>4 hours</option>
                <option value={480}>8 hours</option>
                <option value={720}>12 hours</option>
                <option value={1440}>24 hours</option>
              </select>
              <p className="mt-1 text-sm text-gray-600">
                Your session will automatically end after this period of inactivity.
              </p>
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
        
        {/* Last login info */}
        <div className="p-6 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800">Account Activity</h3>
          <div className="mt-4">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Last password change</span>
              <span className="text-gray-900 font-medium">
                {settings?.lastPasswordChange ? 
                  new Date(settings.lastPasswordChange).toLocaleDateString() : 
                  'Never'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Two-Factor Authentication Modal */}
      {isTwoFactorSetupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {twoFactorEnabled ? 'Disable Two-Factor Authentication' : 'Enable Two-Factor Authentication'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsTwoFactorSetupOpen(false);
                  setQrCode(null);
                  setSecret(null);
                  setVerificationCode('');
                  setSetupError(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {setupError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded text-sm">
                {setupError}
              </div>
            )}
            
            {twoFactorEnabled ? (
              // Disable 2FA
              <div className="space-y-4">
                <p className="text-gray-700">
                  To disable two-factor authentication, please enter the verification code from your authenticator app.
                </p>
                
                <div>
                  <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-1">
                    Verification Code
                  </label>
                  <input
                    id="verificationCode"
                    type="text"
                    maxLength={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsTwoFactorSetupOpen(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDisable2FA}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isVerifying2FA}
                  >
                    {isVerifying2FA ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verifying...
                      </span>
                    ) : (
                      'Disable Two-Factor'
                    )}
                  </button>
                </div>
              </div>
            ) : (
              // Enable 2FA
              <div className="space-y-4">
                {!qrCode && !secret ? (
                  // Step 1: Select method
                  <div className="space-y-4">
                    <p className="text-gray-700">
                      Choose how you want to receive verification codes:
                    </p>
                    
                    <div className="space-y-2">
                      <div
                        className={`border rounded-md p-4 cursor-pointer ${
                          setupMethod === 'app' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSetupMethod('app')}
                      >
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">Authenticator App</h4>
                            <p className="text-sm text-gray-600">Use Google Authenticator, Authy, or another authenticator app</p>
                          </div>
                        </div>
                      </div>
                      
                      <div
                        className={`border rounded-md p-4 cursor-pointer ${
                          setupMethod === 'sms' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSetupMethod('sms')}
                      >
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">SMS Text Message</h4>
                            <p className="text-sm text-gray-600">Receive verification codes via SMS</p>
                          </div>
                        </div>
                      </div>
                      
                      <div
                        className={`border rounded-md p-4 cursor-pointer ${
                          setupMethod === 'email' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSetupMethod('email')}
                      >
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">Email</h4>
                            <p className="text-sm text-gray-600">Receive verification codes via email</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3 mt-6">
                      <button
                        type="button"
                        onClick={() => setIsTwoFactorSetupOpen(false)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSetup2FA}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSettingUp2FA}
                      >
                        {isSettingUp2FA ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Setting Up...
                          </span>
                        ) : (
                          'Continue'
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  // Step 2: Setup and verification
                  <div className="space-y-4">
                    {setupMethod === 'app' && (
                      <>
                        <p className="text-gray-700">
                          Scan the QR code below with your authenticator app, or enter the code manually:
                        </p>
                        
                        {qrCode && (
                          <div className="flex justify-center my-4">
                            <img src={qrCode} alt="QR Code for authenticator app" className="border border-gray-200 p-2 rounded" />
                          </div>
                        )}
                        
                        {secret && (
                          <div className="bg-gray-50 p-3 rounded border border-gray-200 text-center">
                            <p className="text-sm text-gray-600 mb-1">Manual entry code:</p>
                            <p className="font-mono text-lg font-medium break-all">{secret}</p>
                          </div>
                        )}
                      </>
                    )}
                    
                    {setupMethod === 'sms' && (
                      <p className="text-gray-700">
                        A verification code has been sent to your registered phone number.
                      </p>
                    )}
                    
                    {setupMethod === 'email' && (
                      <p className="text-gray-700">
                        A verification code has been sent to your email address.
                      </p>
                    )}
                    
                    <div>
                      <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-1">
                        Verification Code
                      </label>
                      <input
                        id="verificationCode"
                        type="text"
                        maxLength={6}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Enter 6-digit code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setIsTwoFactorSetupOpen(false)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleVerify2FA}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isVerifying2FA}
                      >
                        {isVerifying2FA ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Verifying...
                          </span>
                        ) : (
                          'Verify and Enable'
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
