import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  CloudArrowUpIcon, 
  TrashIcon, 
  PlusIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { getWebhooks, createWebhook, deleteWebhook } from '../utils/api';

const WebhookSettingsTab = ({ projectId }) => {
  const { theme } = useTheme();
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // New webhook form state
  const [newUrl, setNewUrl] = useState('');
  const [events, setEvents] = useState({
    'document.ready': true,
    'document.failed': true
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchWebhooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWebhooks(projectId);
      setWebhooks(data);
    } catch (err) {
      console.error('Failed to load webhooks:', err);
      setError('Failed to retrieve webhooks registrations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchWebhooks();
    }
  }, [projectId]);

  const handleCheckboxChange = (eventKey) => {
    setEvents(prev => ({
      ...prev,
      [eventKey]: !prev[eventKey]
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const activeEvents = Object.keys(events).filter(k => events[k]);

    try {
      const created = await createWebhook({
        url: newUrl.trim(),
        events: activeEvents,
        projectId
      });

      setWebhooks(prev => [created, ...prev]);
      setNewUrl('');
      setSuccess('Webhook endpoint registered successfully.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to create webhook:', err);
      setError(err.response?.data?.error || 'Failed to register webhook.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this webhook subscription?')) {
      try {
        await deleteWebhook(id);
        setWebhooks(prev => prev.filter(w => w._id !== id));
        setSuccess('Webhook deleted.');
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        console.error('Failed to delete webhook:', err);
        setError('Failed to delete webhook.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 rounded-xl border text-sm bg-rose-50 text-rose-700 border-rose-200/50 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl border text-sm bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Webhooks List (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="card-premium-no-hover p-6">
            <h2 className="text-md font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs mb-4">Active Subscriptions</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800/40">
                <thead>
                  <tr>
                    <th scope="col" className="table-header-premium">Endpoint URL</th>
                    <th scope="col" className="table-header-premium">Events</th>
                    <th scope="col" className="table-header-premium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                  {loading ? (
                    <tr>
                      <td colSpan="3" className="px-6 py-6 text-center text-xs font-semibold text-slate-400 dark:text-slate-500">
                        Loading subscriptions...
                      </td>
                    </tr>
                  ) : webhooks.length > 0 ? (
                    webhooks.map((webhook) => (
                      <tr key={webhook._id} className="table-row-premium">
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]" title={webhook.url}>
                          {webhook.url}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[10px] font-mono text-slate-500 dark:text-slate-400">
                          {webhook.events.join(', ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                          <button
                            onClick={() => handleDelete(webhook._id)}
                            className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors p-1"
                          >
                            <TrashIcon className="h-4.5 w-4.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-xs font-semibold text-slate-400 dark:text-slate-500">
                        No active webhooks configured for this project.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Add Webhook Form (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleCreate} className="card-premium-no-hover p-6 space-y-5">
            <h2 className="text-md font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">Register Webhook</h2>
            
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Endpoint URL
              </label>
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://yourdomain.com/webhooks"
                className="input-premium"
                required
                disabled={submitting}
              />
            </div>

            <div className="space-y-2.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Trigger Events
              </label>
              
              <div className="space-y-2">
                <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={events['document.ready']}
                    onChange={() => handleCheckboxChange('document.ready')}
                    className="rounded border-slate-300 dark:border-slate-800 text-blue-600 focus:ring-blue-500"
                    disabled={submitting}
                  />
                  <span>document.ready</span>
                </label>

                <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={events['document.failed']}
                    onChange={() => handleCheckboxChange('document.failed')}
                    className="rounded border-slate-300 dark:border-slate-800 text-blue-600 focus:ring-blue-500"
                    disabled={submitting}
                  />
                  <span>document.failed</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !newUrl.trim() || (!events['document.ready'] && !events['document.failed'])}
              className="w-full btn-primary py-2.5 text-xs flex items-center justify-center space-x-1.5"
            >
              <PlusIcon className="h-4 w-4" />
              <span>{submitting ? 'Registering...' : 'Add Webhook'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WebhookSettingsTab;
