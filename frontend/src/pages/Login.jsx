import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import OAuth from '../components/OAuth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResetMessage('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      if (err.code === 'auth/user-not-found') {
        setError('No user found with this email address.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError('Failed to log in. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    setError('');
    setResetMessage('');
    try {
      await resetPassword(email);
      setResetMessage('Password reset email sent. Please check your inbox.');
    } catch (err) {
      console.error('Password reset error:', err);
      setError('Failed to send reset email. ' + (err.message || ''));
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-[var(--canvas)] text-[var(--ink)] overflow-hidden">
      <div className="card-static w-full max-w-md p-8 bg-[var(--surface)] border border-[var(--border)]">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-md border-2 border-[var(--accent-teal)] flex items-center justify-center bg-transparent mb-4">
            <DocumentTextIcon className="h-6 w-6 text-[var(--accent-teal)]" />
          </div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-[var(--ink)]">DOnC-key</h1>
          <p className="text-[var(--ink-muted)] text-sm mt-1.5 font-medium">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded text-sm border bg-red-500/10 text-[var(--accent-red)] border-red-500/20">
            {error}
          </div>
        )}

        {resetMessage && (
          <div className="mb-5 p-3.5 rounded text-sm border bg-teal-500/10 text-[var(--accent-teal)] border-teal-500/20">
            {resetMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)] mb-1.5">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)] mb-1.5">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-[var(--border)] text-[var(--accent-teal)] focus:ring-[var(--accent-teal)] bg-[var(--surface)]"
              />
              <label htmlFor="remember-me" className="ml-2 block text-[var(--ink-muted)] font-medium">
                Remember me
              </label>
            </div>

            <div>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="font-semibold text-[var(--accent-teal)] hover:underline"
              >
                Forgot password?
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--border)]"></div>
          </div>
          <div className="relative flex justify-center text-xs font-bold uppercase tracking-wider">
            <span className="bg-[var(--surface)] px-3 text-[var(--ink-muted)]">Or continue with</span>
          </div>
        </div>

        <div className="mt-4">
          <OAuth />
        </div>

        <div className="mt-8 text-center text-sm font-medium">
          <p className="text-[var(--ink-muted)]">
            Don't have an account?{' '}
            <Link to="/signup" className="font-bold text-[var(--accent-teal)] hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
