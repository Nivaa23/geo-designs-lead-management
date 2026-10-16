import React, { useEffect } from 'react';
import { normalizeConcernPerson, PERSON_DESIGNATION_MAP } from '../data/mockLeads';

export default function ViewLeadModal({ lead, onClose, onEdit }) {
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

  const handleBackdropClick = (e) => {
    if (e.target.id === 'view-modal') {
      onClose();
    }
  };

  const handleEditClick = () => {
    onClose();
    onEdit(lead);
  };

  const allottedName = lead.allottedTo || normalizeConcernPerson(lead.concernPerson) || '';
  const allottedDesignation = PERSON_DESIGNATION_MAP[allottedName] || lead.designationOfConcernPerson;

  return (
    <div
      className="modal-backdrop"
      id="view-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="view-modal-title"
      onClick={handleBackdropClick}
    >
      <div className="modal-card" style={{ maxWidth: '850px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header">
          <div className="view-modal-header-meta">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 className="modal-title" id="view-modal-title">Lead Details</h3>
                <span className="records-badge" id="view-modal-badge">
                  Lead #{lead.srNo}
                </span>
                {lead.tenderId && (
                  <span className="badge badge-source" style={{ background: '#f1f5f9', color: '#475569' }}>
                    Tender: {lead.tenderId}
                  </span>
                )}
              </div>
              <p className="modal-subtitle">Complete information for the selected business inquiry across five sections.</p>
            </div>
          </div>
          <button
            type="button"
            className="btn-icon-close"
            id="btn-close-view-modal"
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
          {/* SECTION 01 — Tender & Lead Identification */}
          <div className="form-section">
            <div className="form-section-header">
              <span className="form-section-badge">Section 01</span>
              <div>
                <h4 className="form-section-title">Tender & Lead Identification</h4>
              </div>
            </div>
            <div className="form-grid">
              <div className="detail-item">
                <span className="form-label">Tender ID</span>
                <div className="detail-value">
                  {lead.tenderId || <span className="text-muted">Not specified</span>}
                </div>
              </div>

              <div className="detail-item">
                <span className="form-label">Sr. No.</span>
                <div className="detail-value font-semibold">#{lead.srNo}</div>
              </div>

              <div className="detail-item full-width">
                <span className="form-label">Name of Work / Project</span>
                <div className="detail-value">
                  <strong>{lead.nameOfWorkEmplement || <span className="text-muted">Not provided</span>}</strong>
                </div>
              </div>

              <div className="detail-item full-width">
                <span className="form-label">Scope of Work</span>
                <div className="detail-value text-multiline">
                  {lead.scopeOfWork || <span className="text-muted">Not provided</span>}
                </div>
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
              <div className="detail-item">
                <span className="form-label">Name of Client</span>
                <div className="detail-value">
                  {lead.nameOfClient || <span className="text-muted">Not provided</span>}
                </div>
              </div>

              <div className="detail-item">
                <span className="form-label">Location</span>
                <div className="detail-value">
                  {lead.location || <span className="text-muted">Not provided</span>}
                </div>
              </div>

              <div className="detail-item">
                <span className="form-label">Approximate Amount</span>
                <div className="detail-value amount-cell">
                  {lead.approximateAmount || <span className="text-muted">Not provided</span>}
                </div>
              </div>

              <div className="detail-item">
                <span className="form-label">Duration of Work Confirmation / Allotment</span>
                <div className="detail-value">
                  {lead.durationOfWork || <span className="text-muted">Not provided</span>}
                </div>
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
              <div className="detail-item">
                <span className="form-label">Client Contact</span>
                <div className="detail-value">
                  {lead.clientContact || lead.contactDetails || <span className="text-muted">Not provided</span>}
                </div>
              </div>

              <div className="detail-item">
                <span className="form-label">Client Concerned Person (External)</span>
                <div className="detail-value">
                  {lead.clientConcernedPersonExternal || <span className="text-muted">Not provided</span>}
                </div>
              </div>

              <div className="detail-item full-width">
                <span className="form-label">Client Concern Person Designation (External)</span>
                <div className="detail-value">
                  {lead.clientConcernPersonDesignationExternal ? (
                    <span className="badge badge-designation">
                      {lead.clientConcernPersonDesignationExternal}
                    </span>
                  ) : (
                    <span className="text-muted">Not provided</span>
                  )}
                </div>
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
              <div className="detail-item">
                <span className="form-label">Source of Inquiry</span>
                <div className="detail-value">
                  {lead.sourceOfInquiry ? (
                    <span className="badge badge-source">{lead.sourceOfInquiry}</span>
                  ) : (
                    <span className="text-muted">Not provided</span>
                  )}
                </div>
              </div>

              <div className="detail-item">
                <span className="form-label">Reference By</span>
                <div className="detail-value">
                  {lead.referenceBy || <span className="text-muted">Not provided</span>}
                </div>
              </div>

              <div className="detail-item full-width">
                <span className="form-label">Allotted To</span>
                <div className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {allottedName ? (
                    <>
                      <strong>{allottedName}</strong>
                      {allottedDesignation && (
                        <span className="badge badge-designation">{allottedDesignation}</span>
                      )}
                    </>
                  ) : (
                    <span className="text-muted">Not assigned</span>
                  )}
                </div>
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
              <div className="detail-item">
                <span className="form-label">Hurdles / Specific Task</span>
                <div className="detail-value">
                  {lead.hurdlesSpecificTask ? (
                    <span className="badge badge-hurdle">{lead.hurdlesSpecificTask}</span>
                  ) : (
                    <span className="text-muted">Not provided</span>
                  )}
                </div>
              </div>

              <div className="detail-item full-width">
                <span className="form-label">Remarks</span>
                <div className="detail-value text-multiline">
                  {lead.remarks ? lead.remarks : <span className="text-muted">Not provided</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            id="btn-close-view"
            onClick={onClose}
          >
            Close
          </button>
          <button
            type="button"
            className="btn btn-primary"
            id="btn-edit-from-view"
            onClick={handleEditClick}
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
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            <span>Edit Lead</span>
          </button>
        </div>
      </div>
    </div>
  );
}
