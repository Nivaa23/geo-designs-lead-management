import React, { useState } from 'react';
import MagnetLines from './MagnetLines';
import './MagnetLines.css';

const DEMO_CREDENTIALS = {
  email: 'demo@geodesigns.example',
  password: 'Demo@12345',
};

export function LoginBrandingPanel() {
  return (
    <aside className="split-login-left-panel" aria-label="Branding and portal overview">
      {/* MagnetLines interactive background */}
      <div className="left-panel-magnet-bg" aria-hidden="true">
        <MagnetLines
          mode="orbit"
          shape="line"
          lineColor="#818CF8"
          accentColor="#A5B4FC"
          spacing={28}
          lineWidth={1.5}
          lineHeight={12}
          radius={180}
          fade={0.72}
          stretch={0.35}
          inertia={0.35}
          bounce={0.2}
          ripple={0.25}
          clickPulse={true}
          intro={true}
          idle={false}
          rainbow={false}
          edgeFade={0}
        />
      </div>

      {/* Subtle grid pattern background overlay */}
      <div className="left-panel-grid-overlay" aria-hidden="true"></div>

      <div className="left-panel-inner">
        {/* A. Brand identity */}
        <div className="split-brand-header">
          <div className="brand-logo-mark split-logo-mark" aria-hidden="true">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
          </div>
          <div className="split-brand-info">
            <span className="split-brand-name">Geo Designs &amp; Research</span>
            <span className="split-brand-product">Lead Management Portal</span>
          </div>
        </div>

        {/* B. Product introduction */}
        <div className="split-hero-content">
          <span className="split-eyebrow">BUSINESS OPERATIONS</span>
          <h1 className="split-hero-heading">
            Every inquiry.<br />Every opportunity.<br />One workspace.
          </h1>
          <p className="split-hero-paragraph">
            A centralized workspace to record, organize, and manage business inquiries for Geo Designs &amp; Research.
          </p>

          {/* C. Three compact product-benefit items */}
          <div className="split-benefits-grid" aria-label="Portal Capabilities">
            {/* Item 1 */}
            <div className="benefit-card">
              <div className="benefit-icon-wrapper" aria-hidden="true">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5"></path>
                  <path d="M2 12l10 5 10-5"></path>
                </svg>
              </div>
              <div className="benefit-text-content">
                <h3 className="benefit-title">Lead Tracking</h3>
                <p className="benefit-desc">Keep business inquiries organized.</p>
              </div>
            </div>

            {/* Item 2 */}
            <div className="benefit-card">
              <div className="benefit-icon-wrapper" aria-hidden="true">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                  <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
                </svg>
              </div>
              <div className="benefit-text-content">
                <h3 className="benefit-title">Centralized Records</h3>
                <p className="benefit-desc">Access recorded lead information in one place.</p>
              </div>
            </div>

            {/* Item 3 */}
            <div className="benefit-card">
              <div className="benefit-icon-wrapper" aria-hidden="true">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                  <polyline points="17 6 23 6 23 12"></polyline>
                </svg>
              </div>
              <div className="benefit-text-content">
                <h3 className="benefit-title">Business Visibility</h3>
                <p className="benefit-desc">Review inquiry activity at a glance.</p>
              </div>
            </div>
          </div>
        </div>

        {/* D. Bottom footer */}
        <footer className="split-left-footer">
          <span className="split-footer-text">
            Geo Designs &amp; Research · Internal Business Portal
          </span>
        </footer>
      </div>
    </aside>
  );
}

export default function LoginScreen({ onLoginSuccess, onForgotPassword }) {
  const [email, setEmail] = useState(DEMO_CREDENTIALS.email);
  const [password, setPassword] = useState(DEMO_CREDENTIALS.password);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [forgotNotice, setForgotNotice] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setForgotNotice(false);

    // Validate fields contain values
    const trimmedEmail = email.trim();
    const trimmedPassword = password;

    if (!trimmedEmail || !trimmedPassword) {
      setErrorMessage('Invalid demo credentials. Please use the pre-filled demo credentials.');
      return;
    }

    // Compare with exact predefined dummy credentials
    if (
      trimmedEmail === DEMO_CREDENTIALS.email &&
      trimmedPassword === DEMO_CREDENTIALS.password
    ) {
      onLoginSuccess?.();
    } else {
      setErrorMessage('Invalid demo credentials. Please use the pre-filled demo credentials.');
    }
  };

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleForgotClick = () => {
    setErrorMessage('');
    if (onForgotPassword) {
      onForgotPassword();
    } else {
      setForgotNotice(true);
    }
  };

  return (
    <div className="split-login-page" id="login-screen">
      {/* ====================================================================
          LEFT PANEL — Company Identity and Branding (50% Desktop Width)
          ==================================================================== */}
      <LoginBrandingPanel />

      {/* ====================================================================
          RIGHT PANEL — Login Form (50% Desktop Width)
          ==================================================================== */}
      <main className="split-login-right-panel" aria-label="Sign in to your account">
        <div className="split-login-form-container">
          {/* Mobile-only compact branding header */}
          <div className="login-mobile-brand-header">
            <div className="brand-logo-mark split-logo-mark-mobile" aria-hidden="true">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
            </div>
            <div className="split-brand-info">
              <span className="split-brand-name">Geo Designs &amp; Research</span>
              <span className="split-brand-product">Lead Management Portal</span>
            </div>
          </div>

          {/* Form Header */}
          <div className="form-header-group">
            {/* A. Eyebrow */}
            <span className="form-eyebrow">LEAD MANAGEMENT PORTAL</span>

            {/* B. Main heading */}
            <h2 className="form-main-heading">Welcome Back</h2>

            {/* C. Supporting text */}
            <p className="form-supporting-text">
              Sign in to access the Lead Management Portal.
            </p>
          </div>

          {/* Inline Error Message */}
          {errorMessage && (
            <div className="login-error-alert" role="alert" id="login-error-message">
              <svg
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
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Forgot Password Placeholder Notice */}
          {forgotNotice && (
            <div className="login-notice-alert" role="status">
              <span>Password recovery flow will be available in the next module.</span>
            </div>
          )}

          {/* Form */}
          <form className="split-login-form" onSubmit={handleSubmit} noValidate>
            {/* D. Email Address Field */}
            <div className="form-group-field">
              <label htmlFor="login-email" className="field-label-text">
                Email Address
              </label>
              <input
                type="email"
                id="login-email"
                name="email"
                className={`login-input ${errorMessage ? 'is-invalid' : ''}`}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="demo@geodesigns.example"
                autoComplete="username"
                required
              />
            </div>

            {/* E. Password Field */}
            <div className="form-group-field">
              <label htmlFor="login-password" className="field-label-text">
                Password
              </label>
              <div className="password-input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password"
                  name="password"
                  className={`login-input password-field-input ${errorMessage ? 'is-invalid' : ''}`}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Demo@12345"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  id="btn-toggle-password"
                  className="password-toggle-action"
                  onClick={handleTogglePassword}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>

              {/* F. Forgot Password link (positioned below password field, aligned to right edge) */}
              <div className="forgot-password-row">
                <button
                  type="button"
                  id="link-forgot-password"
                  className="forgot-password-action"
                  onClick={handleForgotClick}
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            {/* G. Sign In Button */}
            <button
              type="submit"
              id="btn-sign-in"
              className="login-primary-submit-btn"
            >
              Sign In
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
