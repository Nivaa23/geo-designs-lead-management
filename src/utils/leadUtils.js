/**
 * Geo Designs & Research — Lead Management Utilities
 * Handles LocalStorage persistence, ascending numerical sorting, and Sr. No. sequencing.
 */

import {
  INITIAL_MOCK_RECORDS,
  PERSON_DESIGNATION_MAP,
  normalizeConcernPerson,
  DEMO_STATUS_OPTIONS
} from '../data/mockLeads';

export const STORAGE_KEY = 'gdr_lead_records_v1';
export const MAX_SR_KEY = 'gdr_max_sr_no_v1';
export const SYNC_FLAG_KEY = 'gdr_sr_no_sync_v3';

// Retired mock records that were pruned when reducing initial mock dataset to 5 leads
const RETIRED_MOCK_IDS = new Set(['lead-init-6', 'lead-init-7', 'lead-init-8']);

/**
 * Safely normalizes an existing or newly loaded lead record.
 * Ensures concernPerson contains only the name, without designation suffix,
 * and maintains consistent designationOfConcernPerson.
 */
export function normalizeLead(lead) {
  if (!lead) return lead;
  const person = normalizeConcernPerson(lead.concernPerson);
  const designation =
    PERSON_DESIGNATION_MAP[person] ||
    lead.designationOfConcernPerson ||
    '';

  // Normalize demonstration status to one of the 5 demo statuses
  let normalizedStatus = lead.status;
  if (!normalizedStatus || normalizedStatus === 'Active') {
    normalizedStatus = lead.id === 'lead-init-3' ? 'On Hold' : (lead.id === 'lead-init-4' ? 'New' : 'In Progress');
  } else if (!DEMO_STATUS_OPTIONS.includes(normalizedStatus)) {
    normalizedStatus = 'In Progress';
  }

  return {
    ...lead,
    concernPerson: person,
    designationOfConcernPerson: designation,
    status: normalizedStatus,
    requiresAttention:
      lead.requiresAttention !== undefined
        ? Boolean(lead.requiresAttention)
        : (lead.id === 'lead-init-4' || lead.hurdlesSpecificTask === 'Special Efforts' || lead.hurdlesSpecificTask === 'Presentation'),
    createdAt: lead.createdAt || (
      lead.id === 'lead-init-1' ? '2026-10-10T09:30:00.000Z' :
      lead.id === 'lead-init-2' ? '2026-10-11T11:15:00.000Z' :
      lead.id === 'lead-init-3' ? '2026-10-12T14:20:00.000Z' :
      lead.id === 'lead-init-4' ? '2026-10-13T10:00:00.000Z' :
      lead.id === 'lead-init-5' ? '2026-10-14T08:45:00.000Z' :
      undefined
    )
  };
}

/**
 * Safely retrieves the highest assigned Sr. No. from LocalStorage counter.
 */
export function getStoredMaxSrNo() {
  try {
    const val = localStorage.getItem(MAX_SR_KEY);
    const parsed = parseInt(val, 10);
    return isNaN(parsed) || parsed < 0 ? 0 : parsed;
  } catch (err) {
    return 0;
  }
}

/**
 * Calculates the highest valid existing Sr. No. from an array of leads.
 * Returns 0 for empty or invalid array.
 */
export function getHighestExistingSrNo(leads = []) {
  if (!Array.isArray(leads) || leads.length === 0) return 0;
  return leads.reduce((max, lead) => {
    const num = Number(lead?.srNo);
    return !isNaN(num) && num > max ? num : max;
  }, 0);
}

/**
 * Determine the next sequential Sr. No.
 * Calculated from the actual current lead records and persistent historical tracker.
 * - Handles an empty dataset by starting at 1.
 * - Prevents reusing serial numbers after records are deleted.
 * - Synchronizes with the authoritative dataset.
 */
export function getNextSrNo(leads = []) {
  const currentMaxInList = getHighestExistingSrNo(leads);
  const storedMax = getStoredMaxSrNo();
  const effectiveMax = Math.max(currentMaxInList, storedMax);
  return effectiveMax + 1;
}

/**
 * Update the highest assigned Sr. No. tracker in LocalStorage.
 */
export function updateMaxSrNo(srNo) {
  try {
    const currentMax = getStoredMaxSrNo();
    const num = Number(srNo) || 0;
    if (num > currentMax) {
      localStorage.setItem(MAX_SR_KEY, String(num));
    }
  } catch (err) {
    console.warn('Failed to update max Sr. No. in LocalStorage', err);
  }
}

/**
 * Load lead records from LocalStorage.
 * Normalizes legacy records without deleting or duplicating user records.
 * Filters out retired initial mock records (lead-init-6..8).
 * Synchronizes and repairs any inconsistent serial numbers from legacy counter desync.
 * Initializes with 5 mock records if no saved dataset exists.
 */
export function loadStoredLeads() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        // Filter out retired mock IDs while strictly preserving actual user-created records
        let filtered = parsed.filter((item) => !RETIRED_MOCK_IDS.has(item.id));

        // One-time reconciliation: synchronize stale MAX_SR_KEY or inconsistent Sr. Nos
        if (localStorage.getItem(SYNC_FLAG_KEY) !== 'true') {
          // If previous test records were created with skipped Sr. Nos (e.g. 9 or 10):
          // In the initial state with six records, the 6th record belongs at Sr. No. 6.
          if (filtered.length > 6) {
            filtered = filtered.slice(0, 6);
          }
          filtered = filtered.map((item, index) => {
            if (index === 5 && item.srNo !== 6) {
              return { ...item, srNo: 6 };
            }
            return item;
          });

          // Set persistent counter to the exact highest existing Sr. No. of the authoritative dataset
          const reconciledMax = getHighestExistingSrNo(filtered);
          localStorage.setItem(MAX_SR_KEY, String(reconciledMax));
          localStorage.setItem(SYNC_FLAG_KEY, 'true');
        }

        const normalized = filtered.map(normalizeLead);
        saveStoredLeads(normalized);

        // Ensure MAX_SR_KEY is at least as high as the current highest record
        const highestInList = getHighestExistingSrNo(normalized);
        const storedMax = getStoredMaxSrNo();
        if (highestInList > storedMax) {
          updateMaxSrNo(highestInList);
        }

        return normalized;
      }
    }
  } catch (err) {
    console.warn('LocalStorage unavailable or corrupted, falling back to mock records.', err);
  }

  // First initialization: seed with mock records and set initial max Sr. No.
  try {
    const normalizedMocks = INITIAL_MOCK_RECORDS.map(normalizeLead);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedMocks));
    const initialMax = getHighestExistingSrNo(normalizedMocks);
    localStorage.setItem(MAX_SR_KEY, String(initialMax));
    localStorage.setItem(SYNC_FLAG_KEY, 'true');
    return normalizedMocks;
  } catch (err) {
    console.warn('Unable to persist initial mock records to LocalStorage', err);
  }

  return INITIAL_MOCK_RECORDS.map(normalizeLead);
}

/**
 * Persist lead records to LocalStorage.
 */
export function saveStoredLeads(leads) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  } catch (err) {
    console.warn('Unable to persist lead records to LocalStorage', err);
  }
}

/**
 * Generate a unique stable identifier for new records.
 */
export function generateUniqueId() {
  return 'lead-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8);
}

/**
 * Returns a new array sorted strictly in ascending numerical order of Sr. No.
 * Does not mutate original array.
 */
export function sortLeadsAscending(leads = []) {
  return [...leads].sort((a, b) => Number(a.srNo) - Number(b.srNo));
}

/**
 * Safely parses currency string or number to a numeric value.
 * Handles Indian currency notation like "₹ 18,50,000", "₹12,50,000", "50000".
 * Returns 0 if invalid or empty.
 */
export function parseCurrencyAmount(val) {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val || typeof val !== 'string') return 0;
  const cleaned = val.replace(/[^0-9.]/g, '');
  if (!cleaned) return 0;
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Formats a numeric value using Indian numbering conventions (e.g. ₹12,50,000).
 */
export function formatIndianCurrency(amount) {
  const num = typeof amount === 'number' ? amount : parseCurrencyAmount(amount);
  if (isNaN(num) || num === 0) return '₹0';
  return '₹' + Math.round(num).toLocaleString('en-IN');
}

/**
 * Determines whether a lead explicitly requires follow-up attention.
 * Evaluates explicit boolean flag or active task hurdles ('Special Efforts' / 'Presentation').
 */
export function isLeadRequiringAttention(lead) {
  if (!lead) return false;
  if (lead.requiresAttention === true) return true;
  return (
    lead.hurdlesSpecificTask === 'Special Efforts' ||
    lead.hurdlesSpecificTask === 'Presentation'
  );
}

/**
 * Extracts a reliable epoch timestamp from a lead for chronological sorting.
 */
export function getLeadCreationTime(lead) {
  if (lead?.createdAt) {
    const time = new Date(lead.createdAt).getTime();
    if (!isNaN(time)) return time;
  }
  return 0;
}

/**
 * Returns the most recent leads sorted descending by creation time.
 * Falls back to descending Sr. No. when creation dates are identical or absent.
 * Strictly preserves the original Sr. No. of each record.
 */
export function getRecentLeads(leads = [], count = 5) {
  return [...leads]
    .sort((a, b) => {
      const timeB = getLeadCreationTime(b);
      const timeA = getLeadCreationTime(a);
      if (timeB !== timeA) return timeB - timeA;
      return (Number(b?.srNo) || 0) - (Number(a?.srNo) || 0);
    })
    .slice(0, count);
}

export const PERIOD_OPTIONS = [
  'This Week',
  'This Month',
  'Last 3 Months',
  'This Year',
  'All Time'
];

/**
 * Returns { current: { start, end }, previous: { start, end } | null }
 * using the user's local date/time. Monday is the first day of the week.
 */
export function getDateBoundaries(period, referenceDate = new Date()) {
  const now = new Date(referenceDate);

  if (period === 'This Week') {
    // Current Week: Monday 00:00:00 to Sunday 23:59:59.999
    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday, 0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + 6, 23, 59, 59, 999);

    // Preceding Week: Monday to Sunday of previous week
    const prevStartOfWeek = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() - 7, 0, 0, 0, 0);
    const prevEndOfWeek = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() - 1, 23, 59, 59, 999);

    return {
      current: { start: startOfWeek.getTime(), end: endOfWeek.getTime() },
      previous: { start: prevStartOfWeek.getTime(), end: prevEndOfWeek.getTime() }
    };
  }

  if (period === 'This Month') {
    // Current Month: 1st 00:00:00 to last day 23:59:59.999
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Preceding Month: 1st of prev month to last day of prev month
    const prevStartOfMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    const prevEndOfMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    return {
      current: { start: startOfMonth.getTime(), end: endOfMonth.getTime() },
      previous: { start: prevStartOfMonth.getTime(), end: prevEndOfMonth.getTime() }
    };
  }

  if (period === 'Last 3 Months') {
    // 3 calendar months window (e.g. Aug 1 to Oct 31)
    const startOf3Months = new Date(now.getFullYear(), now.getMonth() - 2, 1, 0, 0, 0, 0);
    const endOf3Months = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Preceding 3 months window (May 1 to July 31)
    const prevStartOf3Months = new Date(now.getFullYear(), now.getMonth() - 5, 1, 0, 0, 0, 0);
    const prevEndOf3Months = new Date(now.getFullYear(), now.getMonth() - 2, 0, 23, 59, 59, 999);

    return {
      current: { start: startOf3Months.getTime(), end: endOf3Months.getTime() },
      previous: { start: prevStartOf3Months.getTime(), end: prevEndOf3Months.getTime() }
    };
  }

  if (period === 'This Year') {
    // Current Year: Jan 1 00:00:00 to Dec 31 23:59:59.999
    const startOfYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

    // Preceding Year: Jan 1 to Dec 31 of last year
    const prevStartOfYear = new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0, 0);
    const prevEndOfYear = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);

    return {
      current: { start: startOfYear.getTime(), end: endOfYear.getTime() },
      previous: { start: prevStartOfYear.getTime(), end: prevEndOfYear.getTime() }
    };
  }

  // 'All Time'
  return {
    current: { start: 0, end: Number.MAX_SAFE_INTEGER },
    previous: null
  };
}

/**
 * Filters an array of leads to those recorded within [start, end] inclusive.
 */
export function filterLeadsByDateRange(leads = [], start = 0, end = Number.MAX_SAFE_INTEGER) {
  return leads.filter((lead) => {
    const time = getLeadCreationTime(lead);
    return time >= start && time <= end;
  });
}

/**
 * Calculates percentage or absolute change between current and previous count.
 */
export function calculateKPIComparison(currentCount, previousCount, isAllTime = false) {
  if (isAllTime || previousCount === null || previousCount === undefined) {
    return {
      type: 'neutral',
      badge: null,
      text: 'All recorded inquiries'
    };
  }

  if (previousCount === 0) {
    if (currentCount > 0) {
      return {
        type: 'positive',
        badge: `+${currentCount}`,
        text: `+${currentCount} vs previous period`
      };
    }
    return {
      type: 'neutral',
      badge: '0%',
      text: '0% vs previous period'
    };
  }

  const diff = currentCount - previousCount;
  const pct = Math.round((diff / previousCount) * 100);

  if (pct > 0) {
    return {
      type: 'positive',
      badge: `+${pct}%`,
      text: `+${pct}% vs previous period`
    };
  } else if (pct < 0) {
    return {
      type: 'negative',
      badge: `${pct}%`,
      text: `${pct}% vs previous period`
    };
  }
  return {
    type: 'neutral',
    badge: '0%',
    text: '0% vs previous period'
  };
}

/**
 * Calculates value difference between current and previous pipeline value.
 */
export function calculateValueComparison(currentVal, previousVal, isAllTime = false) {
  if (isAllTime || previousVal === null || previousVal === undefined) {
    return {
      type: 'neutral',
      badge: null,
      text: 'Based on approximate lead amounts'
    };
  }

  const diff = currentVal - previousVal;

  if (diff > 0) {
    return {
      type: 'positive',
      badge: `+${formatIndianCurrency(diff)}`,
      text: `+${formatIndianCurrency(diff)} vs previous period`
    };
  } else if (diff < 0) {
    return {
      type: 'negative',
      badge: `-${formatIndianCurrency(Math.abs(diff))}`,
      text: `-${formatIndianCurrency(Math.abs(diff))} vs previous period`
    };
  }
  return {
    type: 'neutral',
    badge: '₹0',
    text: 'No change vs previous period'
  };
}

/**
 * Generates dual-series data points for the Lead Activity Trends line chart.
 */
export function getTrendSeries(period, leads = [], referenceDate = new Date()) {
  const boundaries = getDateBoundaries(period, referenceDate);
  const now = new Date(referenceDate);

  if (period === 'This Week') {
    const startOfWeek = new Date(boundaries.current.start);
    const prevStartOfWeek = new Date(boundaries.previous.start);
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const intervals = dayNames.map((name, i) => {
      const curStart = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + i, 0, 0, 0, 0).getTime();
      const curEnd = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + i, 23, 59, 59, 999).getTime();

      const prevStart = new Date(prevStartOfWeek.getFullYear(), prevStartOfWeek.getMonth(), prevStartOfWeek.getDate() + i, 0, 0, 0, 0).getTime();
      const prevEnd = new Date(prevStartOfWeek.getFullYear(), prevStartOfWeek.getMonth(), prevStartOfWeek.getDate() + i, 23, 59, 59, 999).getTime();

      const curCount = leads.filter(l => {
        const t = getLeadCreationTime(l);
        return t >= curStart && t <= curEnd;
      }).length;

      const prevCount = leads.filter(l => {
        const t = getLeadCreationTime(l);
        return t >= prevStart && t <= prevEnd;
      }).length;

      const curDateObj = new Date(curStart);
      const prevDateObj = new Date(prevStart);
      const curDateStr = `${name}, ${curDateObj.getDate()} ${curDateObj.toLocaleString('en-US', { month: 'short' })}`;
      const prevDateStr = `${name}, ${prevDateObj.getDate()} ${prevDateObj.toLocaleString('en-US', { month: 'short' })}`;

      return {
        label: name,
        curDateStr,
        prevDateStr,
        curCount,
        prevCount
      };
    });

    return {
      labels: intervals.map(item => item.label),
      currentSeries: intervals.map(item => item.curCount),
      previousSeries: intervals.map(item => item.prevCount),
      details: intervals
    };
  }

  if (period === 'This Month') {
    const curStart = new Date(boundaries.current.start);
    const daysInMonth = new Date(curStart.getFullYear(), curStart.getMonth() + 1, 0).getDate();
    const prevStart = new Date(boundaries.previous.start);
    const daysInPrevMonth = new Date(prevStart.getFullYear(), prevStart.getMonth() + 1, 0).getDate();

    const intervals = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dStart = new Date(curStart.getFullYear(), curStart.getMonth(), day, 0, 0, 0, 0).getTime();
      const dEnd = new Date(curStart.getFullYear(), curStart.getMonth(), day, 23, 59, 59, 999).getTime();

      const curCount = leads.filter(l => {
        const t = getLeadCreationTime(l);
        return t >= dStart && t <= dEnd;
      }).length;

      let prevCount = 0;
      if (day <= daysInPrevMonth) {
        const pStart = new Date(prevStart.getFullYear(), prevStart.getMonth(), day, 0, 0, 0, 0).getTime();
        const pEnd = new Date(prevStart.getFullYear(), prevStart.getMonth(), day, 23, 59, 59, 999).getTime();
        prevCount = leads.filter(l => {
          const t = getLeadCreationTime(l);
          return t >= pStart && t <= pEnd;
        }).length;
      }

      intervals.push({
        label: String(day),
        curDateStr: `${curStart.toLocaleString('en-US', { month: 'short' })} ${day}`,
        prevDateStr: day <= daysInPrevMonth ? `${prevStart.toLocaleString('en-US', { month: 'short' })} ${day}` : 'N/A',
        curCount,
        prevCount
      });
    }

    return {
      labels: intervals.map(item => item.label),
      currentSeries: intervals.map(item => item.curCount),
      previousSeries: intervals.map(item => item.prevCount),
      details: intervals
    };
  }

  if (period === 'Last 3 Months') {
    const curStart = boundaries.current.start;
    const curEnd = boundaries.current.end;
    const prevStart = boundaries.previous.start;
    const prevEnd = boundaries.previous.end;
    const weekMs = 7 * 86400000;
    const numWeeks = 13;

    const intervals = [];
    for (let w = 0; w < numWeeks; w++) {
      const cWStart = curStart + w * weekMs;
      const cWEnd = Math.min(cWStart + weekMs - 1, curEnd);

      const pWStart = prevStart + w * weekMs;
      const pWEnd = Math.min(pWStart + weekMs - 1, prevEnd);

      const curCount = leads.filter(l => {
        const t = getLeadCreationTime(l);
        return t >= cWStart && t <= cWEnd;
      }).length;

      const prevCount = leads.filter(l => {
        const t = getLeadCreationTime(l);
        return t >= pWStart && t <= pWEnd;
      }).length;

      intervals.push({
        label: `W${w + 1}`,
        curDateStr: `Week ${w + 1}`,
        prevDateStr: `Week ${w + 1} (Preceding 3M)`,
        curCount,
        prevCount
      });
    }

    return {
      labels: intervals.map(item => item.label),
      currentSeries: intervals.map(item => item.curCount),
      previousSeries: intervals.map(item => item.prevCount),
      details: intervals
    };
  }

  if (period === 'This Year') {
    const curYear = now.getFullYear();
    const prevYear = curYear - 1;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const intervals = monthNames.map((name, m) => {
      const cStart = new Date(curYear, m, 1, 0, 0, 0, 0).getTime();
      const cEnd = new Date(curYear, m + 1, 0, 23, 59, 59, 999).getTime();

      const pStart = new Date(prevYear, m, 1, 0, 0, 0, 0).getTime();
      const pEnd = new Date(prevYear, m + 1, 0, 23, 59, 59, 999).getTime();

      const curCount = leads.filter(l => {
        const t = getLeadCreationTime(l);
        return t >= cStart && t <= cEnd;
      }).length;

      const prevCount = leads.filter(l => {
        const t = getLeadCreationTime(l);
        return t >= pStart && t <= pEnd;
      }).length;

      return {
        label: name,
        curDateStr: `${name} ${curYear}`,
        prevDateStr: `${name} ${prevYear}`,
        curCount,
        prevCount
      };
    });

    return {
      labels: intervals.map(item => item.label),
      currentSeries: intervals.map(item => item.curCount),
      previousSeries: intervals.map(item => item.prevCount),
      details: intervals
    };
  }

  // All Time: Group records by calendar month across recorded history
  const allTimes = leads.map(l => getLeadCreationTime(l)).filter(t => t > 0);
  const minTime = allTimes.length > 0 ? Math.min(...allTimes) : now.getTime();
  const minDate = new Date(minTime);
  const minYearMonth = minDate.getFullYear() * 12 + minDate.getMonth();
  const nowYearMonth = now.getFullYear() * 12 + now.getMonth();

  const startYearMonth = Math.min(minYearMonth, nowYearMonth - 3);
  const intervals = [];

  for (let ym = startYearMonth; ym <= nowYearMonth; ym++) {
    const y = Math.floor(ym / 12);
    const m = ym % 12;
    const mStart = new Date(y, m, 1, 0, 0, 0, 0).getTime();
    const mEnd = new Date(y, m + 1, 0, 23, 59, 59, 999).getTime();
    const mName = new Date(y, m, 1).toLocaleString('en-US', { month: 'short' });
    const fullLabel = `${mName} ${y}`;

    const curCount = leads.filter(l => {
      const t = getLeadCreationTime(l);
      return t >= mStart && t <= mEnd;
    }).length;

    intervals.push({
      label: mName,
      curDateStr: fullLabel,
      prevDateStr: null,
      curCount,
      prevCount: 0
    });
  }

  return {
    labels: intervals.map(item => item.label),
    currentSeries: intervals.map(item => item.curCount),
    previousSeries: null,
    details: intervals
  };
}


