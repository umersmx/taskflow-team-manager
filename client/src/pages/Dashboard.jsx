import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { teamsAPI, tasksAPI } from '../services/api';
import StatsCards from '../components/dashboard/StatsCards';
import DueReminders from '../components/dashboard/DueReminders';
import TaskCard from '../components/tasks/TaskCard';
import TaskFilters from '../components/tasks/TaskFilters';
import TaskModal from '../components/tasks/TaskModal';
import TeamModal from '../components/teams/TeamModal';
import { Plus, Loader2, ListTodo, Users, Sparkles, Calendar, BarChart3, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [reminders, setReminders] = useState({ overdue: [], upcoming: [] });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', team_id: '', assigned_to: '', status: '', priority: '' });
  const [teamMembers, setTeamMembers] = useState({});

  // Modals
  const [taskModal, setTaskModal] = useState({ open: false, task: null });
  const [teamModal, setTeamModal] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [teamsRes, tasksRes, remindersRes] = await Promise.all([
        teamsAPI.getAll(),
        tasksAPI.getAll(Object.fromEntries(Object.entries(filters).filter(([, v]) => v))),
        tasksAPI.getReminders(),
      ]);

      setTeams(teamsRes.data.teams);
      setTasks(tasksRes.data.tasks);
      setReminders(remindersRes.data);

      // Load members for each team (for task modal)
      const members = {};
      for (const team of teamsRes.data.teams) {
        try {
          const teamRes = await teamsAPI.getOne(team.id);
          members[team.id] = teamRes.data.team.members;
        } catch {
          members[team.id] = [];
        }
      }
      setTeamMembers(members);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Listen for "open-create-team" event from sidebar
  useEffect(() => {
    function handleOpenTeam() { setTeamModal(true); }
    window.addEventListener('open-create-team', handleOpenTeam);
    return () => window.removeEventListener('open-create-team', handleOpenTeam);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getTimeEmoji = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '☀️';
    if (hour < 17) return '🌤️';
    return '🌙';
  };

  async function handleCreateTask(data) {
    try {
      await tasksAPI.create(data);
      toast.success('Task created');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create task');
      throw err;
    }
  }

  async function handleUpdateTask(data) {
    try {
      await tasksAPI.update(taskModal.task.id, data);
      toast.success('Task updated');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update task');
      throw err;
    }
  }

  async function handleDeleteTask(id) {
    if (!confirm('Delete this task?')) return;
    try {
      await tasksAPI.delete(id);
      toast.success('Task deleted');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete task');
    }
  }

  async function handleCreateTeam(data) {
    try {
      await teamsAPI.create(data);
      toast.success('Team created');
      loadData();
      window.dispatchEvent(new CustomEvent('teams-updated'));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create team');
      throw err;
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-surface-400">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-6 pb-8">
      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-emerald-800 p-6 md:p-8 shadow-xl shadow-primary-900/10 animate-fade-in">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{getTimeEmoji()}</span>
              <p className="text-primary-200 text-sm font-medium">{todayDate}</p>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {getGreeting()}, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-primary-100/70 text-sm mt-1.5 max-w-md">
              {tasks.length === 0
                ? 'Create your first team and task to get started.'
                : `You have ${tasks.filter(t => t.status !== 'done').length} active tasks across ${teams.length} team${teams.length !== 1 ? 's' : ''}.`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setTeamModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 border border-white/20 text-sm font-medium text-white hover:bg-white/25 backdrop-blur-sm transition-all"
            >
              <Users className="w-4 h-4" />
              New Team
            </button>
            <button
              onClick={() => setTaskModal({ open: true, task: null })}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-primary-700 text-sm font-semibold hover:bg-primary-50 transition-all shadow-lg shadow-black/10"
            >
              <Plus className="w-4 h-4" />
              New Task
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <StatsCards tasks={tasks} teams={teams} />

      {/* ── Reminders ── */}
      <DueReminders overdue={reminders.overdue} upcoming={reminders.upcoming} />

      {/* ── Quick Overview Row ── */}
      {teams.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4 animate-fade-in">
          {/* Team Activity */}
          <div className="rounded-2xl bg-white border border-surface-700/40 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-violet-500" />
                </div>
                <h3 className="text-sm font-semibold text-surface-100">Team Overview</h3>
              </div>
            </div>
            <div className="space-y-3">
              {teams.slice(0, 3).map((team) => {
                const teamTasks = tasks.filter(t => t.team_id === team.id);
                const done = teamTasks.filter(t => t.status === 'done').length;
                const pct = teamTasks.length > 0 ? Math.round((done / teamTasks.length) * 100) : 0;
                return (
                  <div key={team.id} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {team.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-surface-100 truncate">{team.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-surface-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[11px] text-surface-400 font-medium w-8 text-right">{pct}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {teams.length === 0 && (
                <p className="text-sm text-surface-400 text-center py-4">No teams yet</p>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-2xl bg-white border border-surface-700/40 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-amber-500" />
                </div>
                <h3 className="text-sm font-semibold text-surface-100">Recent Tasks</h3>
              </div>
            </div>
            <div className="space-y-2.5">
              {tasks.slice(0, 4).map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-800/40 transition-colors cursor-pointer" onClick={() => setTaskModal({ open: true, task })}>
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    task.status === 'done' ? 'bg-emerald-500' :
                    task.status === 'in_progress' ? 'bg-amber-500' :
                    task.status === 'review' ? 'bg-blue-500' :
                    'bg-surface-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-surface-100 truncate">{task.title}</p>
                    <p className="text-[11px] text-surface-400">{task.status?.replace('_', ' ')}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-surface-500 shrink-0" />
                </div>
              ))}
              {tasks.length === 0 && (
                <p className="text-sm text-surface-400 text-center py-4">No tasks yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Task Section ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
            <ListTodo className="w-4 h-4 text-primary-500" />
          </div>
          <h2 className="text-lg font-semibold text-surface-50">All Tasks</h2>
          <span className="text-xs text-surface-400 bg-surface-800/60 px-2.5 py-0.5 rounded-full font-medium">{tasks.length}</span>
        </div>

        {/* Filters */}
        <TaskFilters filters={filters} onChange={setFilters} teams={teams} />

        {/* Task Grid */}
        {tasks.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={(t) => setTaskModal({ open: true, task: t })}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-white border border-surface-700/30 border-dashed p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-primary-500" />
            </div>
            <h3 className="text-lg font-semibold text-surface-100 mb-2">
              {Object.values(filters).some((v) => v)
                ? 'No matching tasks'
                : 'Start building your workflow'}
            </h3>
            <p className="text-sm text-surface-400 max-w-sm mx-auto mb-6">
              {Object.values(filters).some((v) => v) 
                ? 'Try adjusting your filters to find what you\'re looking for.'
                : 'Create a team, invite your collaborators, and add tasks to track your project progress.'}
            </p>
            {!Object.values(filters).some((v) => v) && (
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setTeamModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/50 text-sm font-medium text-surface-200 hover:bg-surface-700/50 transition-all"
                >
                  <Users className="w-4 h-4" />
                  Create Team
                </button>
                <button
                  onClick={() => setTaskModal({ open: true, task: null })}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary-500/20"
                >
                  <Plus className="w-4 h-4" />
                  Add Task
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <TaskModal
        isOpen={taskModal.open}
        onClose={() => setTaskModal({ open: false, task: null })}
        onSubmit={taskModal.task ? handleUpdateTask : handleCreateTask}
        task={taskModal.task}
        teams={teams}
        teamMembers={teamMembers}
      />

      <TeamModal
        isOpen={teamModal}
        onClose={() => setTeamModal(false)}
        onSubmit={handleCreateTeam}
      />
    </div>
  );
}
