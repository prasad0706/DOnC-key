import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  ClockIcon, 
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import api from '../utils/api';

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

      // Compute statistics
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
        <div className="card-premium-no-hover p-5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Requests</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-2">{stats.total}</span>
        </div>
        <div className="card-premium-no-hover p-5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Avg Latency</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-2">{stats.avgLatency} ms</span>
        </div>
        <div className="card-premium-no-hover p-5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Success Rate</span>
          <span className={`text-2xl font-black mt-2 ${stats.successRate >= 90 ? 'text-emerald-500' : 'text-amber-500'}`}>
            {stats.successRate}%
          </span>
        </div>
      </div>

      {/* Logs Table Card */}
      <div className="card-premium-no-hover p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-md font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">Request History</h2>
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="btn-secondary p-2 rounded-xl flex items-center justify-center"
            title="Refresh logs"
          >
            <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl border text-sm bg-rose-50 text-rose-700 border-rose-200/50 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 mb-4">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800/40">
            <thead>
              <tr>
                <th scope="col" className="table-header-premium">Timestamp</th>
                <th scope="col" className="table-header-premium">Method</th>
                <th scope="col" className="table-header-premium">Endpoint</th>
                <th scope="col" className="table-header-premium">Status</th>
                <th scope="col" className="table-header-premium text-right">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-6 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Fetching API log audits...
                  </td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log._id} className="table-row-premium">
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        log.method === 'GET' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
                      }`}>
                        {log.method}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-700 dark:text-slate-300 truncate max-w-xs" title={log.endpoint}>
                      {log.endpoint}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge-premium ${
                        log.statusCode >= 200 && log.statusCode < 300
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/50'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200/50'
                      }`}>
                        {log.statusCode >= 200 && log.statusCode < 300 ? (
                          <CheckCircleIcon className="h-3.5 w-3.5 mr-1" />
                        ) : (
                          <XCircleIcon className="h-3.5 w-3.5 mr-1" />
                        )}
                        {log.statusCode}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-mono text-slate-600 dark:text-slate-400">
                      {log.latencyMs} ms
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                    No requests logged yet. Invoke the playground to populate logs.
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
