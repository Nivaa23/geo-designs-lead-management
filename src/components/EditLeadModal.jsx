import React, { useState, useEffect, useRef } from 'react';
import {
  PERSON_DESIGNATION_MAP,
  CONCERN_PERSON_OPTIONS,
  SOURCE_OF_INQUIRY_OPTIONS,
  HURDLES_OPTIONS,
  normalizeConcernPerson
} from '../data/mockLeads';
import { formatCurrencyInput } from '../utils/leadUtils';

export default function EditLeadModal({ lead, onSave, onClose }) {
  const [formData, setFormData] = useState({
    tenderId: '',
    nameOfWorkEmplement: '',
    scopeOfWork: '',
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
  });
  const [errors, setErrors] = useState({});
  const [errorBanner, setErrorBanner] = useState('');

  const fieldRefs = {
    tenderId: useRef(null),
    nameOfWorkEmplement: useRef(null),
    scopeOfWork: useRef(null),
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

  useEffect(() => {
    if (lead) {
      const normalizedAllotted = normalizeConcernPerson(lead.allottedTo || lead.concernPerson);
      setFormData({
        tenderId: lead.tenderId || '',
        nameOfWorkEmplement: lead.nameOfWorkEmplement || '',
        scopeOfWork: lead.scopeOfWork || '',
        nameOfClient: lead.nameOfClient || '',
        location: lead.location || '',
        approximateAmount: lead.approximateAmount || '',
        durationOfWork: lead.durationOfWork || '',
        clientContact: lead.clientContact || lead.contactDetails || '',
        clientConcernedPersonExternal: lead.clientConcernedPersonExternal || '',
        clientConcernPersonDesignationExternal: lead.clientConcernPersonDesignationExternal || '',
        sourceOfInquiry: lead.sourceOfInquiry || '',
        referenceBy: lead.referenceBy || '',
        allottedTo: normalizedAllotted || '',
        hurdlesSpecificTask: lead.hurdlesSpecificTask || '',
        remarks: lead.remarks || ''
      });
      setErrors({});
      setErrorBanner('');
    }
  }, [lead]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && lead) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lead, onClose]);

  if (!lead) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

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

  const handleBackdropClick = (e) => {
    if (e.target.id === 'edit-modal') {
      onClose();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorBanner('');

    const newErrors = {};
    let firstInvalidName = null;

    const markError = (fieldName, message) => {
      newErrors[fieldName] = message;
      if (!firstInvalidName) firstInvalidName = fieldName;
    };

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
      setErrorBanner('Please complete all required fields highlighted below.');
      if (firstInvalidName && fieldRefs[firstInvalidName]?.current) {
        fieldRefs[firstInvalidName].current.focus();
      }
      return;
    }

    const updatedLead = {
      ...lead,
      tenderId: formData.tenderId.trim(),
      nameOfWorkEmplement: formData.nameOfWorkEmplement.trim(),
      scopeOfWork: formData.scopeOfWork.trim(),
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
      // Backward compatible fields
      concernPerson: formData.allottedTo || lead.concernPerson || 'Vishal Shah',
      contactDetails: formData.clientContact.trim() || lead.contactDetails || 'N/A',
      designationOfConcernPerson: PERSON_DESIGNATION_MAP[formData.allottedTo] || lead.designationOfConcernPerson || 'COO',
      hurdlesSpecificTask: formData.hurdlesSpecificTask,
      remarks: formData.remarks.trim(),
      isNew: false
    };

    onSave(updatedLead);
  };

  return (
    <div
      className="modal-backdrop"
      id="edit-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
      onClick={handleBackdropClick}
    >
      <div className="modal-card" style={{ maxWidth: '850px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3 className="modal-title" id="edit-modal-title">Edit Lead</h3>
              <span className="records-badge">Lead #{lead.srNo}</span>
            </div>
            <p className="modal-subtitle">Modify business inquiry details across sections</p>
          </div>
          <button
            type="button"
            className="btn-icon-close"
            id="btn-close-edit-modal"
            aria-label="Close modal"
            onClick={onClose}
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
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="modal-body" style={{ overflowY: 'auto', padding: '24px 28px' }}>
          {errorBanner && (
            <div className="alert-banner error" id="edit-form-alert" role="alert" style={{ marginBottom: '20px' }}>
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
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{errorBanner}</span>
            </div>
          )}

          <form id="edit-lead-form" noValidate onSubmit={handleSubmit}>
            {/* SECTION 01 — Tender & Lead Identification */}
            <div className="form-section">
              <div className="form-section-header">
                <span className="form-section-badge">Section 01</span>
                <div>
                  <h4 className="form-section-title">Tender & Lead Identification</h4>
                </div>
              </div>
              <div className="form-grid">
                {/* Tender ID */}
                <div className="form-group">
                  <label htmlFor="edit-tenderId" className="form-label">Tender ID</label>
                  <input
                    ref={fieldRefs.tenderId}
                    type="text"
                    id="edit-tenderId"
                    name="tenderId"
                    className="form-input"
                    placeholder="e.g. GEM/2026/B/891240"
                    value={formData.tenderId}
                    onChange={handleChange}
                  />
                </div>

                {/* Sr. No. (Read-only) */}
                <div className="form-group">
                  <label htmlFor="edit-srNo" className="form-label">
                    Sr. No. <span className="required-mark">*</span>
                  </label>
                  <input
                    type="text"
                    id="edit-srNo"
                    name="srNo"
                    className="form-input"
                    readOnly
                    value={lead.srNo}
                  />
                </div>

                {/* Name of Work / Project */}
                <div className="form-group full-width">
                  <label htmlFor="edit-nameOfWorkEmplement" className="form-label">
                    Name of Work / Project <span className="required-mark">*</span>
                  </label>
                  <input
                    ref={fieldRefs.nameOfWorkEmplement}
                    type="text"
                    id="edit-nameOfWorkEmplement"
                    name="nameOfWorkEmplement"
                    className={`form-input ${errors.nameOfWorkEmplement ? 'is-invalid' : ''}`}
                    value={formData.nameOfWorkEmplement}
                    onChange={handleChange}
                  />
                  <span className="error-msg">{errors.nameOfWorkEmplement || ''}</span>
                </div>

                {/* Scope of Work */}
                <div className="form-group full-width">
                  <label htmlFor="edit-scopeOfWork" className="form-label">
                    Scope of Work
                  </label>
                  <input
                    ref={fieldRefs.scopeOfWork}
                    type="text"
                    id="edit-scopeOfWork"
                    name="scopeOfWork"
                    className={`form-input ${errors.scopeOfWork ? 'is-invalid' : ''}`}
                    value={formData.scopeOfWork}
                    onChange={handleChange}
                  />
                  <span className="error-msg">{errors.scopeOfWork || ''}</span>
                </div>
              </div>
            </div>

            {/* SECTION 02 — Client & Project Location */}
            <div className="form-section">
              <div className="form-section-header">
                <span className="form-section-badge">Section 02</span>
                <div>
                  <h4 className="form-section-title">Client & Project Location</h4>
                </div>
              </div>
              <div className="form-grid">
                {/* Name of Client */}
                <div className="form-group">
                  <label htmlFor="edit-nameOfClient" className="form-label">
                    Name of Client <span className="required-mark">*</span>
                  </label>
                  <input
                    ref={fieldRefs.nameOfClient}
                    type="text"
                    id="edit-nameOfClient"
                    name="nameOfClient"
                    className={`form-input ${errors.nameOfClient ? 'is-invalid' : ''}`}
                    value={formData.nameOfClient}
                    onChange={handleChange}
                  />
                  <span className="error-msg">{errors.nameOfClient || ''}</span>
                </div>

                {/* Location */}
                <div className="form-group">
                  <label htmlFor="edit-location" className="form-label">
                    Location <span className="required-mark">*</span>
                  </label>
                  <input
                    ref={fieldRefs.location}
                    type="text"
                    id="edit-location"
                    name="location"
                    className={`form-input ${errors.location ? 'is-invalid' : ''}`}
                    value={formData.location}
                    onChange={handleChange}
                  />
                  <span className="error-msg">{errors.location || ''}</span>
                </div>

                {/* Approximate Amount */}
                <div className="form-group">
                  <label htmlFor="edit-approximateAmount" className="form-label">
                    Approximate Amount <span className="required-mark">*</span>
                  </label>
                  <input
                    ref={fieldRefs.approximateAmount}
                    type="text"
                    id="edit-approximateAmount"
                    name="approximateAmount"
                    className={`form-input ${errors.approximateAmount ? 'is-invalid' : ''}`}
                    value={formData.approximateAmount}
                    onChange={handleChange}
                  />
                  <span className="error-msg">{errors.approximateAmount || ''}</span>
                </div>

                {/* Duration of Work Confirmation / Allotment */}
                <div className="form-group">
                  <label htmlFor="edit-durationOfWork" className="form-label">
                    Duration of Work Confirmation / Allotment <span className="required-mark">*</span>
                  </label>
                  <input
                    ref={fieldRefs.durationOfWork}
                    type="text"
                    id="edit-durationOfWork"
                    name="durationOfWork"
                    className={`form-input ${errors.durationOfWork ? 'is-invalid' : ''}`}
                    value={formData.durationOfWork}
                    onChange={handleChange}
                  />
                  <span className="error-msg">{errors.durationOfWork || ''}</span>
                </div>
              </div>
            </div>

            {/* SECTION 03 — External Client Contacts */}
            <div className="form-section">
              <div className="form-section-header">
                <span className="form-section-badge">Section 03</span>
                <div>
                  <h4 className="form-section-title">External Client Contacts</h4>
                </div>
              </div>
              <div className="form-grid">
                {/* Client Contact */}
                <div className="form-group">
                  <label htmlFor="edit-clientContact" className="form-label">Client Contact</label>
                  <input
                    ref={fieldRefs.clientContact}
                    type="text"
                    id="edit-clientContact"
                    name="clientContact"
                    className="form-input"
                    placeholder="e.g. +91 98250 11420"
                    value={formData.clientContact}
                    onChange={handleChange}
                  />
                </div>

                {/* Client Concerned Person (External) */}
                <div className="form-group">
                  <label htmlFor="edit-clientConcernedPersonExternal" className="form-label">
                    Client Concerned Person (External)
                  </label>
                  <input
                    ref={fieldRefs.clientConcernedPersonExternal}
                    type="text"
                    id="edit-clientConcernedPersonExternal"
                    name="clientConcernedPersonExternal"
                    className="form-input"
                    value={formData.clientConcernedPersonExternal}
                    onChange={handleChange}
                  />
                </div>

                {/* Client Concern Person Designation (External) */}
                <div className="form-group full-width">
                  <label htmlFor="edit-clientConcernPersonDesignationExternal" className="form-label">
                    Client Concern Person Designation (External)
                  </label>
                  <input
                    ref={fieldRefs.clientConcernPersonDesignationExternal}
                    type="text"
                    id="edit-clientConcernPersonDesignationExternal"
                    name="clientConcernPersonDesignationExternal"
                    className="form-input"
                    value={formData.clientConcernPersonDesignationExternal}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* SECTION 04 — Internal Reference & Assignment */}
            <div className="form-section">
              <div className="form-section-header">
                <span className="form-section-badge">Section 04</span>
                <div>
                  <h4 className="form-section-title">Internal Reference & Assignment</h4>
                </div>
              </div>
              <div className="form-grid">
                {/* Source of Inquiry */}
                <div className="form-group">
                  <label htmlFor="edit-sourceOfInquiry" className="form-label">
                    Source of Inquiry <span className="required-mark">*</span>
                  </label>
                  <select
                    ref={fieldRefs.sourceOfInquiry}
                    id="edit-sourceOfInquiry"
                    name="sourceOfInquiry"
                    className={`form-select ${errors.sourceOfInquiry ? 'is-invalid' : ''}`}
                    value={formData.sourceOfInquiry}
                    onChange={handleChange}
                  >
                    <option value="">Select Source of Inquiry</option>
                    {SOURCE_OF_INQUIRY_OPTIONS.map((src) => (
                      <option key={src} value={src}>{src}</option>
                    ))}
                  </select>
                  <span className="error-msg">{errors.sourceOfInquiry || ''}</span>
                </div>

                {/* Reference By */}
                <div className="form-group">
                  <label htmlFor="edit-referenceBy" className="form-label">Reference By</label>
                  <input
                    ref={fieldRefs.referenceBy}
                    type="text"
                    id="edit-referenceBy"
                    name="referenceBy"
                    className="form-input"
                    value={formData.referenceBy}
                    onChange={handleChange}
                  />
                </div>

                {/* Allotted To */}
                <div className="form-group full-width">
                  <label htmlFor="edit-allottedTo" className="form-label">Allotted To</label>
                  <select
                    ref={fieldRefs.allottedTo}
                    id="edit-allottedTo"
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
                </div>
              </div>
            </div>

            {/* SECTION 05 — Work Requirements & Notes */}
            <div className="form-section">
              <div className="form-section-header">
                <span className="form-section-badge">Section 05</span>
                <div>
                  <h4 className="form-section-title">Work Requirements & Notes</h4>
                </div>
              </div>
              <div className="form-grid">
                {/* Hurdles / Specific Task */}
                <div className="form-group">
                  <label htmlFor="edit-hurdlesSpecificTask" className="form-label">
                    Hurdles / Specific Task <span className="required-mark">*</span>
                  </label>
                  <select
                    ref={fieldRefs.hurdlesSpecificTask}
                    id="edit-hurdlesSpecificTask"
                    name="hurdlesSpecificTask"
                    className={`form-select ${errors.hurdlesSpecificTask ? 'is-invalid' : ''}`}
                    value={formData.hurdlesSpecificTask}
                    onChange={handleChange}
                  >
                    <option value="">Select Hurdles / Specific Task</option>
                    {HURDLES_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <span className="error-msg">{errors.hurdlesSpecificTask || ''}</span>
                </div>

                {/* Remarks */}
                <div className="form-group full-width">
                  <label htmlFor="edit-remarks" className="form-label">Remarks</label>
                  <textarea
                    ref={fieldRefs.remarks}
                    id="edit-remarks"
                    name="remarks"
                    className="form-input"
                    style={{ minHeight: '80px', height: 'auto', padding: '10px 12px' }}
                    value={formData.remarks}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="modal-actions" style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
              <button
                type="button"
                className="btn btn-secondary"
                id="btn-cancel-edit"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                id="btn-save-edit"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
