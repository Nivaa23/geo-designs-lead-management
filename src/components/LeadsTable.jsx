import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Eye, Search, X, Filter, Check } from 'lucide-react';
import { sortLeadsAscending } from '../utils/leadUtils';
import { normalizeConcernPerson } from '../data/mockLeads';

const ITEMS_PER_PAGE = 10;

const FILTERABLE_COLUMNS = {
  concernPerson: {
    label: 'Concern Person',
    getValue: (lead) => lead.allottedTo || normalizeConcernPerson(lead.concernPerson) || '(Blank)'
  },
  sourceOfInquiry: {
    label: 'Source of Inquiry',
    getValue: (lead) => lead.sourceOfInquiry || '(Blank)'
  },
  hurdlesSpecificTask: {
    label: 'Hurdles / Specific Task',
    getValue: (lead) => lead.hurdlesSpecificTask || '(Blank)'
  }
};

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
  const [globalSearch, setGlobalSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    concernPerson: null,
    sourceOfInquiry: null,
    hurdlesSpecificTask: null
  });

  // Excel-style dropdown state
  const [openDropdown, setOpenDropdown] = useState(null); // 'concernPerson' | 'sourceOfInquiry' | 'hurdlesSpecificTask' | null
  const [dropdownCoords, setDropdownCoords] = useState({ top: 0, left: 0 });
  const [tempSelected, setTempSelected] = useState([]);
  const [dropdownSearch, setDropdownSearch] = useState('');

  const buttonRefs = useRef({});
  const dropdownRef = useRef(null);

  // Always sort records in ascending numerical order of Sr. No. before filtering/pagination
  const sortedLeads = useMemo(() => sortLeadsAscending(leads), [leads]);

  // Derive distinct options for the three filterable columns dynamically from all lead records
  const distinctOptions = useMemo(() => {
    const result = {};
    for (const [colKey, config] of Object.entries(FILTERABLE_COLUMNS)) {
      const set = new Set();
      leads.forEach((lead) => {
        const val = config.getValue(lead);
        if (val) set.add(val);
      });
      result[colKey] = Array.from(set).sort((a, b) => a.localeCompare(b));
    }
    return result;
  }, [leads]);

  // Combined filtering logic: Global Search + Excel Column Filters
  const filteredLeads = useMemo(() => {
    const query = globalSearch.toLowerCase().trim();

    return sortedLeads.filter((lead) => {
      // 1. Global search across all fields
      if (query) {
        const searchableFields = [
          lead.srNo,
          lead.tenderId,
          lead.nameOfWorkEmplement,
          lead.nameOfClient,
          lead.location,
          lead.clientContact,
          lead.clientConcernedPersonExternal,
          lead.clientConcernPersonDesignationExternal,
          lead.concernPerson,
          normalizeConcernPerson(lead.concernPerson),
          lead.contactDetails,
          lead.designationOfConcernPerson,
          lead.sourceOfInquiry,
          lead.referenceBy,
          lead.allottedTo,
          normalizeConcernPerson(lead.allottedTo),
          lead.durationOfWork,
          lead.hurdlesSpecificTask,
          lead.approximateAmount,
          lead.remarks
        ];

        const matchesQuery = searchableFields.some((field) => {
          if (field === null || field === undefined) return false;
          return String(field).toLowerCase().includes(query);
        });

        if (!matchesQuery) return false;
      }

      // 2. Active column filters (AND across columns; OR within selected values of a column)
      for (const [colKey, config] of Object.entries(FILTERABLE_COLUMNS)) {
        const selectedValues = activeFilters[colKey];
        if (selectedValues && Array.isArray(selectedValues)) {
          const leadVal = config.getValue(lead);
          if (!selectedValues.includes(leadVal)) {
            return false;
          }
        }
      }

      return true;
    });
  }, [sortedLeads, globalSearch, activeFilters]);

  const totalCount = filteredLeads.length;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE) || 1;

  // Ensure current page remains valid when filtered results change
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
  const paginatedLeads = filteredLeads.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Pagination controls appear strictly when more than 10 filtered leads exist
  const showPagination = totalCount > ITEMS_PER_PAGE;

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  // Toggle dropdown and position it relative to the column header button
  const handleToggleDropdown = (colKey, e) => {
    e.stopPropagation();
    if (openDropdown === colKey) {
      setOpenDropdown(null);
      return;
    }

    const buttonEl = buttonRefs.current[colKey];
    if (buttonEl) {
      const rect = buttonEl.getBoundingClientRect();
      const dropdownWidth = 270;
      let left = rect.left;
      if (left + dropdownWidth > window.innerWidth - 16) {
        left = window.innerWidth - dropdownWidth - 16;
      }
      if (left < 16) left = 16;

      setDropdownCoords({
        top: rect.bottom + 6,
        left
      });
    }

    const allColOptions = distinctOptions[colKey] || [];
    // Initialize temporary selection with currently active filters or all options (Excel default)
    if (activeFilters[colKey] && Array.isArray(activeFilters[colKey])) {
      setTempSelected([...activeFilters[colKey]]);
    } else {
      setTempSelected([...allColOptions]);
    }

    setDropdownSearch('');
    setOpenDropdown(colKey);
  };

  // Close dropdown on outside click or Escape key, and keep position synchronized on scroll/resize
  useEffect(() => {
    if (!openDropdown) return;

    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !buttonRefs.current[openDropdown]?.contains(e.target)
      ) {
        setOpenDropdown(null);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpenDropdown(null);
      }
    };

    const updatePosition = () => {
      const buttonEl = buttonRefs.current[openDropdown];
      if (buttonEl) {
        const rect = buttonEl.getBoundingClientRect();
        const dropdownWidth = 270;
        let left = rect.left;
        if (left + dropdownWidth > window.innerWidth - 16) {
          left = window.innerWidth - dropdownWidth - 16;
        }
        if (left < 16) left = 16;
        setDropdownCoords({
          top: rect.bottom + 6,
          left
        });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [openDropdown]);

  // Checklist options for the currently open dropdown
  const currentColOptions = openDropdown ? distinctOptions[openDropdown] || [] : [];
  const visibleOptions = currentColOptions.filter((opt) =>
    opt.toLowerCase().includes(dropdownSearch.toLowerCase().trim())
  );

  const areAllVisibleSelected =
    visibleOptions.length > 0 &&
    visibleOptions.every((opt) => tempSelected.includes(opt));

  const areSomeVisibleSelected =
    visibleOptions.some((opt) => tempSelected.includes(opt)) &&
    !areAllVisibleSelected;

  const handleToggleSelectAll = () => {
    if (areAllVisibleSelected) {
      setTempSelected((prev) => prev.filter((val) => !visibleOptions.includes(val)));
    } else {
      setTempSelected((prev) => {
        const set = new Set([...prev, ...visibleOptions]);
        return Array.from(set);
      });
    }
  };

  const handleToggleOption = (val) => {
    setTempSelected((prev) => {
      if (prev.includes(val)) {
        return prev.filter((item) => item !== val);
      } else {
        return [...prev, val];
      }
    });
  };

  // Apply button commits the checklist selection to activeFilters
  const handleApplyFilter = () => {
    if (!openDropdown) return;
    const colKey = openDropdown;
    const allColOptions = distinctOptions[colKey] || [];

    // If all distinct options are selected, it's equivalent to no active filter
    if (
      tempSelected.length === allColOptions.length &&
      allColOptions.every((opt) => tempSelected.includes(opt))
    ) {
      setActiveFilters((prev) => ({ ...prev, [colKey]: null }));
    } else {
      setActiveFilters((prev) => ({ ...prev, [colKey]: [...tempSelected] }));
    }

    setOpenDropdown(null);
    setCurrentPage(1);
  };

  // Clear Filter removes the active filter for the specific column
  const handleClearColumnFilter = (colKeyToClear) => {
    const targetCol = colKeyToClear || openDropdown;
    if (!targetCol) return;

    setActiveFilters((prev) => ({ ...prev, [targetCol]: null }));
    setOpenDropdown(null);
    setCurrentPage(1);
  };

  const handleClearAllFilters = () => {
    setGlobalSearch('');
    setActiveFilters({
      concernPerson: null,
      sourceOfInquiry: null,
      hurdlesSpecificTask: null
    });
    setOpenDropdown(null);
    setCurrentPage(1);
  };

  return (
    <section className="screen-view active" id="screen-view-leads" aria-labelledby="heading-view-leads">
      <header className="content-header">
        <div className="header-titles">
          <h2 className="page-title" id="heading-view-leads">View Previous Leads</h2>
          <p className="page-subtitle">Review previously recorded business inquiries.</p>
        </div>
        <div className="header-meta">
          {/* Global Search Bar */}
          <div className="table-search-container" id="global-search-container">
            <Search size={15} className="table-search-icon" aria-hidden="true" />
            <input
              type="text"
              id="global-leads-search"
              className="table-search-input"
              placeholder="Search leads..."
              value={globalSearch}
              onChange={(e) => {
                setGlobalSearch(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Search leads across all fields"
            />
            {globalSearch && (
              <button
                type="button"
                className="table-search-clear-btn"
                id="btn-clear-global-search"
                onClick={() => {
                  setGlobalSearch('');
                  setCurrentPage(1);
                }}
                title="Clear search query"
                aria-label="Clear search query"
              >
                <X size={14} aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Record Count Badge */}
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
                <th scope="col" style={{ minWidth: '190px' }}>Name of Client</th>
                <th scope="col" style={{ minWidth: '150px' }}>Location</th>

                {/* Filterable Column 1: Concern Person */}
                <th scope="col" style={{ minWidth: '200px' }} className="th-filterable">
                  <div className="th-content-filterable">
                    <span>Concern Person</span>
                    <button
                      type="button"
                      ref={(el) => (buttonRefs.current['concernPerson'] = el)}
                      id="filter-btn-concernPerson"
                      className={`btn-column-filter ${activeFilters.concernPerson ? 'active' : ''}`}
                      onClick={(e) => handleToggleDropdown('concernPerson', e)}
                      title={activeFilters.concernPerson ? 'Filter active — Click to modify' : 'Filter by Concern Person'}
                      aria-label="Filter by Concern Person"
                      aria-expanded={openDropdown === 'concernPerson'}
                    >
                      <Filter size={13} aria-hidden="true" />
                      {activeFilters.concernPerson && <span className="filter-active-indicator" aria-hidden="true" />}
                    </button>
                  </div>
                </th>

                <th scope="col" style={{ minWidth: '170px' }}>Contact Details</th>
                <th scope="col" style={{ minWidth: '170px' }}>Designation of Concern Person</th>

                {/* Filterable Column 2: Source of Inquiry */}
                <th scope="col" style={{ minWidth: '170px' }} className="th-filterable">
                  <div className="th-content-filterable">
                    <span>Source of Inquiry</span>
                    <button
                      type="button"
                      ref={(el) => (buttonRefs.current['sourceOfInquiry'] = el)}
                      id="filter-btn-sourceOfInquiry"
                      className={`btn-column-filter ${activeFilters.sourceOfInquiry ? 'active' : ''}`}
                      onClick={(e) => handleToggleDropdown('sourceOfInquiry', e)}
                      title={activeFilters.sourceOfInquiry ? 'Filter active — Click to modify' : 'Filter by Source of Inquiry'}
                      aria-label="Filter by Source of Inquiry"
                      aria-expanded={openDropdown === 'sourceOfInquiry'}
                    >
                      <Filter size={13} aria-hidden="true" />
                      {activeFilters.sourceOfInquiry && <span className="filter-active-indicator" aria-hidden="true" />}
                    </button>
                  </div>
                </th>

                <th scope="col" style={{ minWidth: '190px' }}>Duration of work confirmation / allotment</th>

                {/* Filterable Column 3: Hurdles / Specific Task */}
                <th scope="col" style={{ minWidth: '170px' }} className="th-filterable">
                  <div className="th-content-filterable">
                    <span>Hurdles / specific task</span>
                    <button
                      type="button"
                      ref={(el) => (buttonRefs.current['hurdlesSpecificTask'] = el)}
                      id="filter-btn-hurdlesSpecificTask"
                      className={`btn-column-filter ${activeFilters.hurdlesSpecificTask ? 'active' : ''}`}
                      onClick={(e) => handleToggleDropdown('hurdlesSpecificTask', e)}
                      title={activeFilters.hurdlesSpecificTask ? 'Filter active — Click to modify' : 'Filter by Hurdles / Specific Task'}
                      aria-label="Filter by Hurdles / Specific Task"
                      aria-expanded={openDropdown === 'hurdlesSpecificTask'}
                    >
                      <Filter size={13} aria-hidden="true" />
                      {activeFilters.hurdlesSpecificTask && <span className="filter-active-indicator" aria-hidden="true" />}
                    </button>
                  </div>
                </th>

                <th scope="col" style={{ minWidth: '150px' }}>Approximate amount</th>
                <th scope="col" style={{ minWidth: '220px' }}>Remarks</th>
                <th scope="col" style={{ minWidth: '110px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody id="leads-table-body">
              {isLoading ? (
                <tr className="empty-table-row">
                  <td colSpan={14} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Loading previous leads from database...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr className="empty-table-row">
                  <td colSpan={14}>No lead records found. Use the Add New Lead form to create one.</td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr className="empty-table-row">
                  <td colSpan={14} style={{ padding: '44px 24px', textAlign: 'center' }}>
                    <div className="empty-filtered-container">
                      <Filter size={28} className="empty-filtered-icon" aria-hidden="true" />
                      <p className="empty-filtered-title">No matching leads found</p>
                      <p className="empty-filtered-text">
                        No records match your active search or filter criteria. Try adjusting or clearing your filters.
                      </p>
                      <button
                        type="button"
                        className="btn-clear-all-filters"
                        id="btn-clear-all-filters"
                        onClick={handleClearAllFilters}
                      >
                        Clear All Search &amp; Filters
                      </button>
                    </div>
                  </td>
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
                    <td>{lead.nameOfClient}</td>
                    <td>{lead.location}</td>
                    <td>{lead.allottedTo || normalizeConcernPerson(lead.concernPerson) || '—'}</td>
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

      {/* Excel-Style Floating Filter Dropdown */}
      {openDropdown && (
        <div
          ref={dropdownRef}
          className="excel-filter-dropdown"
          id={`excel-dropdown-${openDropdown}`}
          style={{
            top: `${dropdownCoords.top}px`,
            left: `${dropdownCoords.left}px`
          }}
          role="dialog"
          aria-label={`Filter options for ${FILTERABLE_COLUMNS[openDropdown]?.label}`}
        >
          <div className="excel-filter-header">
            <span className="excel-filter-title">
              Filter: {FILTERABLE_COLUMNS[openDropdown]?.label}
            </span>
            <button
              type="button"
              className="excel-filter-close"
              onClick={() => setOpenDropdown(null)}
              title="Close filter menu"
              aria-label="Close filter menu"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>

          {/* Internal search input to narrow checklist items */}
          <div className="excel-filter-search">
            <Search size={13} className="excel-filter-search-icon" aria-hidden="true" />
            <input
              type="text"
              className="excel-filter-search-input"
              placeholder="Search values..."
              value={dropdownSearch}
              onChange={(e) => setDropdownSearch(e.target.value)}
              aria-label="Search filter values"
              autoFocus
            />
          </div>

          {/* Checklist of distinct values */}
          <div className="excel-filter-list">
            <label className="excel-filter-item excel-filter-select-all">
              <input
                type="checkbox"
                checked={areAllVisibleSelected}
                ref={(el) => {
                  if (el) el.indeterminate = areSomeVisibleSelected;
                }}
                onChange={handleToggleSelectAll}
              />
              <span>(Select All{visibleOptions.length !== currentColOptions.length ? ' Search Results' : ''})</span>
            </label>

            {visibleOptions.length === 0 ? (
              <div className="excel-filter-no-results">
                No matching values
              </div>
            ) : (
              visibleOptions.map((opt) => {
                const isChecked = tempSelected.includes(opt);
                return (
                  <label key={opt} className="excel-filter-item">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleOption(opt)}
                    />
                    <span className="excel-filter-label">{opt}</span>
                  </label>
                );
              })
            )}
          </div>

          {/* Footer Actions: Clear and Apply */}
          <div className="excel-filter-footer">
            <button
              type="button"
              className="btn-excel-clear"
              id="btn-excel-clear-filter"
              onClick={() => handleClearColumnFilter(openDropdown)}
            >
              Clear Filter
            </button>
            <button
              type="button"
              className="btn-excel-apply"
              id="btn-excel-apply-filter"
              onClick={handleApplyFilter}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
