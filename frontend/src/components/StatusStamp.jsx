import React, { useState, useEffect, useRef } from 'react';

export default function StatusStamp({ status, className = '', label, children }) {
  const normalizedStatus = (status || 'queued').toLowerCase();
  const [justLanded, setJustLanded] = useState(false);
  const prevStatusRef = useRef(normalizedStatus);

  useEffect(() => {
    if (prevStatusRef.current !== normalizedStatus) {
      setJustLanded(true);
      const timer = setTimeout(() => {
        setJustLanded(false);
      }, 300);
      prevStatusRef.current = normalizedStatus;
      return () => clearTimeout(timer);
    }
  }, [normalizedStatus]);

  let statusClass = 'stamp--queued';
  if (normalizedStatus === 'ready' || normalizedStatus === 'success' || normalizedStatus === 'completed' || normalizedStatus === '200' || normalizedStatus === '201') {
    statusClass = 'stamp--ready';
  } else if (normalizedStatus === 'processing' || normalizedStatus === 'pending') {
    statusClass = 'stamp--processing';
  } else if (normalizedStatus === 'failed' || normalizedStatus === 'error' || normalizedStatus === '500' || normalizedStatus === '404' || normalizedStatus === '400') {
    statusClass = 'stamp--failed';
  }

  const displayLabel = label || children || normalizedStatus.toUpperCase();

  return (
    <span className={`stamp ${statusClass} ${justLanded ? 'stamp--just-landed' : ''} ${className}`}>
      {displayLabel}
    </span>
  );
}
