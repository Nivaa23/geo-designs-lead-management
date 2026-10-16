import React, { useState, useRef } from 'react';
import {
  PERSON_DESIGNATION_MAP,
  CONCERN_PERSON_OPTIONS,
  SOURCE_OF_INQUIRY_OPTIONS,
  HURDLES_OPTIONS
} from '../data/mockLeads';
import { formatCurrencyInput } from '../utils/leadUtils';

const INITIAL_FORM_STATE = {
  tenderId: '',
  nameOfWorkEmplement: '',
  nameOfClient: '',
  location: '',
  approximateAmount: '',
  durationOfWork: '',
  clientContact: '',
  clientConcernedPersonExternal: '',
  clientConcernPersonDesignationExternal: '',
  sourceOfInquiry: '',
  referenceBy: '',
  allottedTo: '',
  hurdlesSpecificTask: '',
  remarks: ''
};

export default function LeadForm({ nextSrNo, onAddLead }) {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Field refs for auto-focusing the first invalid field
  const fieldRefs = {
    tenderId: useRef(null),
    nameOfWorkEmplement: useRef(null),
    nameOfClient: useRef(null),
    location: useRef(null),
    approximateAmount: useRef(null),
    durationOfWork: useRef(null),
    clientContact: useRef(null),
    clientConcernedPersonExternal: useRef(null),
    clientConcernPersonDesignationExternal: useRef(null),
    sourceOfInquiry: useRef(null),
    referenceBy: useRef(null),
    allottedTo: useRef(null),
    hurdlesSpecificTask: useRef(null),
    remarks: useRef(null)
  };

  const bannerRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }

    if (name === 'approximateAmount') {
      const input = e.target;
      const cursor = input.selectionStart || 0;
      const digitsBefore = (value.slice(0, cursor).match(/\d/g) || []).length;
      const formatted = formatCurrencyInput(value);

      setFormData((prev) => ({ ...prev, approximateAmount: formatted }));

      requestAnimationFrame(() => {
        if (input && document.activeElement === input) {
          let count = 0;
          let newCursor = formatted.length;
          for (let i = 0; i < formatted.length; i++) {
            if (/\d/.test(formatted[i])) count++;
            if (count === digitsBefore) {
              newCursor = i + 1;
              break;
            }
          }
          input.setSelectionRange(newCursor, newCursor);
        }
      });
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBanner(null);

    const newErrors = {};
    let firstInvalidName = null;

    const markError = (fieldName, message) => {
      newErrors[fieldName] = message;
      if (!firstInvalidName) {
        firstInvalidName = fieldName;
      }
    };

    // Validation for mandatory fields
    if (!formData.nameOfWorkEmplement.trim()) {
      markError('nameOfWorkEmplement', 'Please enter the Name of Work / Project.');
    }
    if (!formData.nameOfClient.trim()) {
      markError('nameOfClient', 'Please enter the Name of Client.');
    }
    if (!formData.location.trim()) {
      markError('location', 'Please enter the Location.');
    }
    if (!formData.approximateAmount.trim()) {
      markError('approximateAmount', 'Please enter the Approximate Amount.');
    }
    if (!formData.durationOfWork.trim()) {
      markError('durationOfWork', 'Please enter the Duration of Work Confirmation / Allotment.');
    }
    if (!formData.sourceOfInquiry) {
      markError('sourceOfInquiry', 'Please select the Source of Inquiry.');
    }
    if (!formData.hurdlesSpecificTask) {
      markError('hurdlesSpecificTask', 'Please select the Hurdles / Specific Task.');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setBanner({
        type: 'error',
        message: 'Please complete all required fields highlighted below.'
      });
      if (firstInvalidName && fieldRefs[firstInvalidName]?.current) {
        fieldRefs[firstInvalidName].current.focus();
      }
      return;
    }

    const assignedSrNo = nextSrNo;
    const newLead = {
      srNo: assignedSrNo,
      tenderId: formData.tenderId.trim(),
      nameOfWorkEmplement: formData.nameOfWorkEmplement.trim(),
      nameOfClient: formData.nameOfClient.trim(),
      location: formData.location.trim(),
      approximateAmount: formData.approximateAmount.trim(),
      durationOfWork: formData.durationOfWork.trim(),
      clientContact: formData.clientContact.trim(),
      clientConcernedPersonExternal: formData.clientConcernedPersonExternal.trim(),
      clientConcernPersonDesignationExternal: formData.clientConcernPersonDesignationExternal.trim(),
      sourceOfInquiry: formData.sourceOfInquiry,
      referenceBy: formData.referenceBy.trim(),
      allottedTo: formData.allottedTo,
      // Mapped legacy columns to maintain backward compatibility & database constraint satisfaction
      concernPerson: formData.allottedTo || 'Vishal Shah',
      contactDetails: formData.clientContact.trim() || 'N/A',
      designationOfConcernPerson: PERSON_DESIGNATION_MAP[formData.allottedTo] || 'COO',
      hurdlesSpecificTask: formData.hurdlesSpecificTask,
      remarks: formData.remarks.trim(),
      status: 'Active',
      requiresAttention: formData.hurdlesSpecificTask === 'Special Efforts',
      createdAt: new Date().toISOString()
    };

    setIsSubmitting(true);
    try {
      const result = await onAddLead(newLead);
      if (result && result.success === false) {
        setBanner({
          type: 'error',
          message: result.error || 'Failed to save lead to the database. Please try again.'
        });
      } else {
        // Reset form only after successful database insert
        setFormData(INITIAL_FORM_STATE);
        setErrors({});
        setBanner({
          type: 'success',
          message: `Lead #${assignedSrNo} has been successfully recorded in the database.`
        });
      }
    } catch (err) {
      setBanner({
        type: 'error',
        message: err.message || 'An unexpected error occurred while saving the lead.'
      });
    } finally {
      setIsSubmitting(false);
      if (bannerRef.current) {
        bannerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  return (
    <section className="screen-view active" id="screen-add-lead" aria-labelledby="heading-add-lead">
      <header className="content-header">
        <div className="header-titles">
          <h2 className="page-title" id="heading-add-lead">Add New Lead</h2>
          <p className="page-subtitle">Enter the details of a new business inquiry across five structured sections.</p>
        </div>
      </header>

      <div className="form-container">
        {banner && (
          <div
            ref={bannerRef}
            className={`alert-banner ${banner.type}`}
            id="form-alert"
            role="alert"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
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

        <form id="lead-form" noValidate onSubmit={handleSubmit}>
          {/* SECTION 01 — Tender & Lead Identification */}
          <div className="form-section">
            <div className="form-section-header">
              <span className="form-section-badge">Section 01</span>
              <div>
                <h3 className="form-section-title">Tender & Lead Identification</h3>
                <div className="form-section-subtitle">Tender reference, serial assignment, and project identification</div>
              </div>
            </div>
            <div className="form-grid">
              {/* 1. Tender ID — NEW (first field) */}
              <div className="form-group">
                <label htmlFor="tenderId" className="form-label">
                  Tender ID
                </label>
                <input
                  ref={fieldRefs.tenderId}
                  type="text"
                  id="tenderId"
                  name="tenderId"
                  className="form-input"
                  placeholder="e.g. GEM/2026/B/891240 or TEND-1049"
                  value={formData.tenderId}
                  onChange={handleChange}
                />
                <span className="field-hint">Optional external tender reference identifier</span>
              </div>

              {/* 2. Sr. No. — EXISTING, auto-generated and read-only */}
              <div className="form-group">
                <label htmlFor="srNo" className="form-label">
                  Sr. No. <span className="required-mark">*</span>
                </label>
                <input
                  type="text"
                  id="srNo"
                  name="srNo"
                  className="form-input"
                  readOnly
                  value={nextSrNo}
                  placeholder="Auto-generated"
                />
                <span className="field-hint">Auto-populated sequential identifier</span>
              </div>

              {/* 3. Name of Work / Project — EXISTING */}
              <div className="form-group full-width">
                <label htmlFor="nameOfWorkEmplement" className="form-label">
                  Name of Work / Project <span className="required-mark">*</span>
                </label>
                <input
                  ref={fieldRefs.nameOfWorkEmplement}
                  type="text"
                  id="nameOfWorkEmplement"
                  name="nameOfWorkEmplement"
                  className={`form-input ${errors.nameOfWorkEmplement ? 'is-invalid' : ''}`}
                  placeholder="e.g. Topographical Survey & Geotechnical Soil Investigation"
                  value={formData.nameOfWorkEmplement}
                  onChange={handleChange}
                />
                <span className="error-msg" id="error-nameOfWorkEmplement">
                  {errors.nameOfWorkEmplement || ''}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 02 — Client & Project Location */}
          <div className="form-section">
            <div className="form-section-header">
              <span className="form-section-badge">Section 02</span>
              <div>
                <h3 className="form-section-title">Client & Project Location</h3>
                <div className="form-section-subtitle">Client organization, project geography, and financial estimates</div>
              </div>
            </div>
            <div className="form-grid">
              {/* 1. Name of Client — EXISTING */}
              <div className="form-group">
                <label htmlFor="nameOfClient" className="form-label">
                  Name of Client <span className="required-mark">*</span>
                </label>
                <input
                  ref={fieldRefs.nameOfClient}
                  type="text"
                  id="nameOfClient"
                  name="nameOfClient"
                  className={`form-input ${errors.nameOfClient ? 'is-invalid' : ''}`}
                  placeholder="e.g. Gujarat State Infrastructure Development Corp."
                  value={formData.nameOfClient}
                  onChange={handleChange}
                />
                <span className="error-msg" id="error-nameOfClient">
                  {errors.nameOfClient || ''}
                </span>
              </div>

              {/* 2. Location — EXISTING */}
              <div className="form-group">
                <label htmlFor="location" className="form-label">
                  Location <span className="required-mark">*</span>
                </label>
                <input
                  ref={fieldRefs.location}
                  type="text"
                  id="location"
                  name="location"
                  className={`form-input ${errors.location ? 'is-invalid' : ''}`}
                  placeholder="e.g. Gandhinagar, Gujarat"
                  value={formData.location}
                  onChange={handleChange}
                />
                <span className="error-msg" id="error-location">
                  {errors.location || ''}
                </span>
              </div>

              {/* 3. Approximate Amount — EXISTING */}
              <div className="form-group">
                <label htmlFor="approximateAmount" className="form-label">
                  Approximate Amount <span className="required-mark">*</span>
                </label>
                <input
                  ref={fieldRefs.approximateAmount}
                  type="text"
                  id="approximateAmount"
                  name="approximateAmount"
                  className={`form-input ${errors.approximateAmount ? 'is-invalid' : ''}`}
                  placeholder="e.g. ₹ 8,50,000"
                  value={formData.approximateAmount}
                  onChange={handleChange}
                />
                <span className="error-msg" id="error-approximateAmount">
                  {errors.approximateAmount || ''}
                </span>
              </div>

              {/* 4. Duration of Work Confirmation / Allotment — EXISTING */}
              <div className="form-group">
                <label htmlFor="durationOfWork" className="form-label">
                  Duration of Work Confirmation / Allotment <span className="required-mark">*</span>
                </label>
                <input
                  ref={fieldRefs.durationOfWork}
                  type="text"
                  id="durationOfWork"
                  name="durationOfWork"
                  className={`form-input ${errors.durationOfWork ? 'is-invalid' : ''}`}
                  placeholder="e.g. 15 working days / 3 weeks"
                  value={formData.durationOfWork}
                  onChange={handleChange}
                />
                <span className="error-msg" id="error-durationOfWork">
                  {errors.durationOfWork || ''}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 03 — External Client Contacts */}
          <div className="form-section">
            <div className="form-section-header">
              <span className="form-section-badge">Section 03</span>
              <div>
                <h3 className="form-section-title">External Client Contacts</h3>
                <div className="form-section-subtitle">External client representative details and organizational contact channels</div>
              </div>
            </div>
            <div className="form-grid">
              {/* 1. Client Contact — NEW */}
              <div className="form-group">
                <label htmlFor="clientContact" className="form-label">
                  Client Contact
                </label>
                <input
                  ref={fieldRefs.clientContact}
                  type="text"
                  id="clientContact"
                  name="clientContact"
                  className="form-input"
                  placeholder="e.g. +91 98250 11420 / contact@client.org"
                  value={formData.clientContact}
                  onChange={handleChange}
                />
                <span className="field-hint">Official contact number or email of client organization</span>
              </div>

              {/* 2. Client Concerned Person (External) — NEW */}
              <div className="form-group">
                <label htmlFor="clientConcernedPersonExternal" className="form-label">
                  Client Concerned Person (External)
                </label>
                <input
                  ref={fieldRefs.clientConcernedPersonExternal}
                  type="text"
                  id="clientConcernedPersonExternal"
                  name="clientConcernedPersonExternal"
                  className="form-input"
                  placeholder="e.g. Er. Nilesh Patel"
                  value={formData.clientConcernedPersonExternal}
                  onChange={handleChange}
                />
                <span className="field-hint">Primary contact person representing the client</span>
              </div>

              {/* 3. Client Concern Person Designation (External) — NEW */}
              <div className="form-group full-width">
                <label htmlFor="clientConcernPersonDesignationExternal" className="form-label">
                  Client Concern Person Designation (External)
                </label>
                <input
                  ref={fieldRefs.clientConcernPersonDesignationExternal}
                  type="text"
                  id="clientConcernPersonDesignationExternal"
                  name="clientConcernPersonDesignationExternal"
                  className="form-input"
                  placeholder="e.g. Chief Project Engineer / Superintending Engineer"
                  value={formData.clientConcernPersonDesignationExternal}
                  onChange={handleChange}
                />
                <span className="field-hint">Designation or title of the external client contact person</span>
              </div>
            </div>
          </div>

          {/* SECTION 04 — Internal Reference & Assignment */}
          <div className="form-section">
            <div className="form-section-header">
              <span className="form-section-badge">Section 04</span>
              <div>
                <h3 className="form-section-title">Internal Reference & Assignment</h3>
                <div className="form-section-subtitle">Lead inquiry source, reference channel, and internal employee allotment</div>
              </div>
            </div>
            <div className="form-grid">
              {/* 1. Source of Inquiry — EXISTING */}
              <div className="form-group">
                <label htmlFor="sourceOfInquiry" className="form-label">
                  Source of Inquiry <span className="required-mark">*</span>
                </label>
                <select
                  ref={fieldRefs.sourceOfInquiry}
                  id="sourceOfInquiry"
                  name="sourceOfInquiry"
                  className={`form-select ${errors.sourceOfInquiry ? 'is-invalid' : ''}`}
                  value={formData.sourceOfInquiry}
                  onChange={handleChange}
                >
                  <option value="">Select Source of Inquiry</option>
                  {SOURCE_OF_INQUIRY_OPTIONS.map((src) => (
                    <option key={src} value={src}>
                      {src}
                    </option>
                  ))}
                </select>
                <span className="error-msg" id="error-sourceOfInquiry">
                  {errors.sourceOfInquiry || ''}
                </span>
              </div>

              {/* 2. Reference By — NEW */}
              <div className="form-group">
                <label htmlFor="referenceBy" className="form-label">
                  Reference By
                </label>
                <input
                  ref={fieldRefs.referenceBy}
                  type="text"
                  id="referenceBy"
                  name="referenceBy"
                  className="form-input"
                  placeholder="e.g. Direct Referral / Architect Mehta"
                  value={formData.referenceBy}
                  onChange={handleChange}
                />
                <span className="field-hint">Person or entity providing the reference</span>
              </div>

              {/* 3. Allotted To — NEW */}
              <div className="form-group full-width">
                <label htmlFor="allottedTo" className="form-label">
                  Allotted To
                </label>
                <select
                  ref={fieldRefs.allottedTo}
                  id="allottedTo"
                  name="allottedTo"
                  className="form-select"
                  value={formData.allottedTo}
                  onChange={handleChange}
                >
                  <option value="">Select internal personnel (Optional)</option>
                  {CONCERN_PERSON_OPTIONS.map((person) => (
                    <option key={person} value={person}>
                      {person} — {PERSON_DESIGNATION_MAP[person]}
                    </option>
                  ))}
                </select>
                <span className="field-hint">Internal team member assigned to handle this lead</span>
              </div>
            </div>
          </div>

          {/* SECTION 05 — Work Requirements & Notes */}
          <div className="form-section">
            <div className="form-section-header">
              <span className="form-section-badge">Section 05</span>
              <div>
                <h3 className="form-section-title">Work Requirements & Notes</h3>
                <div className="form-section-subtitle">Operational hurdles, specific task actions, and general observations</div>
              </div>
            </div>
            <div className="form-grid">
              {/* 1. Hurdles / specific task — EXISTING */}
              <div className="form-group">
                <label htmlFor="hurdlesSpecificTask" className="form-label">
                  Hurdles / Specific Task <span className="required-mark">*</span>
                </label>
                <select
                  ref={fieldRefs.hurdlesSpecificTask}
                  id="hurdlesSpecificTask"
                  name="hurdlesSpecificTask"
                  className={`form-select ${errors.hurdlesSpecificTask ? 'is-invalid' : ''}`}
                  value={formData.hurdlesSpecificTask}
                  onChange={handleChange}
                >
                  <option value="">Select Hurdles / Specific Task</option>
                  {HURDLES_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <span className="error-msg" id="error-hurdlesSpecificTask">
                  {errors.hurdlesSpecificTask || ''}
                </span>
              </div>

              {/* 2. Remarks — EXISTING */}
              <div className="form-group full-width">
                <label htmlFor="remarks" className="form-label">Remarks</label>
                <textarea
                  ref={fieldRefs.remarks}
                  id="remarks"
                  name="remarks"
                  className="form-input"
                  style={{ minHeight: '84px', height: 'auto', padding: '10px 12px' }}
                  placeholder="e.g. Preliminary discussion completed; awaiting BoQ sign-off."
                  value={formData.remarks}
                  onChange={handleChange}
                />
                <span className="error-msg" id="error-remarks">
                  {errors.remarks || ''}
                </span>
              </div>
            </div>
          </div>

          {/* Form Action Footer */}
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              id="btn-add-lead"
              disabled={isSubmitting}
            >
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
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>{isSubmitting ? 'Saving Lead...' : 'Add Lead'}</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
