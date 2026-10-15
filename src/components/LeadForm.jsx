import React, { useState, useRef } from 'react';
import {
  PERSON_DESIGNATION_MAP,
  CONCERN_PERSON_OPTIONS,
  SOURCE_OF_INQUIRY_OPTIONS,
  HURDLES_OPTIONS
} from '../data/mockLeads';
import { generateUniqueId } from '../utils/leadUtils';

const INITIAL_FORM_STATE = {
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
};

export default function LeadForm({ nextSrNo, onAddLead }) {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Field refs for auto-focusing the first invalid field
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
          <p className="page-subtitle">Enter the details of a new business inquiry.</p>
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
          <div className="form-grid">
            {/* 1. Sr. No. */}
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

            {/* 2. Name of Work Emplement */}
            <div className="form-group">
              <label htmlFor="nameOfWorkEmplement" className="form-label">
                Name of Work Emplement <span className="required-mark">*</span>
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

            {/* 3. Scope of Work */}
            <div className="form-group">
              <label htmlFor="scopeOfWork" className="form-label">
                Scope of Work <span className="required-mark">*</span>
              </label>
              <input
                ref={fieldRefs.scopeOfWork}
                type="text"
                id="scopeOfWork"
                name="scopeOfWork"
                className={`form-input ${errors.scopeOfWork ? 'is-invalid' : ''}`}
                placeholder="e.g. Contour mapping, DGPS benchmark pillar installation"
                value={formData.scopeOfWork}
                onChange={handleChange}
              />
              <span className="error-msg" id="error-scopeOfWork">
                {errors.scopeOfWork || ''}
              </span>
            </div>

            {/* 4. Name of Client */}
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

            {/* 5. Location */}
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

            {/* 6. Concern Person */}
            <div className="form-group">
              <label htmlFor="concernPerson" className="form-label">
                Concern Person <span className="required-mark">*</span>
              </label>
              <select
                ref={fieldRefs.concernPerson}
                id="concernPerson"
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
              <span className="error-msg" id="error-concernPerson">
                {errors.concernPerson || ''}
              </span>
            </div>

            {/* 7. Contact Details */}
            <div className="form-group">
              <label htmlFor="contactDetails" className="form-label">
                Contact Details <span className="required-mark">*</span>
              </label>
              <input
                ref={fieldRefs.contactDetails}
                type="text"
                id="contactDetails"
                name="contactDetails"
                className={`form-input ${errors.contactDetails ? 'is-invalid' : ''}`}
                placeholder="e.g. +91 98250 11420 / contact@client.org"
                value={formData.contactDetails}
                onChange={handleChange}
              />
              <span className="error-msg" id="error-contactDetails">
                {errors.contactDetails || ''}
              </span>
            </div>

            {/* 8. Designation of Concern Person */}
            <div className="form-group">
              <label htmlFor="designationOfConcernPerson" className="form-label">
                Designation of Concern Person <span className="required-mark">*</span>
              </label>
              <select
                ref={fieldRefs.designationOfConcernPerson}
                id="designationOfConcernPerson"
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
              <span className="error-msg" id="error-designationOfConcernPerson">
                {errors.designationOfConcernPerson || ''}
              </span>
            </div>

            {/* 9. Source of Inquiry */}
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

            {/* 10. Duration of work confirmation / allotment */}
            <div className="form-group">
              <label htmlFor="durationOfWork" className="form-label">
                Duration of work confirmation / allotment <span className="required-mark">*</span>
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

            {/* 11. Hurdles / specific task */}
            <div className="form-group">
              <label htmlFor="hurdlesSpecificTask" className="form-label">
                Hurdles / specific task <span className="required-mark">*</span>
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

            {/* 12. Approximate amount */}
            <div className="form-group">
              <label htmlFor="approximateAmount" className="form-label">
                Approximate amount <span className="required-mark">*</span>
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

            {/* 13. Remarks */}
            <div className="form-group full-width">
              <label htmlFor="remarks" className="form-label">Remarks</label>
              <input
                ref={fieldRefs.remarks}
                type="text"
                id="remarks"
                name="remarks"
                className={`form-input ${errors.remarks ? 'is-invalid' : ''}`}
                placeholder="e.g. Preliminary discussion completed; awaiting BoQ sign-off."
                value={formData.remarks}
                onChange={handleChange}
              />
              <span className="error-msg" id="error-remarks">
                {errors.remarks || ''}
              </span>
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
