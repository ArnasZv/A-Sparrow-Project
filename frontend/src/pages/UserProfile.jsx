import React, { useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    city: '',
    country: '',
    bio: ''
  });

  const [originalData, setOriginalData] = useState({});

  const showNotification = useCallback((message, type) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  }, []);

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await authAPI.getProfile();
      setFormData(response.data);
      setOriginalData(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      showNotification('Failed to load profile data', 'error');
    }
  }, [showNotification]);

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const response = await authAPI.updateProfile(formData);
      setFormData(response.data);
      setOriginalData(response.data);
      setIsEditing(false);
      showNotification('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error saving profile:', error);
      showNotification(error.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = () => {
    const first = formData.firstName?.charAt(0) || '';
    const last = formData.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  };

  return (
    <div className="profile-page">
      {notification && (
        <div className={`profile-notification notification-${notification.type}`}>
          <span>{notification.message}</span>
          <button 
            className="notification-close"
            onClick={() => setNotification(null)}
          >
            ×
          </button>
        </div>
      )}

      <div className="profile-container">
        <div className="profile-header-section">
          <h1 className="profile-title">Your Profile</h1>
          <p className="profile-subtitle">Manage your personal information</p>
        </div>

        <div className="profile-card">
          <div className="profile-banner">
            <div className="banner-gradient"></div>
          </div>

          <div className="avatar-wrapper">
            <div className="profile-avatar">
              {getInitials()}
            </div>
          </div>

          <div className="profile-form-content">
            <form onSubmit={(e) => e.preventDefault()}>
              {/* Personal Information Section */}
              <div className="form-section">
                <h2 className="section-title">Personal Information</h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="dateOfBirth">Date of Birth</label>
                    <input
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="form-section">
                <h2 className="section-title">Address</h2>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label htmlFor="address">Street Address</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="country">Country</label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="button-group">
                {!isEditing ? (
                  <button 
                    type="button"
                    className="btn-edit"
                    onClick={handleEdit}
                  >
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button 
                      type="button"
                      className="btn-cancel"
                      onClick={handleCancel}
                      disabled={isSaving}
                    >
                      Cancel
                    </button>
                    <button 
                      type="button"
                      className="btn-save"
                      onClick={handleSave}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;