import React, { useState } from 'react';
import { LoginBrandingPanel } from './LoginScreen';

export default function ForgotPasswordScreen({ onBackToLogin }) {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    // Standard email validation pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    // Valid email - display simulated success state on the same screen
    setIsSubmitted(true);
  };

  return (
    <div className="split-login-page" id="forgot-password-screen">
      {/* ====================================================================
          LEFT PANEL — Reused Branding Panel (50% Desktop Width)
          ==================================================================== */}
      <LoginBrandingPanel />

      {/* ====================================================================
          RIGHT PANEL — Forgot Password Form / Success State (50% Desktop Width)
          ==================================================================== */}
      <main className="split-login-right-panel" aria-label="Reset your password">
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

          {isSubmitted ? (
            /* ================================================================
               SUCCESS STATE — Simulated frontend confirmation
               ================================================================ */
            <div className="forgot-success-state">
              <div className="form-header-group">
                <span className="form-eyebrow">LEAD MANAGEMENT PORTAL</span>
                <h2 className="form-main-heading">Check Your Email</h2>
                <p className="form-supporting-text">
                  If an account exists for this email address, password reset instructions would be sent in a real deployment.
                </p>
              </div>

              <button
                type="button"
                id="btn-back-to-signin-success"
                className="login-primary-submit-btn"
                onClick={onBackToLogin}
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            /* ================================================================
               FORGOT PASSWORD FORM — Request reset instructions
               ================================================================ */
            <>
              {/* Form Header */}
              <div className="form-header-group">
                {/* 1. Eyebrow label */}
                <span className="form-eyebrow">LEAD MANAGEMENT PORTAL</span>

                {/* 2. Page heading */}
                <h2 className="form-main-heading">Forgot Password?</h2>

                {/* 3. Supporting text */}
                <p className="form-supporting-text">
                  Enter your email address and we'll guide you through resetting your password.
                </p>
              </div>

              {/* Inline Validation Error Message */}
              {errorMessage && (
                <div className="login-error-alert" role="alert" id="forgot-error-message">
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

              {/* Form */}
              <form className="split-login-form" onSubmit={handleSubmit} noValidate>
                {/* 4. Field label & 5. Email input */}
                <div className="form-group-field">
                  <label htmlFor="forgot-email" className="field-label-text">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="forgot-email"
                    name="email"
                    className={`login-input ${errorMessage ? 'is-invalid' : ''}`}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="Enter your email address"
                    autoComplete="email"
                    required
                  />
                </div>

                {/* 6. Primary button */}
                <button
                  type="submit"
                  id="btn-send-reset"
                  className="login-primary-submit-btn"
                >
                  Send Reset Instructions
                </button>

                {/* 7. Secondary navigation link */}
                <div className="forgot-back-nav">
                  <button
                    type="button"
                    id="link-back-to-signin"
                    className="back-to-signin-link"
                    onClick={onBackToLogin}
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
