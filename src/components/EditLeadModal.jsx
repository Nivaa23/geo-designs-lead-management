import React, { useState, useEffect, useRef } from 'react';
import {
  PERSON_DESIGNATION_MAP,
  CONCERN_PERSON_OPTIONS,
  SOURCE_OF_INQUIRY_OPTIONS,
  HURDLES_OPTIONS,
  normalizeConcernPerson
} from '../data/mockLeads';

export default function EditLeadModal({ lead, onSave, onClose }) {
  const [formData, setFormData] = useState({
    nameOfWorkEmplement: '',
    scopeOfWork: '',
    nameOfClient: '',
    location: '',
    concernPerson: '',
    contactDetails: '',
    designationOfConcernPerson: '',
    sourceOfInquiry: '',
    durationOfWork: '',
    hurdlesSpecificTask: '',
    approximateAmount: '',
    remarks: ''
  });
  const [errors, setErrors] = useState({});
  const [errorBanner, setErrorBanner] = useState('');

  const fieldRefs = {
    nameOfWorkEmplement: useRef(null),
    scopeOfWork: useRef(null),
    nameOfClient: useRef(null),
    location: useRef(null),
    concernPerson: useRef(null),
    contactDetails: useRef(null),
    designationOfConcernPerson: useRef(null),
    sourceOfInquiry: useRef(null),
    durationOfWork: useRef(null),
    hurdlesSpecificTask: useRef(null),
    approximateAmount: useRef(null),
    remarks: useRef(null)
  };

  useEffect(() => {
    if (lead) {
      const person = normalizeConcernPerson(lead.concernPerson);
      const designation =
        PERSON_DESIGNATION_MAP[person] || lead.designationOfConcernPerson || '';
      setFormData({
        nameOfWorkEmplement: lead.nameOfWorkEmplement || '',
        scopeOfWork: lead.scopeOfWork || '',
        nameOfClient: lead.nameOfClient || '',
        location: lead.location || '',
        concernPerson: person,
        contactDetails: lead.contactDetails || '',
        designationOfConcernPerson: designation,
        sourceOfInquiry: lead.sourceOfInquiry || '',
        durationOfWork: lead.durationOfWork || '',
        hurdlesSpecificTask: lead.hurdlesSpecificTask || '',
        approximateAmount: lead.approximateAmount || '',
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

    if (name === 'concernPerson') {
      const mappedDesignation = PERSON_DESIGNATION_MAP[value] || '';
      setFormData((prev) => ({
        ...prev,
        concernPerson: value,
        designationOfConcernPerson: mappedDesignation
      }));
      if (errors.designationOfConcernPerson) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.designationOfConcernPerson;
          return next;
        });
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
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
      markError('nameOfWorkEmplement', 'Please enter the Name of Work Emplement.');
    }
    if (!formData.scopeOfWork.trim()) {
      markError('scopeOfWork', 'Please enter the Scope of Work.');
    }
    if (!formData.nameOfClient.trim()) {
      markError('nameOfClient', 'Please enter the Name of Client.');
    }
    if (!formData.location.trim()) {
      markError('location', 'Please enter the Location.');
    }
    if (!formData.concernPerson) {
      markError('concernPerson', 'Please select the Concern Person.');
    }
    if (!formData.contactDetails.trim()) {
      markError('contactDetails', 'Please enter the Contact Details.');
    }
    if (!formData.sourceOfInquiry) {
      markError('sourceOfInquiry', 'Please select the Source of Inquiry.');
    }
    if (!formData.durationOfWork.trim()) {
      markError('durationOfWork', 'Please enter the duration of confirmation / allotment.');
    }
    if (!formData.hurdlesSpecificTask) {
      markError('hurdlesSpecificTask', 'Please select the Hurdles / specific task.');
    }
    if (!formData.approximateAmount.trim()) {
      markError('approximateAmount', 'Please enter the Approximate amount.');
    }

    if (
      formData.concernPerson &&
      PERSON_DESIGNATION_MAP[formData.concernPerson] !== formData.designationOfConcernPerson
    ) {
      markError('designationOfConcernPerson', 'Designation is inconsistent with selected Concern Person.');
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
      nameOfWorkEmplement: formData.nameOfWorkEmplement.trim(),
      scopeOfWork: formData.scopeOfWork.trim(),
      nameOfClient: formData.nameOfClient.trim(),
      location: formData.location.trim(),
      concernPerson: formData.concernPerson,
      contactDetails: formData.contactDetails.trim(),
      designationOfConcernPerson: formData.designationOfConcernPerson,
      sourceOfInquiry: formData.sourceOfInquiry,
      durationOfWork: formData.durationOfWork.trim(),
      hurdlesSpecificTask: formData.hurdlesSpecificTask,
      approximateAmount: formData.approximateAmount.trim(),
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
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <h3 className="modal-title" id="edit-modal-title">Edit Lead</h3>
            <p className="modal-subtitle">Modify business inquiry details</p>
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

        <div className="modal-body">
          {errorBanner && (
            <div className="alert-banner error" id="edit-form-alert" role="alert">
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
            <div className="form-grid">
              {/* 1. Sr. No. (Read-only, preserves sequence) */}
              <div className="form-group">
                <label htmlFor="edit-srNo" className="form-label">
                  Sr. No. <span className="required-mark">*</span>
                </label>
                <input
                  type="text"
                  id="edit-srNo"
                  name="edit-srNo"
                  className="form-input"
                  readOnly
                  value={lead.srNo}
                />
                <span className="field-hint">Lead number remains unchanged</span>
              </div>

              {/* 2. Name of Work Emplement */}
              <div className="form-group">
                <label htmlFor="edit-nameOfWorkEmplement" className="form-label">
                  Name of Work Emplement <span className="required-mark">*</span>
                </label>
                <input
                  ref={fieldRefs.nameOfWorkEmplement}
                  type="text"
                  id="edit-nameOfWorkEmplement"
                  name="nameOfWorkEmplement"
                  className={`form-input ${errors.nameOfWorkEmplement ? 'is-invalid' : ''}`}
                  placeholder="e.g. Topographical Survey"
                  value={formData.nameOfWorkEmplement}
                  onChange={handleChange}
                />
                <span className="error-msg" id="error-edit-nameOfWorkEmplement">
                  {errors.nameOfWorkEmplement || ''}
                </span>
              </div>

              {/* 3. Scope of Work */}
              <div className="form-group">
                <label htmlFor="edit-scopeOfWork" className="form-label">
                  Scope of Work <span className="required-mark">*</span>
                </label>
                <input
                  ref={fieldRefs.scopeOfWork}
                  type="text"
                  id="edit-scopeOfWork"
                  name="scopeOfWork"
                  className={`form-input ${errors.scopeOfWork ? 'is-invalid' : ''}`}
                  placeholder="e.g. Contour mapping, DGPS"
                  value={formData.scopeOfWork}
                  onChange={handleChange}
                />
                <span className="error-msg" id="error-edit-scopeOfWork">
                  {errors.scopeOfWork || ''}
                </span>
              </div>

              {/* 4. Name of Client */}
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
                  placeholder="e.g. Urban Development Authority"
                  value={formData.nameOfClient}
                  onChange={handleChange}
                />
                <span className="error-msg" id="error-edit-nameOfClient">
                  {errors.nameOfClient || ''}
                </span>
              </div>

              {/* 5. Location */}
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
                  placeholder="e.g. Gandhinagar, Gujarat"
                  value={formData.location}
                  onChange={handleChange}
                />
                <span className="error-msg" id="error-edit-location">
                  {errors.location || ''}
                </span>
              </div>

              {/* 6. Concern Person */}
              <div className="form-group">
                <label htmlFor="edit-concernPerson" className="form-label">
                  Concern Person <span className="required-mark">*</span>
                </label>
                <select
                  ref={fieldRefs.concernPerson}
                  id="edit-concernPerson"
                  name="concernPerson"
                  className={`form-select ${errors.concernPerson ? 'is-invalid' : ''}`}
                  value={formData.concernPerson}
                  onChange={handleChange}
                >
                  <option value="">Select Concern Person</option>
                  {CONCERN_PERSON_OPTIONS.map((person) => (
                    <option key={person} value={person}>
                      {person}
                    </option>
                  ))}
                </select>
                <span className="error-msg" id="error-edit-concernPerson">
                  {errors.concernPerson || ''}
                </span>
              </div>

              {/* 7. Contact Details */}
              <div className="form-group">
                <label htmlFor="edit-contactDetails" className="form-label">
                  Contact Details <span className="required-mark">*</span>
                </label>
                <input
                  ref={fieldRefs.contactDetails}
                  type="text"
                  id="edit-contactDetails"
                  name="contactDetails"
                  className={`form-input ${errors.contactDetails ? 'is-invalid' : ''}`}
                  placeholder="e.g. +91 98250 11420"
                  value={formData.contactDetails}
                  onChange={handleChange}
                />
                <span className="error-msg" id="error-edit-contactDetails">
                  {errors.contactDetails || ''}
                </span>
              </div>

              {/* 8. Designation of Concern Person */}
              <div className="form-group">
                <label htmlFor="edit-designationOfConcernPerson" className="form-label">
                  Designation of Concern Person <span className="required-mark">*</span>
                </label>
                <select
                  ref={fieldRefs.designationOfConcernPerson}
                  id="edit-designationOfConcernPerson"
                  name="designationOfConcernPerson"
                  className={`form-select ${errors.designationOfConcernPerson ? 'is-invalid' : ''}`}
                  disabled
                  value={formData.designationOfConcernPerson}
                  onChange={handleChange}
                >
                  <option value="">Select Designation</option>
                  <option value="COO">COO</option>
                  <option value="Admin">Admin</option>
                  <option value="GM (Architecture)">GM (Architecture)</option>
                </select>
                <span className="field-hint">Automatically linked to Concern Person</span>
                <span className="error-msg" id="error-edit-designationOfConcernPerson">
                  {errors.designationOfConcernPerson || ''}
                </span>
              </div>

              {/* 9. Source of Inquiry */}
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
                    <option key={src} value={src}>
                      {src}
                    </option>
                  ))}
                </select>
                <span className="error-msg" id="error-edit-sourceOfInquiry">
                  {errors.sourceOfInquiry || ''}
                </span>
              </div>

              {/* 10. Duration of work confirmation / allotment */}
              <div className="form-group">
                <label htmlFor="edit-durationOfWork" className="form-label">
                  Duration of work confirmation / allotment <span className="required-mark">*</span>
                </label>
                <input
                  ref={fieldRefs.durationOfWork}
                  type="text"
                  id="edit-durationOfWork"
                  name="durationOfWork"
                  className={`form-input ${errors.durationOfWork ? 'is-invalid' : ''}`}
                  placeholder="e.g. 15 working days"
                  value={formData.durationOfWork}
                  onChange={handleChange}
                />
                <span className="error-msg" id="error-edit-durationOfWork">
                  {errors.durationOfWork || ''}
                </span>
              </div>

              {/* 11. Hurdles / specific task */}
              <div className="form-group">
                <label htmlFor="edit-hurdlesSpecificTask" className="form-label">
                  Hurdles / specific task <span className="required-mark">*</span>
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
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <span className="error-msg" id="error-edit-hurdlesSpecificTask">
                  {errors.hurdlesSpecificTask || ''}
                </span>
              </div>

              {/* 12. Approximate amount */}
              <div className="form-group">
                <label htmlFor="edit-approximateAmount" className="form-label">
                  Approximate amount <span className="required-mark">*</span>
                </label>
                <input
                  ref={fieldRefs.approximateAmount}
                  type="text"
                  id="edit-approximateAmount"
                  name="approximateAmount"
                  className={`form-input ${errors.approximateAmount ? 'is-invalid' : ''}`}
                  placeholder="e.g. ₹ 8,50,000"
                  value={formData.approximateAmount}
                  onChange={handleChange}
                />
                <span className="error-msg" id="error-edit-approximateAmount">
                  {errors.approximateAmount || ''}
                </span>
              </div>

              {/* 13. Remarks */}
              <div className="form-group full-width">
                <label htmlFor="edit-remarks" className="form-label">Remarks</label>
                <input
                  ref={fieldRefs.remarks}
                  type="text"
                  id="edit-remarks"
                  name="remarks"
                  className={`form-input ${errors.remarks ? 'is-invalid' : ''}`}
                  placeholder="e.g. Status notes..."
                  value={formData.remarks}
                  onChange={handleChange}
                />
                <span className="error-msg" id="error-edit-remarks">
                  {errors.remarks || ''}
                </span>
              </div>
            </div>
          </form>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            id="btn-cancel-edit"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            id="btn-save-edit"
            onClick={handleSubmit}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
}
