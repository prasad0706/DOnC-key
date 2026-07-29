import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import OAuth from '../components/OAuth';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password should be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await signup(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Signup error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email address is already in use.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Email/password accounts are not enabled.');
      } else {
        setError('Failed to create an account. Please try again.');
      }
    } finally {
      setLoading(false);
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
          <p className="text-[var(--ink-muted)] text-sm mt-1.5 font-medium">Create your account</p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded text-sm border bg-red-500/10 text-[var(--accent-red)] border-red-500/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
            />
            <p className="text-[10px] text-[var(--ink-muted)] mt-1 font-medium">Minimum 6 characters</p>
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)] mb-1.5">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 mt-2"
          >
            {loading ? 'Creating account...' : 'Sign up'}
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
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[var(--accent-teal)] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
