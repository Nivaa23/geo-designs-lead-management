import React, { useState, useEffect, useRef } from 'react';

const PROFILE_STORAGE_KEY = 'gdr_user_profile_v2';

const DEFAULT_PROFILE = {
  fullName: 'Nivrutti Dandekar',
  email: 'work.nivrutti@gmail.com',
  designation: 'UI/UX Designer',
  department: 'MES',
};

export default function TopBar({ activeScreen, onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);

  // Read profile information
  const [profile, setProfile] = useState(() => {
    try {
      const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.fullName) return parsed;
      }
      return DEFAULT_PROFILE;
    } catch (e) {
      return DEFAULT_PROFILE;
    }
  });

  // Listen for storage updates if profile is modified on ProfileSettings screen
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.fullName) setProfile(parsed);
        }
      } catch (e) {}
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSelectSettings = () => {
    setIsOpen(false);
    onNavigate?.('settings');
  };

  return (
    <header className="top-bar" id="dashboard-top-bar" role="banner">
      <div className="top-bar-content">
        {/* Left Section: Context Label */}
        <div className="top-bar-left">
          <span className="top-bar-context-label">Lead Management Portal</span>
        </div>

        {/* Right Section: Existing Profile Button */}
        <div className="top-bar-right">
          <div className="top-bar-profile-container" ref={containerRef}>
            <button
              type="button"
              ref={buttonRef}
              id="btn-topbar-profile"
              className={`top-bar-profile-btn ${isOpen ? 'active' : ''}`}
              onClick={toggleDropdown}
              aria-haspopup="menu"
              aria-expanded={isOpen}
              aria-controls="profile-dropdown-menu"
              aria-label={`User menu for ${profile.fullName}`}
            >
              <div className="profile-avatar-circle" aria-hidden="true">
                ND
              </div>
              <div className="profile-btn-info">
                <span className="profile-btn-name">{profile.fullName}</span>
                <span className="profile-btn-role">{profile.designation}</span>
              </div>
              <svg
                className={`profile-btn-chevron ${isOpen ? 'chevron-open' : ''}`}
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            {/* Profile Dropdown Menu */}
            {isOpen && (
              <div
                className="profile-dropdown-menu"
                id="profile-dropdown-menu"
                role="menu"
                aria-label="Profile options"
              >
                {/* Profile Summary */}
                <div className="dropdown-profile-summary">
                  <div className="dropdown-summary-header">
                    <div className="dropdown-avatar-circle" aria-hidden="true">
                      ND
                    </div>
                    <div className="dropdown-user-details">
                      <span className="dropdown-user-name">{profile.fullName}</span>
                      <span className="dropdown-user-email">{profile.email}</span>
                    </div>
                  </div>
                  <div className="dropdown-meta-row">
                    <span className="dropdown-user-designation">{profile.designation}</span>
                    <span className="dropdown-department-badge">{profile.department}</span>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="dropdown-menu-list">
                  <button
                    type="button"
                    id="menu-item-settings"
                    className={`dropdown-menu-item ${activeScreen === 'settings' ? 'item-active' : ''}`}
                    role="menuitem"
                    onClick={handleSelectSettings}
                  >
                    <svg
                      className="dropdown-item-icon"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="3"></circle>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                    <span>Profile &amp; Settings</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
