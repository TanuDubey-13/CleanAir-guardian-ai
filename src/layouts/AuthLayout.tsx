import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';

const AuthLayout: React.FC = () => {
  const { user, loading } = useAuth();

  // If already authenticated and email is verified, redirect to dashboard
  if (user && !loading && (user.emailVerified || !user.providerData.some(p => p.providerId === 'password'))) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 overflow-hidden relative font-sans">
      {/* Background blobs for premium depth */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-emerald-500/20 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-blue-500/20 blur-[120px]" />

      <div className="w-full max-w-6xl mx-4 my-8 grid md:grid-cols-12 rounded-2xl overflow-hidden glass-card z-10">
        
        {/* Left Side: Branding/Value Prop Panel */}
        <div className="hidden md:flex md:col-span-5 bg-gradient-to-br from-emerald-600 to-blue-700 p-12 flex-col justify-between text-white relative">
          <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <Leaf className="w-8 h-8 text-emerald-300 fill-emerald-300/20" />
              <span className="font-display font-bold text-2xl tracking-tight">CleanAir Guardian</span>
            </div>
            
            <h2 className="font-display font-bold text-4xl leading-tight mb-4">
              Protecting Our Streets & Air, Together.
            </h2>
            <p className="text-emerald-100 text-sm leading-relaxed">
              Use Gemini AI to analyze environmental hazards, report hotspots instantly, and help municipalities target cleanups effectively.
            </p>
          </div>

          <div className="relative z-10 text-xs text-emerald-200/70 border-t border-white/10 pt-6">
            Powered by Google Cloud, Gemini 2.x, and Firebase.
          </div>
        </div>

        {/* Right Side: Auth Form Panel */}
        <div className="col-span-12 md:col-span-7 bg-white dark:bg-dark-900 p-8 sm:p-12 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            <div className="md:hidden flex items-center gap-2 mb-8 justify-center">
              <Leaf className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <span className="font-display font-bold text-xl dark:text-white">CleanAir Guardian</span>
            </div>
            
            <Outlet />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
