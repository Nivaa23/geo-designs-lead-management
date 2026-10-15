



import React from 'react';
import { Eye, ArrowLeft, AlertCircle } from 'lucide-react';
import { sortLeadsAscending } from '../utils/leadUtils';
import { normalizeConcernPerson } from '../data/mockLeads';

/**
 * Four predefined demonstration scenarios per specification:
 * - Scenario 1: Follow-up Pending
 * - Scenario 2: Quotation Pending
 * - Scenario 3: Information Required
 * - Scenario 4: Follow-up Overdue
 *
 * NOTE: These classifications are simulated demonstration data only and
 * are kept separate from the underlying database records.
 */
const DEMO_ATTENTION_SCENARIOS = [
  {
    targetSrNo: 1,
    scenarioTitle: 'Follow-up Pending',
    badgeClass: 'badge-attention-pending',
    reason: 'Initial client follow-up is pending.',
    recommendedAction: 'Contact the client to confirm the current status of the inquiry.',
  },
  {
    targetSrNo: 2,
    scenarioTitle: 'Quotation Pending',
    badgeClass: 'badge-attention-quotation',
    reason: 'A quotation or commercial response is pending.',
    recommendedAction: 'Review the inquiry requirements and prepare or confirm the quotation.',
  },
  {
    targetSrNo: 3,
    scenarioTitle: 'Information Required',
    badgeClass: 'badge-attention-info',
    reason: 'Additional project details or clarification are required.',
    recommendedAction: 'Contact the concern person to obtain the missing information.',
  },
  {
    targetSrNo: 4,
    scenarioTitle: 'Follow-up Overdue',
    badgeClass: 'badge-attention-overdue',
    reason: 'A scheduled follow-up has passed its due date.',
    recommendedAction: 'Contact the client and review the next steps.',
  },
];

export default function AttentionRequiredScreen({
  leads = [],
  isLoading = false,
  onNavigate,
  onViewLead,
}) {
  const sortedLeads = sortLeadsAscending(leads);

  // Pair each of the 4 demonstration scenarios with distinct existing lead records
  const attentionEntries = DEMO_ATTENTION_SCENARIOS.map((scenario, index) => {
    // Try to find the lead with matching targetSrNo or fall back to index-based distinct lead
    const matchedLead =
      sortedLeads.find((l) => Number(l.srNo) === scenario.targetSrNo) ||
      sortedLeads[index] ||
      null;

    return {
      scenario,
      lead: matchedLead,
    };
  }).filter((entry) => entry.lead !== null);

  return (
    <section
      className="screen-view active"
      id="screen-attention-required"
      aria-labelledby="heading-attention-leads"
    >
      {/* Page Header */}
      <header className="content-header">
        <div className="header-titles">
          <div className="attention-header-nav">
            <button
              type="button"
              className="btn-back-link"
              onClick={() => onNavigate?.('dashboard')}
              aria-label="Back to Dashboard Overview"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              <span>Back to Dashboard</span>
            </button>
          </div>
          <h2 className="page-title" id="heading-attention-leads">
            Attention Required
          </h2>
          <p className="page-subtitle">
            Review leads that need follow-up or further action.
          </p>
        </div>
        <div className="header-meta">
          <span className="records-badge attention-badge-count">
            4 Leads Requiring Attention
          </span>
        </div>
      </header>

      {/* Summary Card with Demonstration Notice */}
      <div className="attention-summary-card">
        <div className="attention-summary-left">
          <div className="attention-summary-icon" aria-hidden="true">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
              <line x1="4" y1="22" x2="4" y2="15"></line>
            </svg>
          </div>
          <div className="attention-summary-text">
            <span className="attention-summary-label">
              Total Leads Requiring Attention: 4
            </span>
            <span className="attention-summary-subtext">
              Four priority attention entries displayed below for operational review.
            </span>
          </div>
        </div>

        <div className="attention-demo-notice">
          <div className="attention-demo-notice-header">
            <AlertCircle size={15} aria-hidden="true" />
            <span className="attention-demo-tag">Demonstration Data</span>
          </div>
          <p className="attention-demo-desc">
            Attention reasons and recommended next actions are simulated classifications
            provided for workflow demonstration and are not verified database attributes.
          </p>
        </div>
      </div>

      {/* Attention Entries List */}
      <div className="attention-list-container">
        {isLoading ? (
          <div className="attention-loading-state">
            <p>Loading attention-required records...</p>
          </div>
        ) : (
          <div className="attention-cards-grid">
            {attentionEntries.map(({ scenario, lead }) => (
              <article
                className="attention-lead-card"
                key={lead.id || `lead-${lead.srNo}`}
              >
                <div className="attention-card-header">
                  <div className="attention-card-header-badges">
                    <span className="attention-sr-badge">
                      Sr. No. {lead.srNo}
                    </span>
                    <span className={`badge ${scenario.badgeClass}`}>
                      {scenario.scenarioTitle}
                    </span>
                    <span className="attention-demo-pill">
                      Demonstration Data
                    </span>
                  </div>

                  <button
                    type="button"
                    className="btn-table-view attention-view-btn"
                    onClick={() => onViewLead && onViewLead(lead)}
                    title={`View details for Lead #${lead.srNo}`}
                    aria-label={`View details for Lead #${lead.srNo}`}
                  >
                    <Eye size={14} aria-hidden="true" />
                    <span>View Lead</span>
                  </button>
                </div>

                <div className="attention-card-content">
                  <h3 className="attention-work-name">
                    {lead.nameOfWorkEmplement}
                  </h3>

                  <div className="attention-meta-row">
                    <div className="attention-meta-cell">
                      <span className="attention-meta-label">Client Name</span>
                      <strong className="attention-meta-value">
                        {lead.nameOfClient || '—'}
                      </strong>
                    </div>

                    <div className="attention-meta-cell">
                      <span className="attention-meta-label">Concern Person</span>
                      <span className="attention-meta-value">
                        {normalizeConcernPerson(lead.concernPerson) || 'Not specified'}
                      </span>
                    </div>

                    {lead.location && (
                      <div className="attention-meta-cell">
                        <span className="attention-meta-label">Location</span>
                        <span className="attention-meta-value">
                          {lead.location}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Attention Reason & Recommended Next Action */}
                  <div className="attention-action-boxes">
                    <div className="attention-box attention-box-reason">
                      <div className="attention-box-label">
                        Attention Reason
                      </div>
                      <p className="attention-box-text">
                        {scenario.reason}
                      </p>
                    </div>

                    <div className="attention-box attention-box-action">
                      <div className="attention-box-label">
                        Recommended Next Action
                      </div>
                      <p className="attention-box-text">
                        {scenario.recommendedAction}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
