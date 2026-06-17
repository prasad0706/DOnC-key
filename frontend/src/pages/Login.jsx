import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import OAuth from '../components/OAuth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
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

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#090d16] text-slate-800 dark:text-slate-200 transition-colors duration-300 overflow-hidden">
      {/* Background Spotlight Glows */}
      <div className="glow-spotlight glow-blue w-[400px] h-[400px] top-[10%] left-[10%]" />
      <div className="glow-spotlight glow-purple w-[450px] h-[450px] bottom-[10%] right-[10%]" />

      <div className="card-premium-no-hover w-full max-w-md p-8 backdrop-blur-md bg-white/80 dark:bg-[#0f172a]/80">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25 mb-4">
            <DocumentTextIcon className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">DOnC-key</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 font-medium">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl text-sm border bg-rose-50 text-rose-700 border-rose-200/50 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
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
              className="input-premium"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
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
              className="input-premium"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-800 text-blue-600 focus:ring-blue-500 bg-white dark:bg-slate-900"
              />
              <label htmlFor="remember-me" className="ml-2 block text-slate-600 dark:text-slate-400 font-medium">
                Remember me
              </label>
            </div>

            <div>
              <Link to="/forgot-password" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                Forgot password?
              </Link>
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
            <div className="w-full border-t border-slate-100 dark:border-slate-800/80"></div>
          </div>
          <div className="relative flex justify-center text-xs font-bold uppercase tracking-wider">
            <span className="bg-white dark:bg-[#0f172a] px-3 text-slate-400">Or continue with</span>
          </div>
        </div>

        <div className="mt-4">
          <OAuth />
        </div>

        <div className="mt-8 text-center text-sm font-medium">
          <p className="text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/signup" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
