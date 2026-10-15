/**
 * Geo Designs & Research — Mock Data & Field Constants
 */

export const PERSON_DESIGNATION_MAP = {
  'Vishal Shah': 'COO',
  'Jatin Bansal': 'Admin',
  'Satyanarayan Choudhary': 'GM (Architecture)',
  // Backwards compatibility for existing legacy records
  'Vishal Shah - COO': 'COO',
  'Jatin Bansal - Admin': 'Admin',
  'Satyanarayan Choudhary - GM (Architecture)': 'GM (Architecture)'
};

export const CONCERN_PERSON_OPTIONS = [
  'Vishal Shah',
  'Jatin Bansal',
  'Satyanarayan Choudhary'
];

/**
 * Safely normalizes legacy combined names (e.g., 'Vishal Shah - COO')
 * to only the person's name ('Vishal Shah').
 */
export function normalizeConcernPerson(person) {
  if (!person) return '';
  if (person === 'Vishal Shah - COO' || person === 'Vishal Shah') return 'Vishal Shah';
  if (person === 'Jatin Bansal - Admin' || person === 'Jatin Bansal') return 'Jatin Bansal';
  if (
    person === 'Satyanarayan Choudhary - GM (Architecture)' ||
    person === 'Satyanarayan Choudhary'
  ) {
    return 'Satyanarayan Choudhary';
  }
  return person;
}

export const SOURCE_OF_INQUIRY_OPTIONS = [
  'Online Quotations',
  'GEM / Website',
  'Mails',
  'Verbal Inquiries',
  'Tenders'
];

export const HURDLES_OPTIONS = [
  'Visit',
  'Presentation',
  'Quotation',
  'Special Efforts',
  'Commitment'
];

/**
 * Demonstration status definitions for Dashboard Overview:
 * - 'New': Recently recorded inquiries.
 * - 'In Progress': Inquiries actively under BoQ preparation or client dialogue.
 * - 'On Hold': Inquiries temporarily deferred awaiting approvals or presentations.
 * - 'Won': Inquiries confirmed / contract awarded.
 * - 'Lost': Inquiries declined or non-awarded.
 * Note: These fields are demonstration-only for dashboard metric calculations
 * and do not alter the existing 13-field form schema.
 */
export const DEMO_STATUS_OPTIONS = ['New', 'In Progress', 'On Hold', 'Won', 'Lost'];

export const STATUS_COLOR_MAP = {
  'New': '#0ea5e9',
  'In Progress': '#4f46e5',
  'On Hold': '#f59e0b',
  'Won': '#10b981',
  'Lost': '#ef4444'
};

export const HURDLE_COLOR_MAP = {
  'Visit': '#3b82f6',
  'Presentation': '#8b5cf6',
  'Quotation': '#06b6d4',
  'Special Efforts': '#f59e0b',
  'Commitment': '#10b981'
};

export const INITIAL_MOCK_RECORDS = [
  {
    id: 'lead-init-1',
    srNo: 1,
    nameOfWorkEmplement: 'Topographical Survey & Digital Terrain Modeling for Sabarmati Riverfront Phase 3',
    scopeOfWork: 'High-precision DGPS boundary traverse, contour mapping at 0.5m intervals, riverbed bathymetry',
    nameOfClient: 'Ahmedabad Urban Development Authority (AUDA)',
    location: 'Ahmedabad, Gujarat',
    concernPerson: 'Satyanarayan Choudhary',
    contactDetails: '+91 98791 22340 / tenders@auda.org.in',
    designationOfConcernPerson: 'GM (Architecture)',
    sourceOfInquiry: 'Tenders',
    durationOfWork: '30 working days',
    hurdlesSpecificTask: 'Visit',
    approximateAmount: '₹ 18,50,000',
    remarks: 'Joint site reconnaissance completed; benchmark pillar points finalized.',
    status: 'In Progress',
    requiresAttention: false,
    createdAt: '2026-10-10T09:30:00.000Z'
  },
  {
    id: 'lead-init-2',
    srNo: 2,
    nameOfWorkEmplement: 'Geotechnical Soil Investigation & Core Drilling for Metro Viaduct Pier Foundations',
    scopeOfWork: '12 exploratory boreholes up to 35m depth, SPT tests, laboratory triaxial & chemical testing',
    nameOfClient: 'Gujarat Metro Rail Corporation (GMRC)',
    location: 'Surat, Gujarat',
    concernPerson: 'Vishal Shah',
    contactDetails: '+91 98250 88712 / gmrc.civil@gujaratmetro.com',
    designationOfConcernPerson: 'COO',
    sourceOfInquiry: 'GEM / Website',
    durationOfWork: '45 working days',
    hurdlesSpecificTask: 'Quotation',
    approximateAmount: '₹ 32,40,000',
    remarks: 'Revised BoQ submitted following geotechnical advisor review.',
    status: 'In Progress',
    requiresAttention: false,
    createdAt: '2026-10-11T11:15:00.000Z'
  },
  {
    id: 'lead-init-3',
    srNo: 3,
    nameOfWorkEmplement: 'Architectural Heritage Documentation & Laser Scanning of Mandvi Old Port Structures',
    scopeOfWork: '3D terrestrial LiDAR scanning, 2D measured elevations, conservation structural audit',
    nameOfClient: 'Gujarat Maritime Board (GMB)',
    location: 'Kutch / Mandvi, Gujarat',
    concernPerson: 'Satyanarayan Choudhary',
    contactDetails: '+91 94260 55189 / heritage.gmb@gov.in',
    designationOfConcernPerson: 'GM (Architecture)',
    sourceOfInquiry: 'Mails',
    durationOfWork: '3 weeks',
    hurdlesSpecificTask: 'Presentation',
    approximateAmount: '₹ 14,80,000',
    remarks: 'Preliminary presentation to the Heritage Advisory Committee scheduled next Tuesday.',
    status: 'On Hold',
    requiresAttention: false,
    createdAt: '2026-10-12T14:20:00.000Z'
  },
  {
    id: 'lead-init-4',
    srNo: 4,
    nameOfWorkEmplement: 'Hydrographic & Bathymetric Survey for Coastal Desalination Intake Pipeline',
    scopeOfWork: 'Dual-frequency echo sounder bathymetry, side scan sonar, tidal observations for 2.5km offshore',
    nameOfClient: 'Adani Ports & Special Economic Zone Ltd',
    location: 'Mundra, Gujarat',
    concernPerson: 'Vishal Shah',
    contactDetails: '+91 99099 44321 / infra.procure@adani.com',
    designationOfConcernPerson: 'COO',
    sourceOfInquiry: 'Verbal Inquiries',
    durationOfWork: '20 days',
    hurdlesSpecificTask: 'Special Efforts',
    approximateAmount: '₹ 22,00,000',
    remarks: 'Port security clearance and marine vessel permission under verification.',
    status: 'New',
    requiresAttention: true,
    createdAt: '2026-10-13T10:00:00.000Z'
  },
  {
    id: 'lead-init-5',
    srNo: 5,
    nameOfWorkEmplement: 'Annual Rate Contract for Office Facility Logistics & Field Survey Equipment Maintenance',
    scopeOfWork: 'Routine calibration of Total Stations, GNSS receivers, and administrative survey log supplies',
    nameOfClient: 'Sardar Sarovar Narmada Nigam Ltd (SSNNL)',
    location: 'Vadodara, Gujarat',
    concernPerson: 'Jatin Bansal',
    contactDetails: '+91 97129 33451 / admin@ssnnl.com',
    designationOfConcernPerson: 'Admin',
    sourceOfInquiry: 'Online Quotations',
    durationOfWork: '12 months annual contract',
    hurdlesSpecificTask: 'Quotation',
    approximateAmount: '₹ 8,90,000',
    remarks: 'Vendor compliance documents submitted on government portal.',
    status: 'In Progress',
    requiresAttention: false,
    createdAt: '2026-10-14T08:45:00.000Z'
  }
];
