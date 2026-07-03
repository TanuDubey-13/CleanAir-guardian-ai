import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { auth } from '../firebase/config';
import { MailOpen, Loader2, RefreshCw, LogOut } from 'lucide-react';

const EmailVerification: React.FC = () => {
  const { user, sendVerification, logout } = useAuth();
  const navigate = useNavigate();
  
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Redirect instantly if email gets verified
  useEffect(() => {
    if (user && user.emailVerified) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const checkStatus = async () => {
    setChecking(true);
    setFeedback(null);
    try {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        if (auth.currentUser.emailVerified) {
          // Force location replace to dashboard
          window.location.href = '/dashboard';
        } else {
          setFeedback({
            type: 'error',
            text: 'Your email address is still not verified. Please check your inbox or spam folder.'
          });
        }
      }
    } catch (err: any) {
      console.error(err);
      setFeedback({
        type: 'error',
        text: err.message || 'Failed to refresh login status.'
      });
    } finally {
      setChecking(false);
    }
  };

  const resendEmail = async () => {
    setResending(true);
    setFeedback(null);
    try {
      await sendVerification();
      setFeedback({
        type: 'success',
        text: 'A new verification link has been sent to your email.'
      });
    } catch (err: any) {
      console.error(err);
      setFeedback({
        type: 'error',
        text: err.message || 'Failed to resend verification email.'
      });
    } finally {
      setResending(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="text-center font-sans">
      <div className="flex justify-center mb-6">
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-full text-emerald-600 dark:text-emerald-400">
          <MailOpen className="w-12 h-12" />
        </div>
      </div>

      <h1 className="font-display font-bold text-3xl text-slate-800 dark:text-white mb-3">Verify Your Email</h1>
      
      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 max-w-sm mx-auto">
        We sent a verification link to <strong className="text-slate-700 dark:text-slate-200">{user?.email}</strong>. 
        Please verify your email to unlock all features.
      </p>

      {feedback && (
        <div className={`mb-6 p-4 border rounded-lg text-sm text-left ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400' 
            : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400'
        }`}>
          {feedback.text}
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={checkStatus}
          disabled={checking}
          className="btn-primary w-full py-3"
        >
          {checking ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Checking...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>I Have Verified My Email</span>
            </>
          )}
        </button>

        <button
          onClick={resendEmail}
          disabled={resending}
          className="btn-outline w-full py-3"
        >
          {resending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Resend Verification Link'
          )}
        </button>
      </div>

      <button
        onClick={handleSignOut}
        className="mt-8 text-xs font-semibold text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 flex items-center gap-1 mx-auto transition"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>Sign Out & Back to Login</span>
      </button>
    </div>
  );
};

export default EmailVerification;
