import React from 'react';

export default function DotLeaderRow({ label, value, type, className = '' }) {
  const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value ?? '');

  return (
    <div className={`leader-row ${className}`}>
      <span className="label">
        {label}
        {type && <span className="ml-1 text-[0.65rem] opacity-60 font-mono">({type})</span>}
      </span>
      <span className="leader"></span>
      <span className="value truncate max-w-[60%]" title={displayValue}>
        {displayValue}
      </span>
    </div>
  );
}
