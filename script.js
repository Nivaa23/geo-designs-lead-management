/**
 * Geo Designs & Research — Lead Management System
 * Vanilla JavaScript Implementation with CRUD Operations & LocalStorage Persistence
 */

document.addEventListener('DOMContentLoaded', () => {
  // Storage Keys
  const STORAGE_KEY = 'gdr_lead_records_v1';
  const MAX_SR_KEY = 'gdr_max_sr_no_v1';

  // Mapping between Concern Person and Designation
  const PERSON_DESIGNATION_MAP = {
    'Vishal Shah - COO': 'COO',
    'Jatin Bansal - Admin': 'Admin',
    'Satyanarayan Choudhary - GM (Architecture)': 'GM (Architecture)'
  };

  // Initial Mock Dataset (at least 8 realistic engineering / surveying / research records)
  const INITIAL_MOCK_RECORDS = [
    {
      id: 'lead-init-1',
      srNo: 1,
      nameOfWorkEmplement: 'Topographical Survey & Digital Terrain Modeling for Sabarmati Riverfront Phase 3',
      scopeOfWork: 'High-precision DGPS boundary traverse, contour mapping at 0.5m intervals, riverbed bathymetry',
      nameOfClient: 'Ahmedabad Urban Development Authority (AUDA)',
      location: 'Ahmedabad, Gujarat',
      concernPerson: 'Satyanarayan Choudhary - GM (Architecture)',
      contactDetails: '+91 98791 22340 / tenders@auda.org.in',
      designationOfConcernPerson: 'GM (Architecture)',
      sourceOfInquiry: 'Tenders',
      durationOfWork: '30 working days',
      hurdlesSpecificTask: 'Visit',
      approximateAmount: '₹ 18,50,000',
      remarks: 'Joint site reconnaissance completed; benchmark pillar points finalized.'
    },
    {
      id: 'lead-init-2',
      srNo: 2,
      nameOfWorkEmplement: 'Geotechnical Soil Investigation & Core Drilling for Metro Viaduct Pier Foundations',
      scopeOfWork: '12 exploratory boreholes up to 35m depth, SPT tests, laboratory triaxial & chemical testing',
      nameOfClient: 'Gujarat Metro Rail Corporation (GMRC)',
      location: 'Surat, Gujarat',
      concernPerson: 'Vishal Shah - COO',
      contactDetails: '+91 98250 88712 / gmrc.civil@gujaratmetro.com',
      designationOfConcernPerson: 'COO',
      sourceOfInquiry: 'GEM / Website',
      durationOfWork: '45 working days',
      hurdlesSpecificTask: 'Quotation',
      approximateAmount: '₹ 32,40,000',
      remarks: 'Revised BoQ submitted following geotechnical advisor review.'
    },
    {
      id: 'lead-init-3',
      srNo: 3,
      nameOfWorkEmplement: 'Architectural Heritage Documentation & Laser Scanning of Mandvi Old Port Structures',
      scopeOfWork: '3D terrestrial LiDAR scanning, 2D measured elevations, conservation structural audit',
      nameOfClient: 'Gujarat Maritime Board (GMB)',
      location: 'Kutch / Mandvi, Gujarat',
      concernPerson: 'Satyanarayan Choudhary - GM (Architecture)',
      contactDetails: '+91 94260 55189 / heritage.gmb@gov.in',
      designationOfConcernPerson: 'GM (Architecture)',
      sourceOfInquiry: 'Mails',
      durationOfWork: '3 weeks',
      hurdlesSpecificTask: 'Presentation',
      approximateAmount: '₹ 14,80,000',
      remarks: 'Preliminary presentation to the Heritage Advisory Committee scheduled next Tuesday.'
    },
    {
      id: 'lead-init-4',
      srNo: 4,
      nameOfWorkEmplement: 'Hydrographic & Bathymetric Survey for Coastal Desalination Intake Pipeline',
      scopeOfWork: 'Dual-frequency echo sounder bathymetry, side scan sonar, tidal observations for 2.5km offshore',
      nameOfClient: 'Adani Ports & Special Economic Zone Ltd',
      location: 'Mundra, Gujarat',
      concernPerson: 'Vishal Shah - COO',
      contactDetails: '+91 99099 44321 / infra.procure@adani.com',
      designationOfConcernPerson: 'COO',
      sourceOfInquiry: 'Verbal Inquiries',
      durationOfWork: '20 days',
      hurdlesSpecificTask: 'Special Efforts',
      approximateAmount: '₹ 22,00,000',
      remarks: 'Port security clearance and marine vessel permission under verification.'
    },
    {
      id: 'lead-init-5',
      srNo: 5,
      nameOfWorkEmplement: 'Annual Rate Contract for Office Facility Logistics & Field Survey Equipment Maintenance',
      scopeOfWork: 'Routine calibration of Total Stations, GNSS receivers, and administrative survey log supplies',
      nameOfClient: 'Sardar Sarovar Narmada Nigam Ltd (SSNNL)',
      location: 'Vadodara, Gujarat',
      concernPerson: 'Jatin Bansal - Admin',
      contactDetails: '+91 97129 33451 / admin@ssnnl.com',
      designationOfConcernPerson: 'Admin',
      sourceOfInquiry: 'Online Quotations',
      durationOfWork: '12 months annual contract',
      hurdlesSpecificTask: 'Quotation',
      approximateAmount: '₹ 8,90,000',
      remarks: 'Vendor compliance documents submitted on government portal.'
    },
    {
      id: 'lead-init-6',
      srNo: 6,
      nameOfWorkEmplement: 'Drone Photogrammetry & Corridor Survey for 4-Lane Greenfield Highway Alignment',
      scopeOfWork: 'UAV orthophoto generation, 5cm ground resolution DEM, cadastral map overlay for 68 km stretch',
      nameOfClient: 'National Highways Authority of India (NHAI)',
      location: 'Godhra - Dahod, Gujarat',
      concernPerson: 'Vishal Shah - COO',
      contactDetails: '+91 98980 11993 / ro.gujarat@nhai.org',
      designationOfConcernPerson: 'COO',
      sourceOfInquiry: 'Tenders',
      durationOfWork: '60 days',
      hurdlesSpecificTask: 'Commitment',
      approximateAmount: '₹ 41,50,000',
      remarks: 'Technical bid qualified; financial bid opening scheduled.'
    },
    {
      id: 'lead-init-7',
      srNo: 7,
      nameOfWorkEmplement: 'Structural Health Monitoring & Non-Destructive Testing of Cable-Stayed Bridge',
      scopeOfWork: 'Ultrasonic pulse velocity, rebound hammer testing, core extraction, vibration analysis',
      nameOfClient: 'Roads & Buildings Department, Govt. of Gujarat',
      location: 'Bharuch, Gujarat',
      concernPerson: 'Satyanarayan Choudhary - GM (Architecture)',
      contactDetails: '+91 94270 88204 / ee.bridge.rnb@gujarat.gov.in',
      designationOfConcernPerson: 'GM (Architecture)',
      sourceOfInquiry: 'Mails',
      durationOfWork: '4 weeks',
      hurdlesSpecificTask: 'Visit',
      approximateAmount: '₹ 16,75,000',
      remarks: 'Preliminary visual inspection completed; traffic diversion slot requested.'
    },
    {
      id: 'lead-init-8',
      srNo: 8,
      nameOfWorkEmplement: 'Master Planning & Utility Geospatial Survey for Dahej SEZ Expansion Zone-B',
      scopeOfWork: 'Underground utility detection via GPR, storm-water drainage gradient profiling, GIS database',
      nameOfClient: 'Gujarat Industrial Development Corporation (GIDC)',
      location: 'Dahej / Bharuch, Gujarat',
      concernPerson: 'Jatin Bansal - Admin',
      contactDetails: '+91 98241 77650 / dahej.office@gidc.gov.in',
      designationOfConcernPerson: 'Admin',
      sourceOfInquiry: 'GEM / Website',
      durationOfWork: '35 working days',
      hurdlesSpecificTask: 'Commitment',
      approximateAmount: '₹ 27,00,000',
      remarks: 'Administrative sanction received; awaiting work order issuance.'
    }
  ];

  // Initialize Data Store from LocalStorage
  let leadsData = [];
  function loadStoredData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        leadsData = JSON.parse(stored);
      } else {
        // First load: seed with mock records and set initial max Sr No
        leadsData = [...INITIAL_MOCK_RECORDS];
        saveStoredData();
        localStorage.setItem(MAX_SR_KEY, '8');
      }
    } catch (e) {
      console.warn('LocalStorage unavailable or corrupted, fallback to memory', e);
      leadsData = [...INITIAL_MOCK_RECORDS];
    }
  }

  function saveStoredData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leadsData));
    } catch (e) {
      console.warn('Unable to persist to LocalStorage', e);
    }
  }

  function updateMaxSrNo(srNo) {
    try {
      const currentMax = parseInt(localStorage.getItem(MAX_SR_KEY), 10) || 0;
      if (srNo > currentMax) {
        localStorage.setItem(MAX_SR_KEY, String(srNo));
      }
    } catch (e) {
      console.warn('Failed to update max Sr. No.', e);
    }
  }

  function getNextSrNo() {
    let maxSr = 0;
    try {
      maxSr = parseInt(localStorage.getItem(MAX_SR_KEY), 10) || 0;
    } catch (e) {
      maxSr = 0;
    }

    if (leadsData.length > 0) {
      const currentMaxInList = Math.max(...leadsData.map(item => Number(item.srNo) || 0));
      maxSr = Math.max(maxSr, currentMaxInList);
    }

    return maxSr + 1;
  }

  // Generate unique stable internal ID
  function generateUniqueId() {
    return 'lead-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8);
  }

  // Load initial data
  loadStoredData();

  // Navigation DOM Elements
  const navAddLead = document.getElementById('nav-add-lead');
  const navViewLeads = document.getElementById('nav-view-leads');
  const screenAddLead = document.getElementById('screen-add-lead');
  const screenViewLeads = document.getElementById('screen-view-leads');

  // Form DOM Elements (Add New Lead)
  const form = document.getElementById('lead-form');
  const formAlert = document.getElementById('form-alert');
  const srNoInput = document.getElementById('srNo');
  const concernPersonSelect = document.getElementById('concernPerson');
  const designationSelect = document.getElementById('designationOfConcernPerson');

  // Table DOM Elements
  const tableBody = document.getElementById('leads-table-body');
  const tableAlert = document.getElementById('table-alert');
  const recordsCountBadge = document.getElementById('records-count-badge');

  // Edit Modal DOM Elements
  const editModal = document.getElementById('edit-modal');
  const btnCloseEditModal = document.getElementById('btn-close-edit-modal');
  const btnCancelEdit = document.getElementById('btn-cancel-edit');
  const btnSaveEdit = document.getElementById('btn-save-edit');
  const editFormAlert = document.getElementById('edit-form-alert');
  const editLeadIdInput = document.getElementById('edit-lead-id');
  const editSrNoInput = document.getElementById('edit-srNo');
  const editNameOfWorkInput = document.getElementById('edit-nameOfWorkEmplement');
  const editScopeOfWorkInput = document.getElementById('edit-scopeOfWork');
  const editNameOfClientInput = document.getElementById('edit-nameOfClient');
  const editLocationInput = document.getElementById('edit-location');
  const editConcernPersonSelect = document.getElementById('edit-concernPerson');
  const editContactDetailsInput = document.getElementById('edit-contactDetails');
  const editDesignationSelect = document.getElementById('edit-designationOfConcernPerson');
  const editSourceOfInquirySelect = document.getElementById('edit-sourceOfInquiry');
  const editDurationOfWorkInput = document.getElementById('edit-durationOfWork');
  const editHurdlesSelect = document.getElementById('edit-hurdlesSpecificTask');
  const editApproxAmountInput = document.getElementById('edit-approximateAmount');
  const editRemarksInput = document.getElementById('edit-remarks');

  // Delete Modal DOM Elements
  const deleteModal = document.getElementById('delete-modal');
  const btnCloseDeleteModal = document.getElementById('btn-close-delete-modal');
  const btnCancelDelete = document.getElementById('btn-cancel-delete');
  const btnConfirmDelete = document.getElementById('btn-confirm-delete');
  const deleteLeadIdInput = document.getElementById('delete-lead-id');
  const deleteConfirmationMsg = document.getElementById('delete-confirmation-msg');

  // Initialize Sr. No. in the Add Lead form
  srNoInput.value = getNextSrNo();

  // Screen Switching Logic
  function switchScreen(targetScreenId) {
    if (targetScreenId === 'screen-add-lead') {
      screenAddLead.classList.add('active');
      screenViewLeads.classList.remove('active');
      navAddLead.classList.add('active');
      navViewLeads.classList.remove('active');
    } else if (targetScreenId === 'screen-view-leads') {
      screenViewLeads.classList.add('active');
      screenAddLead.classList.remove('active');
      navViewLeads.classList.add('active');
      navAddLead.classList.remove('active');
    }
  }

  navAddLead.addEventListener('click', () => switchScreen('screen-add-lead'));
  navViewLeads.addEventListener('click', () => switchScreen('screen-view-leads'));

  // Concern Person -> Designation Dynamic Mapping (Add Lead Form)
  concernPersonSelect.addEventListener('change', () => {
    const selectedPerson = concernPersonSelect.value;
    designationSelect.value = PERSON_DESIGNATION_MAP[selectedPerson] || '';
    clearFieldError('concernPerson');
    clearFieldError('designationOfConcernPerson');
  });

  // Concern Person -> Designation Dynamic Mapping (Edit Modal Form)
  editConcernPersonSelect.addEventListener('change', () => {
    const selectedPerson = editConcernPersonSelect.value;
    editDesignationSelect.value = PERSON_DESIGNATION_MAP[selectedPerson] || '';
    clearEditFieldError('edit-concernPerson');
    clearEditFieldError('edit-designationOfConcernPerson');
  });

  // Helper to sort a copy of records in ascending numerical order of Sr. No.
  function getSortedLeads(records) {
    return [...records].sort((a, b) => Number(a.srNo) - Number(b.srNo));
  }

  // Render Table Rows with Actions Column (Sorted Ascending by Sr. No.)
  function renderTable() {
    tableBody.innerHTML = '';

    if (leadsData.length === 0) {
      const emptyRow = document.createElement('tr');
      emptyRow.className = 'empty-table-row';
      emptyRow.innerHTML = '<td colspan="14">No lead records found. Use the Add New Lead form to create one.</td>';
      tableBody.appendChild(emptyRow);
      if (recordsCountBadge) recordsCountBadge.textContent = '0 Records';
      return;
    }

    // Always sort a copy of the records before rendering (a.srNo - b.srNo)
    const sortedLeads = getSortedLeads(leadsData);

    sortedLeads.forEach((lead) => {
      const row = document.createElement('tr');
      if (lead.isNew) {
        row.classList.add('row-new');
      }

      row.innerHTML = `
        <td class="sr-no-cell">${escapeHtml(String(lead.srNo))}</td>
        <td><strong>${escapeHtml(lead.nameOfWorkEmplement)}</strong></td>
        <td>${escapeHtml(lead.scopeOfWork)}</td>
        <td>${escapeHtml(lead.nameOfClient)}</td>
        <td>${escapeHtml(lead.location)}</td>
        <td>${escapeHtml(lead.concernPerson)}</td>
        <td>${escapeHtml(lead.contactDetails)}</td>
        <td><span class="badge badge-designation">${escapeHtml(lead.designationOfConcernPerson)}</span></td>
        <td><span class="badge badge-source">${escapeHtml(lead.sourceOfInquiry)}</span></td>
        <td>${escapeHtml(lead.durationOfWork)}</td>
        <td><span class="badge badge-hurdle">${escapeHtml(lead.hurdlesSpecificTask)}</span></td>
        <td class="amount-cell">${escapeHtml(lead.approximateAmount)}</td>
        <td>${escapeHtml(lead.remarks || '—')}</td>
        <td class="actions-cell">
          <div class="actions-cell-inner">
            <button type="button" class="btn-action btn-action-edit" data-id="${escapeHtml(lead.id)}" title="Edit Lead #${escapeHtml(String(lead.srNo))}" aria-label="Edit Lead #${escapeHtml(String(lead.srNo))}">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button type="button" class="btn-action btn-action-delete" data-id="${escapeHtml(lead.id)}" title="Delete Lead #${escapeHtml(String(lead.srNo))}" aria-label="Delete Lead #${escapeHtml(String(lead.srNo))}">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          </div>
        </td>
      `;

      tableBody.appendChild(row);
    });

    if (recordsCountBadge) {
      recordsCountBadge.textContent = `${leadsData.length} Records`;
    }
  }

  // HTML escaping helper
  function escapeHtml(text) {
    if (!text && text !== 0) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Initial table render
  renderTable();

  // Inline Validation Helpers (Add Lead)
  function setFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorEl = document.getElementById(`error-${fieldId}`);
    if (field) field.classList.add('is-invalid');
    if (errorEl) errorEl.textContent = message;
  }

  function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorEl = document.getElementById(`error-${fieldId}`);
    if (field) field.classList.remove('is-invalid');
    if (errorEl) errorEl.textContent = '';
  }

  // Inline Validation Helpers (Edit Modal)
  function setEditFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorEl = document.getElementById(`error-${fieldId}`);
    if (field) field.classList.add('is-invalid');
    if (errorEl) errorEl.textContent = message;
  }

  function clearEditFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorEl = document.getElementById(`error-${fieldId}`);
    if (field) field.classList.remove('is-invalid');
    if (errorEl) errorEl.textContent = '';
  }

  // Clear errors on field user interaction (Add Lead Form)
  const addFieldsToWatch = [
    'nameOfWorkEmplement',
    'scopeOfWork',
    'nameOfClient',
    'location',
    'concernPerson',
    'contactDetails',
    'sourceOfInquiry',
    'durationOfWork',
    'hurdlesSpecificTask',
    'approximateAmount'
  ];

  addFieldsToWatch.forEach(fieldId => {
    const input = document.getElementById(fieldId);
    if (input) {
      input.addEventListener('input', () => clearFieldError(fieldId));
      input.addEventListener('change', () => clearFieldError(fieldId));
    }
  });

  // Clear errors on field user interaction (Edit Modal)
  const editFieldsToWatch = [
    'edit-nameOfWorkEmplement',
    'edit-scopeOfWork',
    'edit-nameOfClient',
    'edit-location',
    'edit-concernPerson',
    'edit-contactDetails',
    'edit-sourceOfInquiry',
    'edit-durationOfWork',
    'edit-hurdlesSpecificTask',
    'edit-approximateAmount'
  ];

  editFieldsToWatch.forEach(fieldId => {
    const input = document.getElementById(fieldId);
    if (input) {
      input.addEventListener('input', () => clearEditFieldError(fieldId));
      input.addEventListener('change', () => clearEditFieldError(fieldId));
    }
  });

  // Alert Banner Helpers
  function showAlert(targetEl, message, type = 'success') {
    if (!targetEl) return;
    targetEl.className = `alert-banner ${type}`;
    targetEl.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${type === 'success' 
          ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>' 
          : '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>'
        }
      </svg>
      <span>${message}</span>
    `;
    targetEl.style.display = 'flex';
  }

  function hideAlert(targetEl) {
    if (targetEl) targetEl.style.display = 'none';
  }

  // =========================================================================
  // Screen 1: Add Lead Form Submission
  // =========================================================================
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    hideAlert(formAlert);

    const currentSrNo = Number(srNoInput.value) || getNextSrNo();
    const nameOfWorkEmplement = document.getElementById('nameOfWorkEmplement').value.trim();
    const scopeOfWork = document.getElementById('scopeOfWork').value.trim();
    const nameOfClient = document.getElementById('nameOfClient').value.trim();
    const location = document.getElementById('location').value.trim();
    const concernPerson = concernPersonSelect.value;
    const contactDetails = document.getElementById('contactDetails').value.trim();
    const designationOfConcernPerson = designationSelect.value;
    const sourceOfInquiry = document.getElementById('sourceOfInquiry').value;
    const durationOfWork = document.getElementById('durationOfWork').value.trim();
    const hurdlesSpecificTask = document.getElementById('hurdlesSpecificTask').value;
    const approximateAmount = document.getElementById('approximateAmount').value.trim();
    const remarks = document.getElementById('remarks').value.trim();

    let isValid = true;
    let firstInvalidField = null;

    function checkRequired(fieldId, value, message) {
      if (!value) {
        setFieldError(fieldId, message);
        isValid = false;
        if (!firstInvalidField) firstInvalidField = document.getElementById(fieldId);
      } else {
        clearFieldError(fieldId);
      }
    }

    checkRequired('nameOfWorkEmplement', nameOfWorkEmplement, 'Please enter the Name of Work Emplement.');
    checkRequired('scopeOfWork', scopeOfWork, 'Please enter the Scope of Work.');
    checkRequired('nameOfClient', nameOfClient, 'Please enter the Name of Client.');
    checkRequired('location', location, 'Please enter the Location.');
    checkRequired('concernPerson', concernPerson, 'Please select the Concern Person.');
    checkRequired('contactDetails', contactDetails, 'Please enter the Contact Details.');
    checkRequired('sourceOfInquiry', sourceOfInquiry, 'Please select the Source of Inquiry.');
    checkRequired('durationOfWork', durationOfWork, 'Please enter the duration of confirmation / allotment.');
    checkRequired('hurdlesSpecificTask', hurdlesSpecificTask, 'Please select the Hurdles / specific task.');
    checkRequired('approximateAmount', approximateAmount, 'Please enter the Approximate amount.');

    if (concernPerson && PERSON_DESIGNATION_MAP[concernPerson] !== designationOfConcernPerson) {
      setFieldError('designationOfConcernPerson', 'Designation is inconsistent with selected Concern Person.');
      isValid = false;
      if (!firstInvalidField) firstInvalidField = designationSelect;
    }

    if (!isValid) {
      showAlert(formAlert, 'Please complete all required fields highlighted below.', 'error');
      if (firstInvalidField) firstInvalidField.focus();
      return;
    }

    const newLead = {
      id: generateUniqueId(),
      srNo: currentSrNo,
      nameOfWorkEmplement,
      scopeOfWork,
      nameOfClient,
      location,
      concernPerson,
      contactDetails,
      designationOfConcernPerson,
      sourceOfInquiry,
      durationOfWork,
      hurdlesSpecificTask,
      approximateAmount,
      remarks,
      isNew: true
    };

    // Append new lead to data store
    leadsData.push(newLead);
    updateMaxSrNo(currentSrNo);
    saveStoredData();
    renderTable();

    // Reset Form
    form.reset();
    designationSelect.value = '';
    srNoInput.value = getNextSrNo();
    addFieldsToWatch.forEach(clearFieldError);

    showAlert(formAlert, `Lead #${currentSrNo} has been successfully recorded and added to Previous Leads.`, 'success');
    formAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  // =========================================================================
  // Table Action Event Delegation (Edit & Delete Buttons)
  // =========================================================================
  tableBody.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.btn-action-edit');
    const deleteBtn = e.target.closest('.btn-action-delete');

    if (editBtn) {
      const leadId = editBtn.getAttribute('data-id');
      if (leadId) openEditModal(leadId);
      return;
    }

    if (deleteBtn) {
      const leadId = deleteBtn.getAttribute('data-id');
      if (leadId) openDeleteModal(leadId);
      return;
    }
  });

  // =========================================================================
  // Screen 2: Edit Lead Operations
  // =========================================================================
  function openEditModal(leadId) {
    const lead = leadsData.find(item => item.id === leadId);
    if (!lead) {
      showAlert(tableAlert, 'Unable to locate lead record for editing.', 'error');
      return;
    }

    hideAlert(editFormAlert);
    editFieldsToWatch.forEach(clearEditFieldError);
    clearEditFieldError('edit-designationOfConcernPerson');

    // Populate fields
    editLeadIdInput.value = lead.id;
    editSrNoInput.value = lead.srNo;
    editNameOfWorkInput.value = lead.nameOfWorkEmplement || '';
    editScopeOfWorkInput.value = lead.scopeOfWork || '';
    editNameOfClientInput.value = lead.nameOfClient || '';
    editLocationInput.value = lead.location || '';
    editConcernPersonSelect.value = lead.concernPerson || '';
    editContactDetailsInput.value = lead.contactDetails || '';
    
    // Automatic designation selection based on map
    editDesignationSelect.value = PERSON_DESIGNATION_MAP[lead.concernPerson] || lead.designationOfConcernPerson || '';
    
    editSourceOfInquirySelect.value = lead.sourceOfInquiry || '';
    editDurationOfWorkInput.value = lead.durationOfWork || '';
    editHurdlesSelect.value = lead.hurdlesSpecificTask || '';
    editApproxAmountInput.value = lead.approximateAmount || '';
    editRemarksInput.value = lead.remarks || '';

    // Show modal
    editModal.style.display = 'flex';
  }

  function closeEditModal() {
    editModal.style.display = 'none';
    hideAlert(editFormAlert);
    editFieldsToWatch.forEach(clearEditFieldError);
  }

  btnCloseEditModal.addEventListener('click', closeEditModal);
  btnCancelEdit.addEventListener('click', closeEditModal);

  // Close modal when clicking backdrop outside card
  editModal.addEventListener('click', (e) => {
    if (e.target === editModal) closeEditModal();
  });

  // Save Changes Handler
  btnSaveEdit.addEventListener('click', (e) => {
    e.preventDefault();
    hideAlert(editFormAlert);

    const leadId = editLeadIdInput.value;
    const targetIndex = leadsData.findIndex(item => item.id === leadId);
    if (targetIndex === -1) {
      showAlert(editFormAlert, 'Target record could not be found.', 'error');
      return;
    }

    const nameOfWorkEmplement = editNameOfWorkInput.value.trim();
    const scopeOfWork = editScopeOfWorkInput.value.trim();
    const nameOfClient = editNameOfClientInput.value.trim();
    const location = editLocationInput.value.trim();
    const concernPerson = editConcernPersonSelect.value;
    const contactDetails = editContactDetailsInput.value.trim();
    const designationOfConcernPerson = editDesignationSelect.value;
    const sourceOfInquiry = editSourceOfInquirySelect.value;
    const durationOfWork = editDurationOfWorkInput.value.trim();
    const hurdlesSpecificTask = editHurdlesSelect.value;
    const approximateAmount = editApproxAmountInput.value.trim();
    const remarks = editRemarksInput.value.trim();

    let isValid = true;
    let firstInvalidField = null;

    function checkEditRequired(fieldId, value, message) {
      if (!value) {
        setEditFieldError(fieldId, message);
        isValid = false;
        if (!firstInvalidField) firstInvalidField = document.getElementById(fieldId);
      } else {
        clearEditFieldError(fieldId);
      }
    }

    checkEditRequired('edit-nameOfWorkEmplement', nameOfWorkEmplement, 'Please enter the Name of Work Emplement.');
    checkEditRequired('edit-scopeOfWork', scopeOfWork, 'Please enter the Scope of Work.');
    checkEditRequired('edit-nameOfClient', nameOfClient, 'Please enter the Name of Client.');
    checkEditRequired('edit-location', location, 'Please enter the Location.');
    checkEditRequired('edit-concernPerson', concernPerson, 'Please select the Concern Person.');
    checkEditRequired('edit-contactDetails', contactDetails, 'Please enter the Contact Details.');
    checkEditRequired('edit-sourceOfInquiry', sourceOfInquiry, 'Please select the Source of Inquiry.');
    checkEditRequired('edit-durationOfWork', durationOfWork, 'Please enter the duration of confirmation / allotment.');
    checkEditRequired('edit-hurdlesSpecificTask', hurdlesSpecificTask, 'Please select the Hurdles / specific task.');
    checkEditRequired('edit-approximateAmount', approximateAmount, 'Please enter the Approximate amount.');

    if (concernPerson && PERSON_DESIGNATION_MAP[concernPerson] !== designationOfConcernPerson) {
      setEditFieldError('edit-designationOfConcernPerson', 'Designation is inconsistent with selected Concern Person.');
      isValid = false;
      if (!firstInvalidField) firstInvalidField = editDesignationSelect;
    }

    if (!isValid) {
      showAlert(editFormAlert, 'Please complete all required fields highlighted below.', 'error');
      if (firstInvalidField) firstInvalidField.focus();
      return;
    }

    // Preserve original Sr. No. and ID, update only modified values
    const existingRecord = leadsData[targetIndex];
    leadsData[targetIndex] = {
      ...existingRecord,
      nameOfWorkEmplement,
      scopeOfWork,
      nameOfClient,
      location,
      concernPerson,
      contactDetails,
      designationOfConcernPerson,
      sourceOfInquiry,
      durationOfWork,
      hurdlesSpecificTask,
      approximateAmount,
      remarks,
      isNew: false
    };

    saveStoredData();
    renderTable();
    closeEditModal();

    showAlert(tableAlert, `Lead #${existingRecord.srNo} updated successfully.`, 'success');
    tableAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  // =========================================================================
  // Screen 2: Delete Lead Operations
  // =========================================================================
  function openDeleteModal(leadId) {
    const lead = leadsData.find(item => item.id === leadId);
    if (!lead) {
      showAlert(tableAlert, 'Unable to locate lead record for deletion.', 'error');
      return;
    }

    deleteLeadIdInput.value = lead.id;
    deleteConfirmationMsg.innerHTML = `Are you sure you want to delete <strong>Lead #${escapeHtml(String(lead.srNo))} — ${escapeHtml(lead.nameOfWorkEmplement)}</strong>? This action cannot be undone.`;
    deleteModal.style.display = 'flex';
  }

  function closeDeleteModal() {
    deleteModal.style.display = 'none';
    deleteLeadIdInput.value = '';
  }

  btnCloseDeleteModal.addEventListener('click', closeDeleteModal);
  btnCancelDelete.addEventListener('click', closeDeleteModal);

  deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) closeDeleteModal();
  });

  // Confirm Deletion Handler
  btnConfirmDelete.addEventListener('click', () => {
    const leadId = deleteLeadIdInput.value;
    const targetLead = leadsData.find(item => item.id === leadId);
    if (!targetLead) {
      showAlert(tableAlert, 'Record to delete was not found.', 'error');
      closeDeleteModal();
      return;
    }

    const deletedSrNo = targetLead.srNo;
    leadsData = leadsData.filter(item => item.id !== leadId);

    saveStoredData();
    renderTable();
    closeDeleteModal();

    // Re-sync next Sr. No. in Add form
    srNoInput.value = getNextSrNo();

    showAlert(tableAlert, `Lead #${deletedSrNo} deleted successfully.`, 'success');
    tableAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  // Keyboard accessibility for modals (Escape key closes open modal)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (editModal.style.display === 'flex') closeEditModal();
      if (deleteModal.style.display === 'flex') closeDeleteModal();
    }
  });
});
