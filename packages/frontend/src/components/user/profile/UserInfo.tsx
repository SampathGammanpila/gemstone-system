import React, { useState, useRef } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import userService from '../../../services/api/user.service';

const UserInfo: React.FC = () => {
  const { user, refreshAuth } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Form state
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.professionalProfile?.phone || '');
  
  // Avatar upload
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Toggle edit mode
  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form on cancel
      setFirstName(user?.firstName || '');
      setLastName(user?.lastName || '');
      setEmail(user?.email || '');
      setPhone(user?.professionalProfile?.phone || '');
      setAvatar(null);
      setAvatarPreview(user?.avatar || null);
    }
    setIsEditing(!isEditing);
    setError(null);
    setSuccessMessage(null);
  };
  
  // Handle avatar upload click
  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Handle avatar file change
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Only include changed fields
      const updateData: {
        firstName?: string;
        lastName?: string;
        email?: string;
        phone?: string;
        avatar?: File | null;
      } = {};
      
      if (firstName !== user?.firstName) updateData.firstName = firstName;
      if (lastName !== user?.lastName) updateData.lastName = lastName;
      if (email !== user?.email) updateData.email = email;
      if (phone !== user?.professionalProfile?.phone) updateData.phone = phone;
      if (avatar) updateData.avatar = avatar;
      
      // Only submit if there are changes
      if (Object.keys(updateData).length === 0) {
        setIsEditing(false);
        setIsLoading(false);
        return;
      }
      
      await userService.updateProfile(updateData);
      
      // Refresh auth context to update user data
      await refreshAuth();
      
      setSuccessMessage('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!user) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <p>Loading user information...</p>
      </div>
    );
  }
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Account Information</h2>
        {!isEditing ? (
          <button
            type="button"
            onClick={handleEditToggle}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            Edit Profile
          </button>
        ) : (
          <button
            type="button"
            onClick={handleEditToggle}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
        )}
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
      
      {/* Profile content */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Avatar */}
          <div className="flex flex-col items-center space-y-3">
            <div
              className={`relative w-32 h-32 rounded-full overflow-hidden ${
                isEditing ? 'cursor-pointer hover:opacity-80' : ''
              }`}
              onClick={handleAvatarClick}
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-4xl text-gray-500">
                    {user.firstName.charAt(0)}
                    {user.lastName.charAt(0)}
                  </span>
                </div>
              )}
              
              {isEditing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-white text-sm">Change Photo</span>
                </div>
              )}
            </div>
            
            {isEditing && (
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
            )}
            
            {isEditing && avatar && (
              <button
                type="button"
                onClick={() => {
                  setAvatar(null);
                  setAvatarPreview(user.avatar || null);
                }}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Remove Photo
              </button>
            )}
          </div>
          
          {/* User details */}
          <div className="flex-1 space-y-4">
            {/* Name fields - two columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First name field */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                {isEditing ? (
                  <input
                    id="firstName"
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                ) : (
                  <p className="py-2 text-gray-800">{user.firstName}</p>
                )}
              </div>
              
              {/* Last name field */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                {isEditing ? (
                  <input
                    id="lastName"
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                ) : (
                  <p className="py-2 text-gray-800">{user.lastName}</p>
                )}
              </div>
            </div>
            
            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              {isEditing ? (
                <input
                  id="email"
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              ) : (
                <p className="py-2 text-gray-800">{user.email}</p>
              )}
            </div>
            
            {/* Phone field (for professionals) */}
            {user.professionalProfile && (
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    id="phone"
                    type="tel"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                ) : (
                  <p className="py-2 text-gray-800">
                    {user.professionalProfile.phone || 'Not provided'}
                  </p>
                )}
              </div>
            )}
            
            {/* User roles */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Type
              </label>
              <div className="py-2">
                {user.roles.map((role) => (
                  <span
                    key={role}
                    className="inline-block px-3 py-1 mr-2 bg-emerald-100 text-emerald-700 rounded-full text-sm capitalize"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Member since */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Member Since
              </label>
              <p className="py-2 text-gray-800">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
            
            {/* Professional verification status */}
            {user.professionalProfile && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Verification Status
                </label>
                <div className="py-2">
                  {user.professionalProfile.verificationStatus === 'approved' ? (
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      Verified
                    </span>
                  ) : user.professionalProfile.verificationStatus === 'pending' ? (
                    <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                      Pending Verification
                    </span>
                  ) : (
                    <span className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                      Verification Rejected
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Submit button (only when editing) */}
        {isEditing && (
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
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
        )}
      </form>
    </div>
  );
};

export default UserInfo;