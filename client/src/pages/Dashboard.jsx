import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { teamsAPI, tasksAPI } from '../services/api';
import StatsCards from '../components/dashboard/StatsCards';
import DueReminders from '../components/dashboard/DueReminders';
import TaskCard from '../components/tasks/TaskCard';
import TaskFilters from '../components/tasks/TaskFilters';
import TaskModal from '../components/tasks/TaskModal';
import TeamModal from '../components/teams/TeamModal';
import { Plus, Loader2, ListTodo, Users } from 'lucide-react';
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
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-surface-50">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-surface-400 mt-1">Here's what's happening with your teams today.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setTeamModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-800/60 border border-surface-700/50 text-sm font-medium text-surface-200 hover:bg-surface-700/60 transition-all-300"
          >
            <Users className="w-4 h-4" />
            New Team
          </button>
          <button
            onClick={() => setTaskModal({ open: true, task: null })}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-all-300 shadow-lg shadow-primary-500/20"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>
      </div>

      {/* Stats */}
      <StatsCards tasks={tasks} teams={teams} />

      {/* Reminders */}
      <DueReminders overdue={reminders.overdue} upcoming={reminders.upcoming} />

      {/* Task Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ListTodo className="w-5 h-5 text-primary-400" />
          <h2 className="text-lg font-semibold text-surface-50">Tasks</h2>
          <span className="text-xs text-surface-500 bg-surface-800/50 px-2 py-0.5 rounded-full">{tasks.length}</span>
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
          <div className="glass-light rounded-2xl p-12 text-center border border-surface-700/20">
            <ListTodo className="w-12 h-12 text-surface-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-surface-400 mb-1">No tasks found</h3>
            <p className="text-sm text-surface-500">
              {Object.values(filters).some((v) => v) 
                ? 'Try adjusting your filters'
                : 'Create a team and add your first task to get started'}
            </p>
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
