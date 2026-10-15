import React, { useState } from 'react';
import { DEMO_STATUS_OPTIONS, STATUS_COLOR_MAP } from '../data/mockLeads';

export default function LeadStatusDoughnutChart({ leads = [] }) {
  const [hoveredStatus, setHoveredStatus] = useState(null);

  const totalLeads = leads.length;

  // Calculate status counts & percentages strictly from actual database records (no fabricated fallbacks)
  const statusStats = DEMO_STATUS_OPTIONS.map((status) => {
    const count = leads.filter((lead) => {
      if (!lead || !lead.status) return false;
      const s = lead.status === 'Active' ? 'In Progress' : lead.status;
      return s === status;
    }).length;

    const percentage = totalLeads > 0 ? (count / totalLeads) * 100 : 0;

    return {
      status,
      count,
      percentage,
      color: STATUS_COLOR_MAP[status] || '#94a3b8'
    };
  });

  const totalTrackedStatusCount = statusStats.reduce((sum, item) => sum + item.count, 0);

  // Doughnut geometry
  const radius = 64;
  const strokeWidth = 22;
  const circumference = 2 * Math.PI * radius;

  // Compute stroke offsets for each slice with count > 0 (do not fabricate slices for zero count)
  let accumulatedDash = 0;
  const slices = statusStats
    .filter((item) => item.count > 0)
    .map((item) => {
      const sliceLength = (item.percentage / 100) * circumference;
      const offset = accumulatedDash;
      accumulatedDash += sliceLength;
      return {
        ...item,
        sliceLength,
        offset
      };
    });

  // Ensure active slice renders on top in SVG DOM order so expanded stroke is never clipped
  const sortedSlices = [...slices].sort((a, b) => {
    if (a.status === hoveredStatus) return 1;
    if (b.status === hoveredStatus) return -1;
    return 0;
  });

  const activeItem = hoveredStatus
    ? statusStats.find((s) => s.status === hoveredStatus)
    : null;

  return (
    <div
      className="doughnut-chart-container"
      onMouseLeave={() => setHoveredStatus(null)}
    >
      {/* Visual Doughnut SVG */}
      <div className="doughnut-svg-wrapper">
        <svg
          viewBox="0 0 180 180"
          className="doughnut-svg"
          role="img"
          aria-label="Lead status distribution doughnut chart"
          onMouseLeave={() => setHoveredStatus(null)}
        >
          {/* Base Background Track Ring */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />

          {/* Slices (rendered in sorted order so active slice is on top) */}
          {sortedSlices.map((slice) => {
            const isHovered = hoveredStatus === slice.status;
            return (
              <circle
                key={slice.status}
                cx="90"
                cy="90"
                r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth={isHovered ? strokeWidth + 5 : strokeWidth}
                strokeDasharray={`${slice.sliceLength} ${circumference}`}
                strokeDashoffset={-slice.offset}
                transform="rotate(-90 90 90)"
                className={`doughnut-slice ${isHovered ? 'slice-active' : ''}`}
                style={{
                  transition: 'stroke-width 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease, filter 0.2s ease',
                  opacity: hoveredStatus ? (isHovered ? 1 : 0.22) : 1,
                  filter: isHovered ? `drop-shadow(0 0 4px ${slice.color}99)` : 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={() => setHoveredStatus(slice.status)}
                onMouseLeave={() => setHoveredStatus(null)}
                tabIndex={0}
                role="button"
                aria-label={`${slice.status}: ${slice.count} leads (${slice.percentage.toFixed(1)}%)`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setHoveredStatus(slice.status);
                  }
                }}
              />
            );
          })}
        </svg>

        {/* Center Content */}
        <div className="doughnut-center-content" aria-hidden="true">
          <span
            className="doughnut-center-number"
            style={{
              color: activeItem ? activeItem.color : 'var(--text-primary)',
              transition: 'color 0.18s ease'
            }}
          >
            {activeItem ? activeItem.count : (slices.length > 0 ? totalTrackedStatusCount : (totalLeads === 0 ? 0 : 0))}
          </span>
          <span
            className="doughnut-center-label"
            style={{
              color: activeItem ? activeItem.color : 'var(--text-secondary)',
              transition: 'color 0.18s ease'
            }}
          >
            {activeItem ? activeItem.status : (slices.length > 0 ? 'Total Leads' : 'Status N/A')}
          </span>
        </div>
      </div>

      {/* Structured Legend */}
      <div
        className="doughnut-legend"
        role="list"
        aria-label="Lead statuses"
        onMouseLeave={() => setHoveredStatus(null)}
      >
        {statusStats.map((item) => {
          const isHovered = hoveredStatus === item.status;
          return (
            <div
              key={item.status}
              className={`doughnut-legend-row ${isHovered ? 'row-active' : ''}`}
              role="listitem"
              style={{
                backgroundColor: isHovered ? `${item.color}15` : 'transparent',
                borderLeft: isHovered ? `3px solid ${item.color}` : '3px solid transparent',
                opacity: hoveredStatus && !isHovered ? 0.55 : 1,
                transition: 'all 0.18s ease'
              }}
              onMouseEnter={() => setHoveredStatus(item.status)}
              onMouseLeave={() => setHoveredStatus(null)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setHoveredStatus(item.status);
                }
              }}
            >
              <div className="legend-name-group">
                <span
                  className="status-color-swatch"
                  style={{
                    backgroundColor: item.color,
                    transform: isHovered ? 'scale(1.3)' : 'scale(1)',
                    transition: 'transform 0.18s ease'
                  }}
                  aria-hidden="true"
                ></span>
                <span
                  className="status-name"
                  style={{
                    fontWeight: isHovered ? 700 : 500,
                    color: isHovered ? 'var(--text-primary)' : 'var(--text-primary)'
                  }}
                >
                  {item.status}
                </span>
              </div>
              <div className="legend-stat-group">
                <span
                  className="status-count"
                  style={{
                    color: isHovered ? item.color : 'var(--text-primary)',
                    fontWeight: isHovered ? 800 : 700,
                    transition: 'color 0.18s ease'
                  }}
                >
                  {item.count}
                </span>
                <span className="status-pct">({item.percentage.toFixed(1)}%)</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Transparent Information Notice for Unavailable Schema Field */}
      {slices.length === 0 && (
        <div style={{ width: '100%', textAlign: 'center', marginTop: '8px', fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
          {totalLeads === 0
            ? 'No lead records available for status breakdown.'
            : 'Lead status column is not present in the current Supabase database table schema.'}
        </div>
      )}
    </div>
  );
}
