import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { teamsAPI } from '../../services/api';
import {
  LayoutDashboard, Users, ChevronLeft, ChevronRight,
  Plus, Sparkles, X, Crown, Shield, User
} from 'lucide-react';

export default function Sidebar({ isOpen, isCollapsed, onClose, onToggleCollapse }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    loadTeams();
  }, []);

  async function loadTeams() {
    try {
      const res = await teamsAPI.getAll();
      setTeams(res.data.teams);
    } catch {
      // Silently fail — teams will show empty
    }
  }

  // Listen for custom events to refresh teams
  useEffect(() => {
    function handleRefresh() { loadTeams(); }
    window.addEventListener('teams-updated', handleRefresh);
    return () => window.removeEventListener('teams-updated', handleRefresh);
  }, []);

  const roleIcon = (role) => {
    if (role === 'owner') return <Crown className="w-3 h-3 text-warning-400" />;
    if (role === 'admin') return <Shield className="w-3 h-3 text-primary-400" />;
    return <User className="w-3 h-3 text-surface-500" />;
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-full z-50 glass border-r border-surface-700/30 transition-all duration-300 flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        ${isCollapsed ? 'w-20' : 'w-72'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-surface-700/30">
        {!isCollapsed && (
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white text-lg leading-tight">TaskFlow</h2>
              <p className="text-xs text-surface-400">Team Manager</p>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center mx-auto shadow-lg shadow-primary-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
        )}

        {/* Close button on mobile */}
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg hover:bg-surface-700/50 text-surface-400 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Collapse toggle on desktop */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex p-1.5 rounded-lg hover:bg-surface-700/50 text-surface-400 transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <NavLink
          to="/"
          end
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all-300 group
            ${isActive
              ? 'bg-primary-500/15 text-primary-400 shadow-sm'
              : 'text-surface-400 hover:bg-surface-700/30 hover:text-surface-200'
            } ${isCollapsed ? 'justify-center' : ''}`
          }
        >
          <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Dashboard</span>}
        </NavLink>

        {/* Teams section */}
        <div className="pt-4">
          {!isCollapsed && (
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Teams</span>
              <button
                onClick={() => {
                  navigate('/');
                  onClose();
                  // Trigger team creation modal
                  setTimeout(() => window.dispatchEvent(new CustomEvent('open-create-team')), 100);
                }}
                className="p-1 rounded-md hover:bg-surface-700/50 text-surface-400 hover:text-primary-400 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {isCollapsed && (
            <div className="flex justify-center mb-2">
              <Users className="w-5 h-5 text-surface-500" />
            </div>
          )}

          <div className="space-y-0.5">
            {teams.map((team) => (
              <NavLink
                key={team.id}
                to={`/teams/${team.id}`}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all-300
                  ${isActive
                    ? 'bg-primary-500/10 text-primary-400'
                    : 'text-surface-400 hover:bg-surface-700/30 hover:text-surface-200'
                  } ${isCollapsed ? 'justify-center' : ''}`
                }
              >
                <div className="w-8 h-8 rounded-lg bg-surface-700/50 flex items-center justify-center flex-shrink-0 text-xs font-bold text-surface-300">
                  {team.name.charAt(0).toUpperCase()}
                </div>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate">{team.name}</span>
                      {roleIcon(team.user_role)}
                    </div>
                    <span className="text-xs text-surface-500">{team.member_count} members</span>
                  </div>
                )}
              </NavLink>
            ))}

            {teams.length === 0 && !isCollapsed && (
              <p className="px-3 py-4 text-xs text-surface-500 text-center">
                No teams yet. Create one to get started!
              </p>
            )}
          </div>
        </div>
      </nav>

      {/* User section */}
      {user && (
        <div className="p-3 border-t border-surface-700/30">
          <div className={`flex items-center gap-3 px-3 py-2 rounded-xl ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-9 h-9 rounded-full gradient-accent flex items-center justify-center flex-shrink-0 text-sm font-bold text-white shadow-md">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-sm font-medium text-surface-200 truncate">{user.name}</p>
                <p className="text-xs text-surface-500 truncate">{user.email}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
