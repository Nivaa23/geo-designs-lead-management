import React, { useState, useMemo } from 'react';
import {
  PERIOD_OPTIONS,
  getDateBoundaries,
  filterLeadsByDateRange,
  getTrendSeries,
  calculateKPIComparison,
  calculateValueComparison,
  parseCurrencyAmount,
  formatIndianCurrency,
  getRecentLeads,
  isLeadRequiringAttention
} from '../utils/leadUtils';
import {
  SOURCE_OF_INQUIRY_OPTIONS,
  HURDLES_OPTIONS,
  HURDLE_COLOR_MAP,
  normalizeConcernPerson
} from '../data/mockLeads';
import LeadActivityTrendsChart from './LeadActivityTrendsChart';

export default function DashboardOverview({
  leads = [],
  isLoading = false,
  fetchError = null,
  onNavigate,
  onViewLead
}) {
  // Time-period selector state: defaults to 'This Month' or 'All Time'
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');

  // 1. Calculate Date Boundaries and Filter Leads
  const boundaries = useMemo(() => {
    return getDateBoundaries(selectedPeriod);
  }, [selectedPeriod]);

  // Current period leads
  const currentPeriodLeads = useMemo(() => {
    return filterLeadsByDateRange(leads, boundaries.current.start, boundaries.current.end);
  }, [leads, boundaries]);

  // Preceding period leads (for historical comparison)
  const previousPeriodLeads = useMemo(() => {
    if (!boundaries.previous) return [];
    return filterLeadsByDateRange(leads, boundaries.previous.start, boundaries.previous.end);
  }, [leads, boundaries]);

  const isAllTime = selectedPeriod === 'All Time';

  // 2. KPI Metrics Calculation
  // Card 1: Total Leads in selected period
  const totalLeadsCount = currentPeriodLeads.length;
  const prevTotalCount = boundaries.previous ? previousPeriodLeads.length : null;
  const totalLeadsComp = calculateKPIComparison(totalLeadsCount, prevTotalCount, isAllTime);

  // Card 2: New Leads in selected period
  const newLeadsCount = currentPeriodLeads.length;
  const prevNewCount = boundaries.previous ? previousPeriodLeads.length : null;
  const newLeadsComp = calculateKPIComparison(newLeadsCount, prevNewCount, isAllTime);

  // Card 3: Estimated Pipeline Value in selected period
  const currentPipelineValue = currentPeriodLeads.reduce((sum, lead) => {
    return sum + parseCurrencyAmount(lead?.approximateAmount);
  }, 0);
  const previousPipelineValue = boundaries.previous
    ? previousPeriodLeads.reduce((sum, lead) => sum + parseCurrencyAmount(lead?.approximateAmount), 0)
    : null;
  const pipelineValueComp = calculateValueComparison(currentPipelineValue, previousPipelineValue, isAllTime);

  // Card 4: Leads Requiring Attention in selected period
  const leadsRequiringAttention = currentPeriodLeads.filter(isLeadRequiringAttention).length;

  // 3. Trends Line Chart Data
  const trendData = useMemo(() => {
    return getTrendSeries(selectedPeriod, leads);
  }, [selectedPeriod, leads]);

  // 4. Client Distribution Data (scoped to selected period)
  const [showAllClients, setShowAllClients] = useState(false);
  const INITIAL_CLIENTS_LIMIT = 5;

  const clientStats = useMemo(() => {
    const total = currentPeriodLeads.length;
    if (total === 0) {
      return {
        items: [],
        total: 0,
        maxCount: 0,
        uniqueClientsCount: 0
      };
    }

    // Group records by client name, handling leading/trailing whitespace and case differences consistently
    const clientMap = new Map();

    currentPeriodLeads.forEach((lead) => {
      const rawName = typeof lead?.nameOfClient === 'string' ? lead.nameOfClient.trim() : '';
      const displayName = rawName || 'Unspecified Client';
      const key = displayName.toLowerCase();

      if (!clientMap.has(key)) {
        clientMap.set(key, {
          client: displayName,
          count: 0
        });
      }
      const entry = clientMap.get(key);
      entry.count += 1;
    });

    const items = Array.from(clientMap.values()).map((entry) => ({
      client: entry.client,
      count: entry.count,
      percentage: (entry.count / total) * 100
    }));

    // Sort clients by lead count in descending order, then alphabetically by client name
    items.sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return a.client.localeCompare(b.client);
    });

    const maxCount = Math.max(...items.map((i) => i.count), 1);

    return {
      items,
      total,
      maxCount,
      uniqueClientsCount: items.length
    };
  }, [currentPeriodLeads]);

  const displayedClients = showAllClients
    ? clientStats.items
    : clientStats.items.slice(0, INITIAL_CLIENTS_LIMIT);

  // 5. Inquiry Source Distribution Data (scoped to selected period)
  const sourceStats = useMemo(() => {
    const total = currentPeriodLeads.length;
    const items = SOURCE_OF_INQUIRY_OPTIONS.map((source) => {
      const count = currentPeriodLeads.filter((l) => l.sourceOfInquiry === source).length;
      const percentage = total > 0 ? (count / total) * 100 : 0;
      return { source, count, percentage };
    });
    const maxCount = Math.max(...items.map((i) => i.count), 1);
    return {
      items,
      total,
      maxCount
    };
  }, [currentPeriodLeads]);

  // 5. Lead Activity Breakdown Data (Hurdles / Specific Tasks, scoped to selected period)
  const hurdleStats = useMemo(() => {
    const total = currentPeriodLeads.length;
    const items = HURDLES_OPTIONS.map((hurdle) => {
      const count = currentPeriodLeads.filter((l) => l.hurdlesSpecificTask === hurdle).length;
      const percentage = total > 0 ? (count / total) * 100 : 0;
      return {
        hurdle,
        count,
        percentage,
        color: HURDLE_COLOR_MAP[hurdle] || '#4f46e5'
      };
    });
    const maxCount = Math.max(...items.map((i) => i.count), 1);
    return {
      items,
      total,
      maxCount
    };
  }, [currentPeriodLeads]);

  // 6. Recent Leads (5 most recently created records, independent of selected period)
  const recentLeads = useMemo(() => {
    return getRecentLeads(leads, 5);
  }, [leads]);

  return (
    <section className="screen-view screen-dashboard" id="screen-dashboard-overview" aria-labelledby="heading-dashboard">
      {/* Row 1 — Page Header and Time-Period Controls */}
      <header className="content-header dashboard-header">
        <div className="header-titles">
          <h2 className="page-title" id="heading-dashboard">Dashboard Overview</h2>
          <p className="page-subtitle">An overview of recorded business inquiries and lead opportunities.</p>
        </div>

        {/* Compact Time-Period Selector */}
        <div className="header-controls">
          <label htmlFor="dashboard-period-select" className="period-select-label">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span className="period-select-text">Select Time Period:</span>
          </label>
          <div className="select-wrapper">
            <select
              id="dashboard-period-select"
              className="period-select"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              aria-label="Filter dashboard analytics by time period"
            >
              {PERIOD_OPTIONS.map((period) => (
                <option key={period} value={period}>
                  {period}
                </option>
              ))}
            </select>
            <span className="select-chevron" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </span>
          </div>
        </div>
      </header>

      {/* Fetch Error Banner if Supabase query failed */}
      {fetchError && (
        <div className="alert-banner error" id="dashboard-fetch-error" role="alert" style={{ marginBottom: '24px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>Failed to load leads from Supabase database: {fetchError}</span>
        </div>
      )}

      {/* Row 2 — Enhanced 4 KPI Cards */}
      <section className="kpi-cards-grid" aria-label="Key Performance Indicators">
        {/* Card 1 — Total Leads */}
        <div className="kpi-card" id="kpi-card-total-leads">
          <div className="kpi-header">
            <span className="kpi-label">Total Leads</span>
            <div className="kpi-icon-wrap kpi-icon-total" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                <path d="M9 12h6"></path>
                <path d="M9 16h6"></path>
              </svg>
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value" id="kpi-val-total-leads">{totalLeadsCount}</span>
            {totalLeadsComp.badge && (
              <span className={`kpi-badge badge-${totalLeadsComp.type}`} aria-label={totalLeadsComp.text}>
                {totalLeadsComp.badge}
              </span>
            )}
          </div>
          <div className="kpi-supporting">{totalLeadsComp.text}</div>
        </div>

        {/* Card 2 — New Leads */}
        <div className="kpi-card" id="kpi-card-new-leads">
          <div className="kpi-header">
            <span className="kpi-label">New Leads</span>
            <div className="kpi-icon-wrap kpi-icon-active" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value" id="kpi-val-new-leads">{newLeadsCount}</span>
            {newLeadsComp.badge && (
              <span className={`kpi-badge badge-${newLeadsComp.type}`} aria-label={newLeadsComp.text}>
                {newLeadsComp.badge}
              </span>
            )}
          </div>
          <div className="kpi-supporting">{newLeadsComp.text}</div>
        </div>

        {/* Card 3 — Estimated Pipeline Value */}
        <div className="kpi-card" id="kpi-card-pipeline-value">
          <div className="kpi-header">
            <span className="kpi-label">Estimated Pipeline Value</span>
            <div className="kpi-icon-wrap kpi-icon-pipeline" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="6" y1="4" x2="18" y2="4"></line>
                <line x1="6" y1="9" x2="18" y2="9"></line>
                <path d="M6 4h6a4 4 0 0 1 4 4c0 2.2-1.8 4-4 4H6"></path>
                <line x1="9" y1="12" x2="17" y2="20"></line>
              </svg>
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value" id="kpi-val-pipeline-value">{formatIndianCurrency(currentPipelineValue)}</span>
            {pipelineValueComp.badge && (
              <span className={`kpi-badge badge-${pipelineValueComp.type}`} aria-label={pipelineValueComp.text}>
                {pipelineValueComp.badge}
              </span>
            )}
          </div>
          <div className="kpi-supporting">{pipelineValueComp.text}</div>
        </div>

        {/* Card 4 — Leads Requiring Attention */}
        <div
          className="kpi-card kpi-card-clickable"
          id="kpi-card-attention-leads"
          onClick={() => onNavigate?.('attention')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onNavigate?.('attention');
            }
          }}
          aria-label="Leads Requiring Attention: 4. Click to view Attention Required leads."
          title="Click to view Leads Requiring Attention"
        >
          <div className="kpi-header">
            <span className="kpi-label">Leads Requiring Attention</span>
            <div className="kpi-icon-wrap kpi-icon-attention" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                <line x1="4" y1="22" x2="4" y2="15"></line>
              </svg>
            </div>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-value" id="kpi-val-attention-leads">4</span>
            <span className="kpi-badge badge-attention">Action needed</span>
          </div>
          <div className="kpi-supporting">Follow-up required</div>
        </div>
      </section>

      {/* Row 3 — Client Distribution & Inquiry Source Distribution */}
      <div className="dashboard-grid-row-4">
        {/* Card 3A: Client Distribution */}
        <section className="dashboard-card" id="section-client-distribution" aria-labelledby="heading-client-distribution">
          <div className="dashboard-card-header">
            <div>
              <h3 className="dashboard-card-title" id="heading-client-distribution">Client Distribution</h3>
              <p className="dashboard-card-subtitle">Understand how recorded leads are distributed across clients.</p>
            </div>
            <div className="dashboard-card-meta">
              <span className="records-badge">{clientStats.uniqueClientsCount} {clientStats.uniqueClientsCount === 1 ? 'Client' : 'Clients'}</span>
            </div>
          </div>
          <div className="dashboard-card-body">
            {clientStats.total === 0 ? (
              <div className="dashboard-empty-state" id="empty-client-distribution" style={{ padding: '36px 16px' }}>
                <p className="empty-state-text">No recorded leads for the selected period.</p>
              </div>
            ) : (
              <div className="client-distribution-list" id="client-distribution-list">
                {displayedClients.map((item) => {
                  const barFillWidth = clientStats.maxCount > 0
                    ? (item.count / clientStats.maxCount) * 100
                    : 0;

                  return (
                    <div key={item.client} className="client-distribution-item">
                      <div className="client-header">
                        <span className="client-name" title={item.client}>{item.client}</span>
                        <div className="client-meta">
                          <span className="client-count">{item.count} {item.count === 1 ? 'lead' : 'leads'}</span>
                          <span className="client-pct">({item.percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                      <div
                        className="client-bar-track"
                        role="progressbar"
                        aria-valuenow={item.percentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${item.client}: ${item.count} ${item.count === 1 ? 'lead' : 'leads'} (${item.percentage.toFixed(1)}%)`}
                      >
                        <div
                          className="client-bar-fill"
                          style={{ width: `${barFillWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })}

                {clientStats.items.length > INITIAL_CLIENTS_LIMIT && (
                  <div className="client-toggle-wrapper">
                    <button
                      type="button"
                      className="btn-client-toggle"
                      onClick={() => setShowAllClients((prev) => !prev)}
                      aria-expanded={showAllClients}
                    >
                      {showAllClients
                        ? 'Show fewer clients'
                        : `Show all ${clientStats.items.length} clients (+${clientStats.items.length - INITIAL_CLIENTS_LIMIT} more)`}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Card 3B: Inquiry Source Distribution */}
        <section className="dashboard-card" id="section-source-distribution" aria-labelledby="heading-source-distribution">
          <div className="dashboard-card-header">
            <div>
              <h3 className="dashboard-card-title" id="heading-source-distribution">Inquiry Source Distribution</h3>
              <p className="dashboard-card-subtitle">Breakdown of recorded leads by inquiry source.</p>
            </div>
            <div className="dashboard-card-meta">
              <span className="records-badge">{sourceStats.total} {sourceStats.total === 1 ? 'Lead' : 'Leads'}</span>
            </div>
          </div>
          <div className="dashboard-card-body">
            <div className="source-distribution-list" id="source-distribution-list">
              {sourceStats.items.map((item) => {
                const barFillWidth = sourceStats.maxCount > 0
                  ? (item.count / sourceStats.maxCount) * 100
                  : 0;

                return (
                  <div key={item.source} className="source-distribution-item">
                    <div className="source-header">
                      <span className="source-name">{item.source}</span>
                      <div className="source-meta">
                        <span className="source-count">{item.count} {item.count === 1 ? 'lead' : 'leads'}</span>
                        <span className="source-pct">({item.percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                    <div
                      className="source-bar-track"
                      role="progressbar"
                      aria-valuenow={item.percentage}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${item.source}: ${item.count} leads (${item.percentage.toFixed(1)}%)`}
                    >
                      <div
                        className="source-bar-fill"
                        style={{ width: `${barFillWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* Row 4 — Two-Column Analytics Row: Lead Activity Trends & Lead Activity Breakdown */}
      <div className="dashboard-grid-analytics">
        {/* Card 4A: Lead Activity Trends Line Chart */}
        <section className="dashboard-card section-trends" id="section-activity-trends" aria-labelledby="heading-activity-trends">
          <div className="dashboard-card-header">
            <div>
              <h3 className="dashboard-card-title" id="heading-activity-trends">Lead Activity Trends</h3>
              <p className="dashboard-card-subtitle">Track how business inquiries are recorded over time.</p>
            </div>
            <div className="dashboard-card-meta">
              <span className="records-badge period-badge">{selectedPeriod}</span>
            </div>
          </div>
          <div className="dashboard-card-body">
            <LeadActivityTrendsChart trendData={trendData} period={selectedPeriod} />
          </div>
        </section>

        {/* Card 4B: Lead Activity Breakdown (Hurdles / Specific Tasks) */}
        <section className="dashboard-card" id="section-activity-breakdown" aria-labelledby="heading-activity-breakdown">
          <div className="dashboard-card-header">
            <div>
              <h3 className="dashboard-card-title" id="heading-activity-breakdown">Lead Activity Breakdown</h3>
              <p className="dashboard-card-subtitle">Distribution of recorded hurdles and specific tasks.</p>
            </div>
            <div className="dashboard-card-meta">
              <span className="records-badge">{hurdleStats.total} {hurdleStats.total === 1 ? 'Record' : 'Records'}</span>
            </div>
          </div>
          <div className="dashboard-card-body">
            <div className="hurdle-distribution-list" id="hurdle-distribution-list">
              {hurdleStats.items.map((item) => {
                const barFillWidth = hurdleStats.maxCount > 0
                  ? (item.count / hurdleStats.maxCount) * 100
                  : 0;

                return (
                  <div key={item.hurdle} className="hurdle-distribution-item">
                    <div className="hurdle-header">
                      <div className="hurdle-title-group">
                        <span className="hurdle-color-pip" style={{ backgroundColor: item.color }} aria-hidden="true"></span>
                        <span className="hurdle-name">{item.hurdle}</span>
                      </div>
                      <div className="hurdle-meta">
                        <span className="hurdle-count">{item.count}</span>
                        <span className="hurdle-pct">({item.percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                    <div
                      className="hurdle-bar-track"
                      role="progressbar"
                      aria-valuenow={item.percentage}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${item.hurdle}: ${item.count} (${item.percentage.toFixed(1)}%)`}
                    >
                      <div
                        className="hurdle-bar-fill"
                        style={{
                          width: `${barFillWidth}%`,
                          backgroundColor: item.color
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="hurdle-card-footnote">
              Reflects primary hurdle / specific task selections recorded on inquiries.
            </div>
          </div>
        </section>
      </div>

      {/* Row 5 — Recent Leads (Full-width row immediately below two-column analytics row) */}
      <section className="dashboard-card recent-leads-card full-width" id="section-recent-leads" aria-labelledby="heading-recent-leads">
        {/* Card Area 1: Card Header */}
        <div className="recent-leads-card-header">
          <div>
            <h3 className="dashboard-card-title" id="heading-recent-leads">Recent Leads</h3>
            <p className="dashboard-card-subtitle">The latest recorded business inquiries.</p>
          </div>
        </div>

          {/* Card Area 2: Table Container with Inset Padding */}
          <div className="recent-leads-table-container">
            {isLoading && leads.length === 0 ? (
              <div className="dashboard-empty-state" id="loading-recent-leads">
                <p className="empty-state-text">Loading recorded leads from database...</p>
              </div>
            ) : recentLeads.length === 0 ? (
              <div className="dashboard-empty-state" id="empty-recent-leads">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="empty-state-icon">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="12" y1="18" x2="12" y2="12"></line>
                  <line x1="9" y1="15" x2="15" y2="15"></line>
                </svg>
                <p className="empty-state-text">No leads recorded yet.</p>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  id="btn-empty-add-lead"
                  onClick={() => onNavigate('add')}
                >
                  Add New Lead
                </button>
              </div>
            ) : (
              <div className="table-wrapper recent-leads-table-wrapper" tabIndex={0} role="region" aria-label="Recent Leads Table">
                <table className="leads-table recent-leads-table" id="recent-leads-table">
                  <thead>
                    <tr>
                      <th scope="col" style={{ width: '65px' }}>Sr. No.</th>
                      <th scope="col" style={{ minWidth: '180px' }}>Name of Work Emplement</th>
                      <th scope="col" style={{ minWidth: '150px' }}>Name of Client</th>
                      <th scope="col" style={{ minWidth: '120px' }}>Location</th>
                      <th scope="col" style={{ minWidth: '140px' }}>Concern Person</th>
                      <th scope="col" style={{ minWidth: '120px' }}>Approximate Amount</th>
                      <th scope="col" style={{ minWidth: '130px' }}>Source of Inquiry</th>
                      <th scope="col" style={{ width: '75px', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLeads.map((lead) => (
                      <tr
                        key={lead.id}
                        className="table-row-clickable"
                        onClick={() => onViewLead(lead)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onViewLead(lead);
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label={`View details for Lead #${lead.srNo}`}
                      >
                        <td className="sr-no-cell">{lead.srNo}</td>
                        <td><strong>{lead.nameOfWorkEmplement}</strong></td>
                        <td>{lead.nameOfClient}</td>
                        <td>{lead.location}</td>
                        <td>{normalizeConcernPerson(lead.concernPerson)}</td>
                        <td className="amount-cell">{lead.approximateAmount}</td>
                        <td>
                          <span className="badge badge-source">{lead.sourceOfInquiry}</span>
                        </td>
                        <td
                          className="actions-cell"
                          style={{ textAlign: 'center' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            className="btn-table-view"
                            id={`btn-view-lead-${lead.srNo}`}
                            title={`View Lead #${lead.srNo}`}
                            aria-label={`View Lead #${lead.srNo}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewLead(lead);
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Card Area 3: Footer Aligned with Padding */}
          <div className="recent-leads-footer">
            <button
              type="button"
              className="btn-link-view-all"
              id="btn-view-all-leads"
              onClick={() => onNavigate('view')}
            >
              <span>View All Leads</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </section>
    </section>
  );
}
