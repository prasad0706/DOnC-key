import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { ChartBarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { getUsageAnalytics } from '../utils/api';

// Register ChartJS components
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
        // Mock data - in a real app, this would be the API call
        const mockAnalytics = {
          apiCallsOverTime: {
            labels: ['Jan 1', 'Jan 8', 'Jan 15', 'Jan 22', 'Jan 29', 'Feb 5', 'Feb 12'],
            data: [12, 19, 8, 15, 22, 18, 25]
          },
          requestsPerDocument: {
            labels: ['Invoice.pdf', 'Contract.docx', 'Report.xlsx', 'Manual.pdf', 'Catalog.pdf'],
            data: [15, 8, 12, 6, 10]
          },
          errorVsSuccess: {
            success: 47,
            error: 3
          },
          averageLatency: 450, // in ms
          totalApiCalls: 50,
          successRate: 94.0
        };

        setAnalytics(mockAnalytics);
        setLoading(false);

        // Real API call would be:
        // const data = await getUsageAnalytics();
        // setAnalytics(data);
      } catch (err) {
        setError('Failed to fetch usage analytics');
        setLoading(false);
        console.error('Error fetching analytics:', err);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Usage Analytics</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Usage Analytics</h1>
        <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-red-900/20 text-red-400' : 'bg-red-100 text-red-700'}`}>
          {error}
        </div>
      </div>
    );
  }

  // Chart options for dark/light theme
  const getChartOptions = (title) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: theme === 'dark' ? '#ffffff' : '#4b5563'
        }
      },
      title: {
        display: true,
        text: title,
        color: theme === 'dark' ? '#ffffff' : '#1f2937',
        font: {
          size: 16
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: theme === 'dark' ? '#9ca3af' : '#6b7280'
        },
        grid: {
          color: theme === 'dark' ? '#374151' : '#e5e7eb'
        }
      },
      y: {
        ticks: {
          color: theme === 'dark' ? '#9ca3af' : '#6b7280'
        },
        grid: {
          color: theme === 'dark' ? '#374151' : '#e5e7eb'
        }
      }
    }
  });

  // API Calls Over Time Chart
  const apiCallsChartData = {
    labels: analytics.apiCallsOverTime.labels,
    datasets: [
      {
        label: 'API Calls',
        data: analytics.apiCallsOverTime.data,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  // Requests Per Document Chart
  const requestsPerDocChartData = {
    labels: analytics.requestsPerDocument.labels,
    datasets: [
      {
        label: 'Requests',
        data: analytics.requestsPerDocument.data,
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
        borderWidth: 1
      }
    ]
  };

  // Error vs Success Chart
  const errorSuccessChartData = {
    labels: ['Success', 'Error'],
    datasets: [
      {
        data: [analytics.errorVsSuccess.success, analytics.errorVsSuccess.error],
        backgroundColor: ['#10b981', '#ef4444'],
        borderWidth: 0
      }
    ]
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Usage Analytics</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-3 py-1 rounded-md text-sm ${timeRange === '7d' ? 'bg-blue-600 text-white' : theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            7D
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-3 py-1 rounded-md text-sm ${timeRange === '30d' ? 'bg-blue-600 text-white' : theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            30D
          </button>
          <button
            onClick={() => setTimeRange('90d')}
            className={`px-3 py-1 rounded-md text-sm ${timeRange === '90d' ? 'bg-blue-600 text-white' : theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            90D
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total API Calls */}
        <div className={`p-6 rounded-lg shadow-sm ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Total API Calls</p>
              <p className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {analytics.totalApiCalls}
              </p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        {/* Success Rate */}
        <div className={`p-6 rounded-lg shadow-sm ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Success Rate</p>
              <p className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {analytics.successRate}%
              </p>
            </div>
            <div className="flex items-center">
              <ArrowTrendingUpIcon className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Average Latency */}
        <div className={`p-6 rounded-lg shadow-sm ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Avg Latency</p>
              <p className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {analytics.averageLatency}ms
              </p>
            </div>
            <ClockIcon className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        {/* Error Rate */}
        <div className={`p-6 rounded-lg shadow-sm ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Error Rate</p>
              <p className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {100 - analytics.successRate}%
              </p>
            </div>
            <div className="flex items-center">
              <ArrowTrendingDownIcon className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* API Calls Over Time */}
        <div className={`p-6 rounded-lg shadow-sm ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="h-80">
            <Line
              data={apiCallsChartData}
              options={getChartOptions('API Calls Over Time')}
            />
          </div>
        </div>

        {/* Requests Per Document */}
        <div className={`p-6 rounded-lg shadow-sm ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="h-80">
            <Bar
              data={requestsPerDocChartData}
              options={getChartOptions('Requests Per Document')}
            />
          </div>
        </div>

        {/* Error vs Success */}
        <div className={`p-6 rounded-lg shadow-sm ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="h-80">
            <Doughnut
              data={errorSuccessChartData}
              options={getChartOptions('Error vs Success Rate')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Usage;
