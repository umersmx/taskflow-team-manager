import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Menu, LogOut, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { tasksAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [reminderCount, setReminderCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    loadReminders();
    const interval = setInterval(loadReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  async function loadReminders() {
    try {
      const res = await tasksAPI.getReminders();
      setReminderCount((res.data.overdue?.length || 0) + (res.data.upcoming?.length || 0));
    } catch {
      // Ignore
    }
  }

  async function handleLogout() {
    try {
      await logout();
      toast.success('Logged out');
      navigate('/login');
    } catch {
      toast.error('Failed to log out');
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-surface-900/95 border-b border-surface-700/30 shadow-sm isolate">
      <div className="flex items-center justify-between px-4 md:px-6 h-16">
        {/* Left: Mobile menu */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-surface-700/50 text-surface-400 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Right section */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Reminders bell */}
          <button
            onClick={() => navigate('/dashboard')}
            className="relative p-2.5 rounded-xl hover:bg-surface-700/50 text-surface-400 hover:text-surface-200 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {reminderCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-danger-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse-soft">
                {reminderCount > 9 ? '9+' : reminderCount}
              </span>
            )}
          </button>

          {/* User dropdown */}
          <div className="relative z-50">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-surface-700/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full gradient-accent flex items-center justify-center text-sm font-bold text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="hidden md:block text-sm font-medium text-surface-200">
                {user?.name}
              </span>
            </button>

            {showDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-surface-900 rounded-xl shadow-xl shadow-black/10 border border-surface-700/50 z-50 animate-scale-in overflow-hidden">
                  <div className="p-3 border-b border-surface-700/30">
                    <p className="text-sm font-medium text-surface-50">{user?.name}</p>
                    <p className="text-xs text-surface-400 truncate">{user?.email}</p>
                  </div>
                  <div className="p-1.5">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-danger-400 hover:bg-danger-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
