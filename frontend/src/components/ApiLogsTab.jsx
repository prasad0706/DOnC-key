import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import api from '../utils/api';
import StatusStamp from './StatusStamp';

const ApiLogsTab = ({ documentId }) => {
  const { theme } = useTheme();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    avgLatency: 0,
    successRate: 0
  });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/logs/${documentId}/logs`);
      const logsData = response.data.logs || [];
      setLogs(logsData);

      if (logsData.length > 0) {
        const total = response.data.total || logsData.length;
        const totalLatency = logsData.reduce((acc, curr) => acc + curr.latencyMs, 0);
        const avgLatency = Math.round(totalLatency / logsData.length);
        const successful = logsData.filter(l => l.statusCode >= 200 && l.statusCode < 300).length;
        const successRate = Math.round((successful / logsData.length) * 100);

        setStats({
          total,
          avgLatency,
          successRate
        });
      } else {
        setStats({ total: 0, avgLatency: 0, successRate: 0 });
      }
    } catch (err) {
      console.error('Failed to load API logs:', err);
      setError('Failed to fetch request history logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (documentId) {
      fetchLogs();
    }
  }, [documentId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="card-static p-5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-wider">Total Requests</span>
          <span className="text-2xl font-display font-semibold text-[var(--ink)] mt-2">{stats.total}</span>
        </div>
        <div className="card-static p-5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-wider">Avg Latency</span>
          <span className="text-2xl font-display font-semibold text-[var(--ink)] mt-2">{stats.avgLatency} ms</span>
        </div>
        <div className="card-static p-5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-wider">Success Rate</span>
          <span className={`text-2xl font-display font-semibold mt-2 ${stats.successRate >= 90 ? 'text-[var(--accent-teal)]' : 'text-[var(--accent-ochre)]'}`}>
            {stats.successRate}%
          </span>
        </div>
      </div>

      {/* Logs Table Card */}
      <div className="card-static p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider">Request Audit Log</h2>
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="btn-secondary p-2 flex items-center justify-center"
            title="Refresh logs"
          >
            <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {error && (
          <div className="p-4 rounded text-sm bg-red-500/10 text-[var(--accent-red)] border border-red-500/20 mb-4">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th scope="col" className="table-header-premium">Timestamp</th>
                <th scope="col" className="table-header-premium">Method</th>
                <th scope="col" className="table-header-premium">Endpoint</th>
                <th scope="col" className="table-header-premium">Ink Status Stamp</th>
                <th scope="col" className="table-header-premium text-right">Latency</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-6 text-center text-xs font-mono text-[var(--ink-muted)]">
                    Fetching API log audit records...
                  </td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log._id} className="table-row-premium">
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-[var(--ink-muted)]">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-[var(--surface-sunken)] border border-[var(--border)] text-[var(--accent-teal)]">
                        {log.method}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-[var(--ink)] truncate max-w-xs" title={log.endpoint}>
                      {log.endpoint}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusStamp
                        status={log.statusCode >= 200 && log.statusCode < 300 ? 'ready' : 'failed'}
                        label={`${log.statusCode}`}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-mono text-[var(--ink-muted)]">
                      {log.latencyMs} ms
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-xs font-mono text-[var(--ink-muted)]">
                    No requests logged yet in registry.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ApiLogsTab;
