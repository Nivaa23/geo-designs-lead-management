import React, { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import { sortLeadsAscending } from '../utils/leadUtils';
import { normalizeConcernPerson } from '../data/mockLeads';

const ITEMS_PER_PAGE = 10;

export default function LeadsTable({
  leads = [],
  onEdit,
  onDelete,
  onView,
  tableAlert,
  isLoading = false,
  fetchError = null
}) {
  const [currentPage, setCurrentPage] = useState(1);

  // Always sort records in ascending numerical order of Sr. No. before rendering
  const sortedLeads = sortLeadsAscending(leads);
  const totalCount = sortedLeads.length;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE) || 1;

  // Ensure current page remains valid when leads count changes (e.g. after deletion)
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
  const paginatedLeads = sortedLeads.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Pagination controls appear strictly when more than 10 leads exist
  const showPagination = totalCount > ITEMS_PER_PAGE;

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  return (
    <section className="screen-view active" id="screen-view-leads" aria-labelledby="heading-view-leads">
      <header className="content-header">
        <div className="header-titles">
          <h2 className="page-title" id="heading-view-leads">View Previous Leads</h2>
          <p className="page-subtitle">Review previously recorded business inquiries.</p>
        </div>
        <div className="header-meta">
          <span className="records-badge" id="records-count-badge">
            {totalCount} {totalCount === 1 ? 'Record' : 'Records'}
          </span>
        </div>
      </header>

      {/* Fetch Error Banner if present */}
      {fetchError && !tableAlert && (
        <div className="alert-banner error" id="table-fetch-error" role="alert">
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
          <span>Failed to load leads from database: {fetchError}</span>
        </div>
      )}

      {/* Notification Banner on Previous Leads Table Screen */}
      {tableAlert && (
        <div
          className={`alert-banner ${tableAlert.type}`}
          id="table-alert"
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
            {tableAlert.type === 'success' ? (
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
          <span>{tableAlert.message}</span>
        </div>
      )}

      <div className="table-container-card">
        <div className="table-wrapper" tabIndex={0} role="region" aria-label="Leads Data Table">
          <table className="leads-table" id="leads-table">
            <thead>
              <tr>
                <th scope="col" style={{ minWidth: '80px' }}>Sr. No.</th>
                <th scope="col" style={{ minWidth: '95px', textAlign: 'center' }}>Action</th>
                <th scope="col" style={{ minWidth: '220px' }}>Name of Work Emplement</th>
                <th scope="col" style={{ minWidth: '200px' }}>Scope of Work</th>
                <th scope="col" style={{ minWidth: '190px' }}>Name of Client</th>
                <th scope="col" style={{ minWidth: '150px' }}>Location</th>
                <th scope="col" style={{ minWidth: '190px' }}>Concern Person</th>
                <th scope="col" style={{ minWidth: '170px' }}>Contact Details</th>
                <th scope="col" style={{ minWidth: '170px' }}>Designation of Concern Person</th>
                <th scope="col" style={{ minWidth: '160px' }}>Source of Inquiry</th>
                <th scope="col" style={{ minWidth: '190px' }}>Duration of work confirmation / allotment</th>
                <th scope="col" style={{ minWidth: '160px' }}>Hurdles / specific task</th>
                <th scope="col" style={{ minWidth: '150px' }}>Approximate amount</th>
                <th scope="col" style={{ minWidth: '220px' }}>Remarks</th>
                <th scope="col" style={{ minWidth: '110px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody id="leads-table-body">
              {isLoading ? (
                <tr className="empty-table-row">
                  <td colSpan={15} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Loading previous leads from database...
                  </td>
                </tr>
              ) : sortedLeads.length === 0 ? (
                <tr className="empty-table-row">
                  <td colSpan={15}>No lead records found. Use the Add New Lead form to create one.</td>
                </tr>
              ) : (
                paginatedLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className={`table-row-clickable ${lead.isNew ? 'row-new' : ''}`}
                    onClick={() => onView && onView(lead)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onView && onView(lead);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`View details for Lead #${lead.srNo} — ${lead.nameOfWorkEmplement}`}
                  >
                    <td className="sr-no-cell">{lead.srNo}</td>
                    <td
                      className="action-view-cell"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        className="btn-table-view"
                        data-id={lead.id}
                        title={`View Lead #${lead.srNo}`}
                        aria-label={`View Lead #${lead.srNo}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onView && onView(lead);
                        }}
                      >
                        <Eye size={14} aria-hidden="true" />
                        <span>View</span>
                      </button>
                    </td>
                    <td><strong>{lead.nameOfWorkEmplement}</strong></td>
                    <td>{lead.scopeOfWork}</td>
                    <td>{lead.nameOfClient}</td>
                    <td>{lead.location}</td>
                    <td>{normalizeConcernPerson(lead.concernPerson)}</td>
                    <td>{lead.contactDetails}</td>
                    <td>
                      <span className="badge badge-designation">
                        {lead.designationOfConcernPerson}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-source">
                        {lead.sourceOfInquiry}
                      </span>
                    </td>
                    <td>{lead.durationOfWork}</td>
                    <td>
                      <span className="badge badge-hurdle">
                        {lead.hurdlesSpecificTask}
                      </span>
                    </td>
                    <td className="amount-cell">{lead.approximateAmount}</td>
                    <td>{lead.remarks || '—'}</td>
                    <td
                      className="actions-cell"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="actions-cell-inner">
                        <button
                          type="button"
                          className="btn-action btn-action-edit"
                          data-id={lead.id}
                          title={`Edit Lead #${lead.srNo}`}
                          aria-label={`Edit Lead #${lead.srNo}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(lead);
                          }}
                        >
                          <svg
                            width="15"
                            height="15"
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
                        </button>
                        <button
                          type="button"
                          className="btn-action btn-action-delete"
                          data-id={lead.id}
                          title={`Delete Lead #${lead.srNo}`}
                          aria-label={`Delete Lead #${lead.srNo}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(lead);
                          }}
                        >
                          <svg
                            width="15"
                            height="15"
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
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls directly below the leads table */}
        {showPagination && (
          <nav
            className="table-pagination"
            aria-label="Table Pagination"
            id="leads-table-pagination"
          >
            <button
              type="button"
              className="btn-pagination"
              id="btn-pagination-prev"
              disabled={validCurrentPage === 1}
              onClick={handlePrevPage}
              aria-label="Previous page"
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
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              <span>Previous</span>
            </button>

            <span className="pagination-indicator" id="pagination-indicator">
              Page {validCurrentPage} of {totalPages}
            </span>

            <button
              type="button"
              className="btn-pagination"
              id="btn-pagination-next"
              disabled={validCurrentPage === totalPages}
              onClick={handleNextPage}
              aria-label="Next page"
            >
              <span>Next</span>
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
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </nav>
        )}
      </div>
    </section>
  );
}
