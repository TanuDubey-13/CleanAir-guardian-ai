import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FcGoogle } from 'react-icons/fc';
import { User, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

const Register: React.FC = () => {
  const { registerWithEmail, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      await registerWithEmail(email, password, name);
      // Navigate to dashboard directly for hackathon frictionless flow
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('An account already exists with this email address.');
      } else {
        setError(err.message || 'An error occurred during registration.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center md:text-left mb-8">
        <h1 className="font-display font-bold text-3xl text-slate-800 dark:text-white mb-2">Create Account</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Join the platform and help clean up local hotspots.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-start gap-2 animate-shake">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2" htmlFor="name">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input
              id="name"
              type="text"
              required
              className="input-field pl-11"
              placeholder="Alex Green"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2" htmlFor="email">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input
              id="email"
              type="email"
              required
              className="input-field pl-11"
              placeholder="name@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2" htmlFor="password">
            Password (Min 6 chars)
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input
              id="password"
              type="password"
              required
              className="input-field pl-11"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2" htmlFor="confirm-password">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input
              id="confirm-password"
              type="password"
              required
              className="input-field pl-11"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3 mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Registering...</span>
            </>
          ) : (
            'Register'
          )}
        </button>
      </form>

      <div className="relative my-5 text-center">
        <hr className="border-slate-200 dark:border-dark-800" />
        <span className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 bg-white dark:bg-dark-900 px-3 text-xs text-slate-400 font-semibold uppercase tracking-wider">
          Or Register With
        </span>
      </div>

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 border border-slate-300 dark:border-dark-700 bg-white dark:bg-dark-900 text-slate-700 dark:text-slate-200 rounded-lg py-3 text-sm font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-dark-800 transition active:scale-[0.98] disabled:opacity-50"
      >
        <FcGoogle className="w-5 h-5" />
        <span>Google Account</span>
      </button>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
};

export default Register;
