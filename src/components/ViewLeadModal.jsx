import React, { useEffect } from 'react';
import { normalizeConcernPerson } from '../data/mockLeads';

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

  const normalizedPerson = normalizeConcernPerson(lead.concernPerson);

  return (
    <div
      className="modal-backdrop"
      id="view-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="view-modal-title"
      onClick={handleBackdropClick}
    >
      <div className="modal-card">
        <div className="modal-header">
          <div className="view-modal-header-meta">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 className="modal-title" id="view-modal-title">Lead Details</h3>
                <span className="records-badge" id="view-modal-badge">
                  Lead #{lead.srNo}
                </span>
              </div>
              <p className="modal-subtitle">Complete information for the selected business inquiry.</p>
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

        <div className="modal-body">
          <div className="form-grid">
            {/* 1. Sr. No. */}
            <div className="detail-item">
              <span className="form-label">Sr. No.</span>
              <div className="detail-value">{lead.srNo}</div>
            </div>

            {/* 2. Name of Work Emplement */}
            <div className="detail-item">
              <span className="form-label">Name of Work Emplement</span>
              <div className="detail-value">
                <strong>{lead.nameOfWorkEmplement || <span className="text-muted">Not provided</span>}</strong>
              </div>
            </div>

            {/* 3. Scope of Work */}
            <div className="detail-item">
              <span className="form-label">Scope of Work</span>
              <div className="detail-value text-multiline">
                {lead.scopeOfWork || <span className="text-muted">Not provided</span>}
              </div>
            </div>

            {/* 4. Name of Client */}
            <div className="detail-item">
              <span className="form-label">Name of Client</span>
              <div className="detail-value">
                {lead.nameOfClient || <span className="text-muted">Not provided</span>}
              </div>
            </div>

            {/* 5. Location */}
            <div className="detail-item">
              <span className="form-label">Location</span>
              <div className="detail-value">
                {lead.location || <span className="text-muted">Not provided</span>}
              </div>
            </div>

            {/* 6. Concern Person */}
            <div className="detail-item">
              <span className="form-label">Concern Person</span>
              <div className="detail-value">
                {normalizedPerson || <span className="text-muted">Not provided</span>}
              </div>
            </div>

            {/* 7. Contact Details */}
            <div className="detail-item">
              <span className="form-label">Contact Details</span>
              <div className="detail-value">
                {lead.contactDetails || <span className="text-muted">Not provided</span>}
              </div>
            </div>

            {/* 8. Designation of Concern Person */}
            <div className="detail-item">
              <span className="form-label">Designation of Concern Person</span>
              <div className="detail-value">
                {lead.designationOfConcernPerson ? (
                  <span className="badge badge-designation">
                    {lead.designationOfConcernPerson}
                  </span>
                ) : (
                  <span className="text-muted">Not provided</span>
                )}
              </div>
            </div>

            {/* 9. Source of Inquiry */}
            <div className="detail-item">
              <span className="form-label">Source of Inquiry</span>
              <div className="detail-value">
                {lead.sourceOfInquiry ? (
                  <span className="badge badge-source">
                    {lead.sourceOfInquiry}
                  </span>
                ) : (
                  <span className="text-muted">Not provided</span>
                )}
              </div>
            </div>

            {/* 10. Duration of work confirmation / allotment */}
            <div className="detail-item">
              <span className="form-label">Duration of work confirmation / allotment</span>
              <div className="detail-value">
                {lead.durationOfWork || <span className="text-muted">Not provided</span>}
              </div>
            </div>

            {/* 11. Hurdles / specific task */}
            <div className="detail-item">
              <span className="form-label">Hurdles / specific task</span>
              <div className="detail-value">
                {lead.hurdlesSpecificTask ? (
                  <span className="badge badge-hurdle">
                    {lead.hurdlesSpecificTask}
                  </span>
                ) : (
                  <span className="text-muted">Not provided</span>
                )}
              </div>
            </div>

            {/* 12. Approximate amount */}
            <div className="detail-item">
              <span className="form-label">Approximate amount</span>
              <div className="detail-value amount-cell">
                {lead.approximateAmount || <span className="text-muted">Not provided</span>}
              </div>
            </div>

            {/* 13. Remarks */}
            <div className="detail-item full-width">
              <span className="form-label">Remarks</span>
              <div className="detail-value text-multiline">
                {lead.remarks ? lead.remarks : <span className="text-muted">Not provided</span>}
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
              <path d="M11 4H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            <span>Edit Lead</span>
          </button>
        </div>
      </div>
    </div>
  );
}
