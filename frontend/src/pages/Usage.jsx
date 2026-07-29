import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { ChartBarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { getUsageAnalyticsWithRange } from '../utils/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Usage = () => {
  const { theme } = useTheme();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await getUsageAnalyticsWithRange(timeRange);
        setAnalytics(data);
        setLoading(false);
      } catch (err) {
        setAnalytics({
          apiCallsOverTime: { labels: [], data: [] },
          requestsPerDocument: { labels: [], data: [] },
          errorVsSuccess: { success: 0, error: 0 },
          averageLatency: 0,
          totalApiCalls: 0,
          successRate: 100
        });
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-display font-semibold text-[var(--ink)] mb-6">Usage & Registry Audit</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--border)] border-t-[var(--accent-teal)]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-display font-semibold text-[var(--ink)] mb-6">Usage & Registry Audit</h1>
        <div className="p-4 rounded border bg-red-500/10 text-[var(--accent-red)] border-red-500/20">
          {error}
        </div>
      </div>
    );
  }

  const getChartOptions = (title) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: theme === 'dark' ? '#93A0AC' : '#5B6A78',
          font: { family: 'IBM Plex Sans', weight: '600', size: 11 }
        }
      },
      title: {
        display: true,
        text: title,
        color: theme === 'dark' ? '#E9E6DA' : '#1B2A3A',
        font: { family: 'Fraunces', weight: '600', size: 15 }
      }
    },
    scales: {
      x: {
        ticks: {
          color: theme === 'dark' ? '#93A0AC' : '#5B6A78',
          font: { family: 'IBM Plex Mono', size: 10 }
        },
        grid: {
          color: theme === 'dark' ? '#2B3542' : '#D9D3BE'
        }
      },
      y: {
        ticks: {
          color: theme === 'dark' ? '#93A0AC' : '#5B6A78',
          font: { family: 'IBM Plex Mono', size: 10 }
        },
        grid: {
          color: theme === 'dark' ? '#2B3542' : '#D9D3BE'
        }
      }
    }
  });

  const apiCallsChartData = {
    labels: analytics.apiCallsOverTime.labels,
    datasets: [
      {
        label: 'API Requests',
        data: analytics.apiCallsOverTime.data,
        borderColor: '#0F6E67',
        backgroundColor: 'rgba(15, 110, 103, 0.08)',
        tension: 0.35,
        fill: true,
        borderWidth: 2
      }
    ]
  };

  const requestsPerDocChartData = {
    labels: analytics.requestsPerDocument.labels,
    datasets: [
      {
        label: 'Requests',
        data: analytics.requestsPerDocument.data,
        backgroundColor: '#C98A2C',
        borderRadius: 4
      }
    ]
  };

  const errorSuccessChartData = {
    labels: ['Success', 'Error'],
    datasets: [
      {
        data: [analytics.errorVsSuccess.success, analytics.errorVsSuccess.error],
        backgroundColor: ['#0F6E67', '#B23A2E'],
        borderWidth: 0
      }
    ]
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-semibold text-[var(--ink)]">Usage & Registry Audit</h1>
          <p className="text-sm text-[var(--ink-muted)] mt-1 font-medium">Monitor document API query metrics in real-time.</p>
        </div>

        {/* Time filters switch */}
        <div className="flex items-center p-1 rounded border border-[var(--border)] bg-[var(--surface-sunken)]">
          {['7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                timeRange === range
                  ? 'bg-[var(--surface)] text-[var(--accent-teal)] shadow-sm'
                  : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards with Fraunces Numerals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">Total API Calls</p>
            <p className="text-3xl font-display font-semibold text-[var(--ink)]">
              {analytics.totalApiCalls}
            </p>
          </div>
          <div className="p-3.5 rounded-full border border-[var(--border)] bg-[var(--surface-sunken)] text-[var(--accent-teal)]">
            <ChartBarIcon className="h-6 w-6" />
          </div>
        </div>

        <div className="card p-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">Success Rate</p>
            <p className="text-3xl font-display font-semibold text-[var(--ink)]">
              {analytics.successRate}%
            </p>
          </div>
          <div className="p-3.5 rounded-full border border-[var(--border)] bg-[var(--surface-sunken)] text-[var(--accent-teal)]">
            <ArrowTrendingUpIcon className="h-6 w-6" />
          </div>
        </div>

        <div className="card p-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">Avg Latency</p>
            <p className="text-3xl font-display font-semibold text-[var(--ink)]">
              {analytics.averageLatency}ms
            </p>
          </div>
          <div className="p-3.5 rounded-full border border-[var(--border)] bg-[var(--surface-sunken)] text-[var(--accent-ochre)]">
            <ClockIcon className="h-6 w-6" />
          </div>
        </div>

        <div className="card p-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">Error Rate</p>
            <p className="text-3xl font-display font-semibold text-[var(--ink)]">
              {Math.max(0, 100 - analytics.successRate)}%
            </p>
          </div>
          <div className="p-3.5 rounded-full border border-[var(--border)] bg-[var(--surface-sunken)] text-[var(--accent-red)]">
            <ArrowTrendingDownIcon className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Endpoint Distribution Table */}
      <div className="card-static p-6">
        <h2 className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider mb-4">Endpoint Query Distribution</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th scope="col" className="table-header-premium">Endpoint</th>
                <th scope="col" className="table-header-premium text-right">Request Count</th>
              </tr>
            </thead>
            <tbody>
              {analytics.requestsPerDocument.labels.map((label, idx) => (
                <tr key={label} className="table-row-premium">
                  <td className="px-6 py-3 font-mono text-xs text-[var(--ink)]">{label}</td>
                  <td className="px-6 py-3 font-mono text-xs text-[var(--ink-muted)] text-right font-bold">
                    {analytics.requestsPerDocument.data[idx]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-static p-6">
          <div className="h-80 relative">
            <Line
              data={apiCallsChartData}
              options={getChartOptions('API Calls Over Time')}
            />
          </div>
        </div>

        <div className="card-static p-6">
          <div className="h-80 relative">
            <Bar
              data={requestsPerDocChartData}
              options={getChartOptions('Requests Per Document')}
            />
          </div>
        </div>

        <div className="card-static p-6 lg:col-span-2">
          <div className="h-80 relative max-w-md mx-auto">
            <Doughnut
              data={errorSuccessChartData}
              options={{
                ...getChartOptions('Error vs Success Rate'),
                maintainAspectRatio: false,
                plugins: {
                  ...getChartOptions('Error vs Success Rate').plugins,
                  legend: {
                    position: 'bottom',
                    labels: {
                      color: theme === 'dark' ? '#93A0AC' : '#5B6A78',
                      font: { family: 'IBM Plex Sans', weight: '600' }
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Usage;
