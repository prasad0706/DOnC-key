import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  TrashIcon, 
  PlusIcon
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
        <div className="p-4 rounded text-sm bg-red-500/10 text-[var(--accent-red)] border border-red-500/20">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded text-sm bg-teal-500/10 text-[var(--accent-teal)] border border-teal-500/20">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Webhooks List (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="card-static p-6">
            <h2 className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider mb-4">Active Webhook Subscriptions</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th scope="col" className="table-header-premium">Endpoint URL</th>
                    <th scope="col" className="table-header-premium">Events</th>
                    <th scope="col" className="table-header-premium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="3" className="px-6 py-6 text-center text-xs font-mono text-[var(--ink-muted)]">
                        Loading subscriptions...
                      </td>
                    </tr>
                  ) : webhooks.length > 0 ? (
                    webhooks.map((webhook) => (
                      <tr key={webhook._id} className="table-row-premium">
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-[var(--ink)] truncate max-w-[200px]" title={webhook.url}>
                          {webhook.url}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[10px] font-mono text-[var(--ink-muted)]">
                          {webhook.events.join(', ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                          <button
                            onClick={() => handleDelete(webhook._id)}
                            className="btn-danger p-1"
                            title="Delete Webhook"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-xs font-mono text-[var(--ink-muted)]">
                        No active webhooks registered for this case file project.
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
          <form onSubmit={handleCreate} className="card-static p-6 space-y-5">
            <h2 className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider">Register Webhook Endpoint</h2>
            
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                Endpoint URL
              </label>
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://yourdomain.com/webhooks"
                className="input font-mono"
                required
                disabled={submitting}
              />
            </div>

            <div className="space-y-2.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                Trigger Events
              </label>
              
              <div className="space-y-2">
                <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-medium text-[var(--ink-muted)]">
                  <input
                    type="checkbox"
                    checked={events['document.ready']}
                    onChange={() => handleCheckboxChange('document.ready')}
                    className="rounded border-[var(--border)] text-[var(--accent-teal)] focus:ring-[var(--accent-teal)]"
                    disabled={submitting}
                  />
                  <span className="font-mono">document.ready</span>
                </label>

                <label className="flex items-center space-x-2.5 cursor-pointer text-xs font-medium text-[var(--ink-muted)]">
                  <input
                    type="checkbox"
                    checked={events['document.failed']}
                    onChange={() => handleCheckboxChange('document.failed')}
                    className="rounded border-[var(--border)] text-[var(--accent-teal)] focus:ring-[var(--accent-teal)]"
                    disabled={submitting}
                  />
                  <span className="font-mono">document.failed</span>
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
