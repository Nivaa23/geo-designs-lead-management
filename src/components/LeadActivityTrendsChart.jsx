import React, { useState, useRef } from 'react';

export default function LeadActivityTrendsChart({ trendData, period }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const containerRef = useRef(null);

  if (!trendData || !trendData.labels || trendData.labels.length === 0) {
    return (
      <div className="chart-empty-state">
        <p className="text-muted">No activity data available for the selected period.</p>
      </div>
    );
  }

  const { labels, currentSeries, previousSeries, details } = trendData;
  const hasPrevious = Array.isArray(previousSeries) && previousSeries.length > 0;

  // ViewBox layout dimensions
  const svgWidth = 800;
  const svgHeight = 240;
  const padLeft = 45;
  const padRight = 30;
  const padTop = 25;
  const padBottom = 40;

  const plotWidth = svgWidth - padLeft - padRight;
  const plotHeight = svgHeight - padTop - padBottom;

  // Calculate clean Y scale
  const allValues = [...currentSeries, ...(hasPrevious ? previousSeries : [])];
  const rawMax = Math.max(...allValues, 1);
  const maxVal = Math.max(Math.ceil(rawMax * 1.15), 3);

  // Y Axis ticks (4 levels)
  const yTicks = [0, Math.round(maxVal * 0.33), Math.round(maxVal * 0.66), maxVal];
  const uniqueYTicks = Array.from(new Set(yTicks)).sort((a, b) => a - b);

  // Calculate coordinates for each point
  const n = labels.length;
  const points = labels.map((label, i) => {
    const x = padLeft + (n > 1 ? (i / (n - 1)) * plotWidth : plotWidth / 2);
    const curVal = currentSeries[i] || 0;
    const yCur = padTop + plotHeight - (curVal / maxVal) * plotHeight;

    const prevVal = hasPrevious ? (previousSeries[i] || 0) : 0;
    const yPrev = padTop + plotHeight - (prevVal / maxVal) * plotHeight;

    return {
      x,
      yCur,
      yPrev,
      curVal,
      prevVal,
      label,
      detail: details ? details[i] : null
    };
  });

  // Construct SVG paths
  const curLinePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.yCur.toFixed(1)}`).join(' ');
  const curAreaPath = `${curLinePath} L ${points[points.length - 1].x.toFixed(1)} ${(padTop + plotHeight).toFixed(1)} L ${points[0].x.toFixed(1)} ${(padTop + plotHeight).toFixed(1)} Z`;

  const prevLinePath = hasPrevious
    ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.yPrev.toFixed(1)}`).join(' ')
    : null;

  // Hover detection handler
  const handleMouseMove = (e) => {
    if (!containerRef.current || points.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const relativeX = (mouseX / rect.width) * svgWidth;

    let closestIdx = 0;
    let minDistance = Infinity;

    points.forEach((p, idx) => {
      const dist = Math.abs(p.x - relativeX);
      if (dist < minDistance) {
        minDistance = dist;
        closestIdx = idx;
      }
    });

    setHoveredIndex(closestIdx);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  const activePoint = hoveredIndex !== null && points[hoveredIndex] ? points[hoveredIndex] : null;

  // Label skip interval for dense time-series (e.g. 31 days in a month)
  const shouldShowXLabel = (index) => {
    if (n <= 12) return true;
    if (n <= 16) return index % 2 === 0 || index === n - 1;
    // For 30-31 days
    return index === 0 || index === 4 || index === 9 || index === 14 || index === 19 || index === 24 || index === n - 1;
  };

  return (
    <div className="trends-chart-wrapper" ref={containerRef}>
      {/* Chart Legend */}
      <div className="trends-chart-legend">
        <div className="legend-item">
          <span className="legend-line-current" aria-hidden="true"></span>
          <span className="legend-label">New Leads</span>
        </div>
        {hasPrevious && (
          <div className="legend-item">
            <span className="legend-line-previous" aria-hidden="true"></span>
            <span className="legend-label">Previous Period</span>
          </div>
        )}
      </div>

      {/* SVG Canvas */}
      <div className="trends-svg-container">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="trends-svg"
          preserveAspectRatio="none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          role="img"
          aria-label={`Lead activity trends line chart for ${period}`}
        >
          <defs>
            <linearGradient id="trendsAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines and Y Labels */}
          {uniqueYTicks.map((tickVal) => {
            const yPos = padTop + plotHeight - (tickVal / maxVal) * plotHeight;
            return (
              <g key={tickVal} className="grid-group">
                <line
                  x1={padLeft}
                  y1={yPos}
                  x2={svgWidth - padRight}
                  y2={yPos}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 10}
                  y={yPos + 4}
                  textAnchor="end"
                  className="axis-tick-text"
                >
                  {tickVal}
                </text>
              </g>
            );
          })}

          {/* Area Fill for Current Period */}
          <path d={curAreaPath} fill="url(#trendsAreaGradient)" />

          {/* Previous Period Line (Dashed) */}
          {hasPrevious && prevLinePath && (
            <path
              d={prevLinePath}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2"
              strokeDasharray="4 4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Current Period Line (Solid Indigo) */}
          <path
            d={curLinePath}
            fill="none"
            stroke="#4f46e5"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Previous Period Circles */}
          {hasPrevious &&
            points.map((p, i) => (
              <circle
                key={`prev-${i}`}
                cx={p.x}
                cy={p.yPrev}
                r={hoveredIndex === i ? 4.5 : 2.5}
                fill="#ffffff"
                stroke="#94a3b8"
                strokeWidth={hoveredIndex === i ? 2 : 1.5}
              />
            ))}

          {/* Current Period Circles */}
          {points.map((p, i) => (
            <circle
              key={`cur-${i}`}
              cx={p.x}
              cy={p.yCur}
              r={hoveredIndex === i ? 5.5 : 3.5}
              fill="#ffffff"
              stroke="#4f46e5"
              strokeWidth={hoveredIndex === i ? 2.5 : 2}
            />
          ))}

          {/* Active Hover Guide Line */}
          {activePoint && (
            <line
              x1={activePoint.x}
              y1={padTop}
              x2={activePoint.x}
              y2={padTop + plotHeight}
              stroke="#cbd5e1"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          )}

          {/* X Axis Labels */}
          {points.map((p, i) => {
            if (!shouldShowXLabel(i)) return null;
            return (
              <text
                key={`label-${i}`}
                x={p.x}
                y={svgHeight - 12}
                textAnchor="middle"
                className="axis-tick-text"
              >
                {p.label}
              </text>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {activePoint && (
          <div
            className="trends-tooltip"
            style={{
              left: `${(activePoint.x / svgWidth) * 100}%`,
              transform: activePoint.x > svgWidth * 0.75 ? 'translate(-100%, -115%)' : 'translate(0%, -115%)'
            }}
          >
            <div className="trends-tooltip-header">
              {activePoint.detail ? activePoint.detail.curDateStr : activePoint.label}
            </div>
            <div className="trends-tooltip-row">
              <span className="tooltip-indicator indicator-current"></span>
              <span className="tooltip-name">New Leads:</span>
              <strong className="tooltip-val">{activePoint.curVal}</strong>
            </div>
            {hasPrevious && (
              <div className="trends-tooltip-row">
                <span className="tooltip-indicator indicator-previous"></span>
                <span className="tooltip-name">Previous:</span>
                <strong className="tooltip-val">{activePoint.prevVal}</strong>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
