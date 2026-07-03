import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { 
  Leaf, Sun, Moon, LogOut, Menu, X, LayoutDashboard, 
  PlusCircle, History, ShieldCheck
} from 'lucide-react';

const RootLayout: React.FC = () => {
  const { profile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error("Failed logging out:", err);
    }
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: 'Report Hotspot', path: '/report', icon: <PlusCircle className="w-4 h-4" /> },
    { name: 'My History', path: '/history', icon: <History className="w-4 h-4" /> },
  ];

  const isAdmin = profile?.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col transition-colors duration-300">
      
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md border-b border-slate-200 dark:border-dark-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <Link to="/dashboard" className="flex items-center gap-2 select-none group">
            <div className="p-1.5 bg-emerald-500 rounded-lg text-white group-hover:scale-105 transition-transform">
              <Leaf className="w-5 h-5 fill-white/20" />
            </div>
            <span className="font-display font-extrabold text-lg tracking-tight text-slate-800 dark:text-white">
              CleanAir Guardian
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition ${
                    active 
                      ? 'bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-800/40' 
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-450 dark:hover:text-slate-205 hover:bg-slate-100 dark:hover:bg-dark-800'
                  }`}
                >
                  {link.icon}
                  <span>{link.name}</span>
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition ${
                  location.pathname === '/admin'
                    ? 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800'
                    : 'text-purple-650 hover:bg-purple-50/50 border-purple-200 dark:border-purple-900/40 hover:text-purple-750 dark:text-purple-400'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Console</span>
              </Link>
            )}
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-slate-200 dark:border-dark-800 hover:bg-slate-100 dark:hover:bg-dark-800 transition"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-4.5 h-4.5 text-slate-600" />
              ) : (
                <Sun className="w-4.5 h-4.5 text-amber-400" />
              )}
            </button>

            {/* Profile Menu Trigger */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 focus:outline-none"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-blue-500 text-white font-bold flex items-center justify-center text-sm shadow-sm select-none">
                  {profile?.displayName?.charAt(0).toUpperCase() || 'C'}
                </div>
              </button>
              
              {profileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2.5 w-52 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-xl shadow-xl z-50 p-2 py-3 animate-fade-in font-sans">
                    <div className="px-3 pb-3 border-b border-slate-100 dark:border-dark-800 text-xs">
                      <p className="font-bold text-slate-800 dark:text-white truncate">{profile?.displayName}</p>
                      <p className="text-slate-400 truncate mt-0.5">{profile?.email}</p>
                      <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 dark:bg-dark-800 text-[8px] font-extrabold uppercase mt-1.5">
                        {profile?.role}
                      </span>
                    </div>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 pt-2 text-xs font-semibold text-slate-500 hover:text-red-500 flex items-center gap-2 mt-2 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden rounded-lg border border-slate-200 dark:border-dark-800 hover:bg-slate-100 dark:hover:bg-dark-800 transition"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div 
            className="w-64 max-w-xs h-full bg-white dark:bg-dark-900 p-6 flex flex-col justify-between font-sans border-r border-slate-200 dark:border-dark-800 shadow-2xl animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-8">
              <div className="flex items-center gap-2">
                <Leaf className="w-6 h-6 text-emerald-500" />
                <span className="font-display font-extrabold text-base text-slate-800 dark:text-white">CleanAir Menu</span>
              </div>

              <nav className="flex flex-col gap-2">
                {navLinks.map((link) => {
                  const active = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-bold uppercase transition ${
                        active 
                          ? 'bg-primary-500 text-white' 
                          : 'text-slate-550 hover:bg-slate-100 dark:hover:bg-dark-800 dark:text-slate-350'
                      }`}
                    >
                      {link.icon}
                      <span>{link.name}</span>
                    </Link>
                  );
                })}

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-bold uppercase transition border ${
                      location.pathname === '/admin'
                        ? 'bg-purple-500 text-white border-purple-500'
                        : 'text-purple-600 border-purple-200 dark:border-purple-800/80 hover:bg-purple-50/50 dark:text-purple-400'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Admin Console</span>
                  </Link>
                )}
              </nav>
            </div>

            <div className="border-t border-slate-150 dark:border-dark-800 pt-4 text-slate-400 text-xs">
              <p>Logged in as:</p>
              <p className="font-semibold text-slate-700 dark:text-white mt-1 truncate">{profile?.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main View Port Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer bar */}
      <footer className="border-t border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} CleanAir Guardian AI. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-slate-600 dark:hover:text-white transition">Privacy Policy</Link>
            <span>•</span>
            <a href="https://cloud.google.com" target="_blank" rel="noreferrer" className="hover:text-slate-600 dark:hover:text-white transition">Google Cloud Platform</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default RootLayout;
