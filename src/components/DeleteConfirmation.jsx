import React, { useEffect } from 'react';

export default function DeleteConfirmation({ lead, onConfirm, onCancel }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && lead) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lead, onCancel]);

  if (!lead) return null;

  const handleBackdropClick = (e) => {
    if (e.target.id === 'delete-modal') {
      onCancel();
    }
  };

  return (
    <div
      className="modal-backdrop"
      id="delete-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      onClick={handleBackdropClick}
    >
      <div className="modal-card modal-card-small">
        <div className="modal-header">
          <div className="delete-header-wrap">
            <div className="delete-warning-icon" aria-hidden="true">
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
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </div>
            <div>
              <h3 className="modal-title" id="delete-modal-title">Delete Lead</h3>
              <p className="modal-subtitle">Confirm record removal</p>
            </div>
          </div>
          <button
            type="button"
            className="btn-icon-close"
            id="btn-close-delete-modal"
            aria-label="Close modal"
            onClick={onCancel}
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
          <p className="delete-message" id="delete-confirmation-msg">
            Are you sure you want to delete{' '}
            <strong>Lead #{lead.srNo} — {lead.nameOfWorkEmplement}</strong>? This action
            cannot be undone.
          </p>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            id="btn-cancel-delete"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            id="btn-confirm-delete"
            onClick={() => onConfirm(lead.id)}
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
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
