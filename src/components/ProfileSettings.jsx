import React, { useState, useEffect } from 'react';

const PROFILE_STORAGE_KEY = 'gdr_user_profile_v2';
const DEFAULT_SCREEN_KEY = 'gdr_default_screen_v1';

const DEFAULT_PROFILE = {
  fullName: 'Nivrutti Dandekar',
  email: 'work.nivrutti@gmail.com',
  designation: 'UI/UX Designer',
  department: 'MES',
  contactNumber: '+91 98250 88712'
};

export default function ProfileSettings({ isSidebarCollapsed, onToggleSidebar }) {
  const [profile, setProfile] = useState(() => {
    try {
      const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.fullName && parsed.fullName !== 'Vishal Shah') {
          return parsed;
        }
      }
      return DEFAULT_PROFILE;
    } catch (e) {
      return DEFAULT_PROFILE;
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profile);
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);

  const [defaultScreen, setDefaultScreen] = useState(() => {
    try {
      return localStorage.getItem(DEFAULT_SCREEN_KEY) || 'dashboard';
    } catch (e) {
      return 'dashboard';
    }
  });

  // Keep formData in sync when profile changes or edit mode toggles
  useEffect(() => {
    setFormData(profile);
    setErrors({});
  }, [isEditing, profile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setBanner(null);

    const newErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      newErrors.email = 'Valid Email Address is required.';
    }
    if (!formData.designation.trim()) {
      newErrors.designation = 'Designation is required.';
    }
    if (!formData.department.trim()) {
      newErrors.department = 'Department is required.';
    }
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact Number is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const updatedProfile = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      designation: formData.designation.trim(),
      department: formData.department.trim(),
      contactNumber: formData.contactNumber.trim()
    };

    setProfile(updatedProfile);
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));
    } catch (e) {
      console.warn('Unable to persist profile to localStorage', e);
    }

    setIsEditing(false);
    setBanner({
      type: 'success',
      message: 'Profile information updated successfully.'
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData(profile);
    setErrors({});
  };

  const handleDefaultScreenChange = (e) => {
    const value = e.target.value;
    setDefaultScreen(value);
    try {
      localStorage.setItem(DEFAULT_SCREEN_KEY, value);
      setBanner({
        type: 'success',
        message: 'Default landing screen preference updated.'
      });
    } catch (e) {}
  };

  // Compute initials for avatar (defaults to ND)
  const initials = profile.fullName
    ? profile.fullName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'ND';

  return (
    <section className="screen-view active" id="screen-profile-settings" aria-labelledby="heading-profile-settings">
      {/* Page Header */}
      <header className="content-header">
        <div className="header-titles">
          <h2 className="page-title" id="heading-profile-settings">Profile &amp; Settings</h2>
          <p className="page-subtitle">Manage your profile and application preferences.</p>
        </div>
      </header>

      {/* Notification Banner */}
      {banner && (
        <div className={`alert-banner ${banner.type}`} role="alert">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {banner.type === 'success' ? (
              <>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </>
            ) : (
              <>
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </>
            )}
          </svg>
          <span>{banner.message}</span>
        </div>
      )}

      <div className="settings-container">
        {/* Section B: Profile Information */}
        <section className="dashboard-card settings-card settings-card-profile" aria-labelledby="heading-profile-info">
          <div className="dashboard-card-header">
            <div>
              <h3 className="dashboard-card-title" id="heading-profile-info">Profile Information</h3>
              <p className="dashboard-card-subtitle">Your personal details and organizational role.</p>
            </div>
            {!isEditing && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                id="btn-edit-profile"
                onClick={() => setIsEditing(true)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          <div className="settings-card-body">
            {/* Avatar & Identity Row: Horizontally & Vertically Aligned */}
            <div className="profile-identity-row">
              <div className="profile-avatar-initials" aria-hidden="true">
                {initials}
              </div>
              <div className="profile-identity-meta">
                <h4 className="profile-name">{profile.fullName}</h4>
                <span className="badge badge-designation">{profile.designation}</span>
                <span className="profile-department">{profile.department}</span>
              </div>
            </div>

            {isEditing ? (
              /* Editable Profile Form */
              <form onSubmit={handleSaveProfile} className="settings-form" id="profile-edit-form">
                <div className="settings-fields-grid">
                  {/* Left Column: Full Name */}
                  <div className="form-group">
                    <label htmlFor="field-fullName" className="form-label">
                      <span>Full Name</span>
                      <span className="required-mark">*</span>
                    </label>
                    <input
                      type="text"
                      id="field-fullName"
                      name="fullName"
                      className={`form-input ${errors.fullName ? 'is-invalid' : ''}`}
                      value={formData.fullName}
                      onChange={handleInputChange}
                    />
                    {errors.fullName && <span className="error-msg">{errors.fullName}</span>}
                  </div>

                  {/* Right Column: Email Address */}
                  <div className="form-group">
                    <label htmlFor="field-email" className="form-label">
                      <span>Email Address</span>
                      <span className="required-mark">*</span>
                    </label>
                    <input
                      type="email"
                      id="field-email"
                      name="email"
                      className={`form-input ${errors.email ? 'is-invalid' : ''}`}
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                    {errors.email && <span className="error-msg">{errors.email}</span>}
                  </div>

                  {/* Left Column: Designation */}
                  <div className="form-group">
                    <label htmlFor="field-designation" className="form-label">
                      <span>Designation</span>
                      <span className="required-mark">*</span>
                    </label>
                    <input
                      type="text"
                      id="field-designation"
                      name="designation"
                      className={`form-input ${errors.designation ? 'is-invalid' : ''}`}
                      value={formData.designation}
                      onChange={handleInputChange}
                    />
                    {errors.designation && <span className="error-msg">{errors.designation}</span>}
                  </div>

                  {/* Right Column: Department */}
                  <div className="form-group">
                    <label htmlFor="field-department" className="form-label">
                      <span>Department</span>
                      <span className="required-mark">*</span>
                    </label>
                    <input
                      type="text"
                      id="field-department"
                      name="department"
                      className={`form-input ${errors.department ? 'is-invalid' : ''}`}
                      value={formData.department}
                      onChange={handleInputChange}
                    />
                    {errors.department && <span className="error-msg">{errors.department}</span>}
                  </div>

                  {/* Full Width Row: Contact Number */}
                  <div className="form-group full-width">
                    <label htmlFor="field-contactNumber" className="form-label">
                      <span>Contact Number</span>
                      <span className="required-mark">*</span>
                    </label>
                    <input
                      type="text"
                      id="field-contactNumber"
                      name="contactNumber"
                      className={`form-input ${errors.contactNumber ? 'is-invalid' : ''}`}
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                    />
                    {errors.contactNumber && <span className="error-msg">{errors.contactNumber}</span>}
                  </div>
                </div>

                <div className="settings-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    id="btn-cancel-profile"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    id="btn-save-profile"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                      <polyline points="17 21 17 13 7 13 7 21"></polyline>
                      <polyline points="7 3 7 8 15 8"></polyline>
                    </svg>
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Read-Only Profile View */
              <div className="settings-fields-grid">
                {/* Left Column: Full Name */}
                <div className="detail-item">
                  <span className="detail-label">Full Name</span>
                  <div className="detail-value">{profile.fullName}</div>
                </div>

                {/* Right Column: Email Address */}
                <div className="detail-item">
                  <span className="detail-label">Email Address</span>
                  <div className="detail-value">{profile.email}</div>
                </div>

                {/* Left Column: Designation */}
                <div className="detail-item">
                  <span className="detail-label">Designation</span>
                  <div className="detail-value">{profile.designation}</div>
                </div>

                {/* Right Column: Department */}
                <div className="detail-item">
                  <span className="detail-label">Department</span>
                  <div className="detail-value">{profile.department}</div>
                </div>

                {/* Full Width Row: Contact Number */}
                <div className="detail-item full-width">
                  <span className="detail-label">Contact Number</span>
                  <div className="detail-value">{profile.contactNumber}</div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Section C: Application Preferences */}
        <section className="dashboard-card settings-card settings-card-preferences" aria-labelledby="heading-app-preferences">
          <div className="dashboard-card-header">
            <div>
              <h3 className="dashboard-card-title" id="heading-app-preferences">Application Preferences</h3>
              <p className="dashboard-card-subtitle">Interface behavior and workflow settings.</p>
            </div>
          </div>

          <div className="settings-card-body">
            <div className="preference-list">
              {/* Preference 1: Default Landing Screen */}
              <div className="preference-item">
                <div className="preference-info">
                  <span className="preference-title">Default Landing Screen</span>
                  <p className="preference-desc">Screen loaded automatically upon opening the portal.</p>
                </div>
                <div className="preference-control">
                  <select
                    className="form-select preference-select"
                    id="select-default-screen"
                    value={defaultScreen}
                    onChange={handleDefaultScreenChange}
                    aria-label="Default Landing Screen"
                  >
                    <option value="dashboard">Dashboard Overview</option>
                    <option value="view">View Previous Leads</option>
                    <option value="add">Add New Lead</option>
                  </select>
                </div>
              </div>

              {/* Preference 2: Sidebar State Toggle */}
              <div className="preference-item">
                <div className="preference-info">
                  <span className="preference-title">Sidebar Default Mode</span>
                  <p className="preference-desc">Control whether navigation starts expanded or in compact icon mode.</p>
                </div>
                <div className="preference-control">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    id="btn-toggle-sidebar-pref"
                    onClick={onToggleSidebar}
                  >
                    {isSidebarCollapsed ? 'Switch to Expanded' : 'Switch to Compact'}
                  </button>
                </div>
              </div>

              {/* Preference 3: Records Per Page */}
              <div className="preference-item">
                <div className="preference-info">
                  <span className="preference-title">Table Page Limit</span>
                  <p className="preference-desc">Pagination threshold for Previous Leads table.</p>
                </div>
                <div className="preference-control">
                  <span className="records-badge">10 records per page (Standard)</span>
                </div>
              </div>

              {/* Preference 4: Theme Preference */}
              <div className="preference-item">
                <div className="preference-info">
                  <span className="preference-title">Color Theme</span>
                  <p className="preference-desc">Application color scheme and visual appearance.</p>
                </div>
                <div className="preference-control">
                  <span className="records-badge">Corporate Light Theme (Active)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section D: Account & Security */}
        <section className="dashboard-card settings-card settings-card-security" aria-labelledby="heading-security-settings">
          <div className="dashboard-card-header">
            <div>
              <h3 className="dashboard-card-title" id="heading-security-settings">Account &amp; Security</h3>
              <p className="dashboard-card-subtitle">Corporate access status and security policies.</p>
            </div>
          </div>

          <div className="settings-card-body">
            <div className="security-grid">
              {/* Left Column: Account Status */}
              <div className="security-item">
                <span className="security-label">Account Status</span>
                <div className="security-value-group">
                  <span className="kpi-badge badge-positive">Active — Authorized User</span>
                  <span className="security-hint">Authorized for lead recording and inquiry management.</span>
                </div>
              </div>

              {/* Right Column: Authentication Provider */}
              <div className="security-item">
                <span className="security-label">Authentication Provider</span>
                <div className="security-value-group">
                  <span className="security-value">Supabase PostgreSQL Database</span>
                  <span className="security-hint">Role-level and row-level security enabled.</span>
                </div>
              </div>

              {/* Full Width Beneath: Credential Management */}
              <div className="security-item full-width">
                <span className="security-label">Credential Management</span>
                <div className="security-notice-box">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  <div className="security-notice-text">
                    <strong>Centrally Administered Credentials</strong>
                    <p>
                      Employee authentication and database credentials are managed centrally by the Geo Designs IT administrator. Self-service password modification is not currently enabled for this portal.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}

