import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { teamsAPI, tasksAPI } from '../services/api';
import MemberList from '../components/teams/MemberList';
import TeamModal from '../components/teams/TeamModal';
import TaskCard from '../components/tasks/TaskCard';
import TaskModal from '../components/tasks/TaskModal';
import Modal from '../components/ui/Modal';
import {
  Loader2, Plus, Settings, Trash2, UserPlus, Mail,
  ArrowLeft, Users, ListTodo
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function TeamDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState({});

  // Modals
  const [editTeamModal, setEditTeamModal] = useState(false);
  const [taskModal, setTaskModal] = useState({ open: false, task: null });
  const [addMemberModal, setAddMemberModal] = useState(false);
  const [inviteModal, setInviteModal] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('member');
  const [inviteEmail, setInviteEmail] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [teamRes, tasksRes] = await Promise.all([
        teamsAPI.getOne(id),
        tasksAPI.getAll({ team_id: id }),
      ]);
      setTeam(teamRes.data.team);
      setTasks(tasksRes.data.tasks);

      // Set team members for task modal
      setTeamMembers({ [id]: teamRes.data.team.members });
    } catch (err) {
      toast.error('Failed to load team');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [loadData]);

  const isOwner = team?.user_role === 'owner';
  const isAdmin = team?.user_role === 'admin';
  const canManage = isOwner || isAdmin;

  async function handleUpdateTeam(data) {
    try {
      await teamsAPI.update(id, data);
      toast.success('Team updated');
      loadData();
      window.dispatchEvent(new CustomEvent('teams-updated'));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update team');
      throw err;
    }
  }

  async function handleDeleteTeam() {
    if (!confirm('Are you sure you want to delete this team? This will also delete all tasks in this team.')) return;
    try {
      await teamsAPI.delete(id);
      toast.success('Team deleted');
      window.dispatchEvent(new CustomEvent('teams-updated'));
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete team');
    }
  }

  async function handleAddMember(e) {
    e.preventDefault();
    setActionLoading(true);
    try {
      await teamsAPI.addMember(id, { email: memberEmail, role: memberRole });
      toast.success('Member added');
      setMemberEmail('');
      setMemberRole('member');
      setAddMemberModal(false);
      loadData();
      window.dispatchEvent(new CustomEvent('teams-updated'));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add member');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleInvite(e) {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await teamsAPI.invite(id, { email: inviteEmail });
      toast.success(res.data.message || 'Invitation sent');
      setInviteEmail('');
      setInviteModal(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send invitation');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRemoveMember(userId) {
    if (!confirm('Remove this member from the team?')) return;
    try {
      await teamsAPI.removeMember(id, userId);
      toast.success('Member removed');
      loadData();
      window.dispatchEvent(new CustomEvent('teams-updated'));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to remove member');
    }
  }

  async function handleCreateTask(data) {
    try {
      await tasksAPI.create({ ...data, team_id: parseInt(id) });
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

  async function handleDeleteTask(taskId) {
    if (!confirm('Delete this task?')) return;
    try {
      await tasksAPI.delete(taskId);
      toast.success('Task deleted');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete task');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!team) return null;

  const inputClass = "w-full px-3 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/50 text-surface-50 text-sm placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all-300";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-sm text-surface-400 hover:text-surface-200 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </button>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-surface-700/50 flex items-center justify-center text-lg font-bold text-surface-300">
                {team.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-surface-50">{team.name}</h1>
                {team.description && (
                  <p className="text-sm text-surface-400 mt-0.5">{team.description}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canManage && (
              <>
                <button
                  onClick={() => setAddMemberModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-800/60 border border-surface-700/50 text-sm text-surface-200 hover:bg-surface-700/60 transition-all-300"
                >
                  <UserPlus className="w-4 h-4" />
                  Add Member
                </button>
                <button
                  onClick={() => setInviteModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-800/60 border border-surface-700/50 text-sm text-surface-200 hover:bg-surface-700/60 transition-all-300"
                >
                  <Mail className="w-4 h-4" />
                  Invite
                </button>
                <button
                  onClick={() => setEditTeamModal(true)}
                  className="p-2 rounded-xl bg-surface-800/60 border border-surface-700/50 text-surface-400 hover:text-surface-200 hover:bg-surface-700/60 transition-all-300"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </>
            )}
            {isOwner && (
              <button
                onClick={handleDeleteTeam}
                className="p-2 rounded-xl bg-surface-800/60 border border-danger-500/30 text-danger-400 hover:bg-danger-500/10 transition-all-300"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setTaskModal({ open: true, task: null })}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-all-300 shadow-lg shadow-primary-500/20"
            >
              <Plus className="w-4 h-4" />
              New Task
            </button>
          </div>
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Members */}
        <div className="lg:col-span-1 space-y-4 animate-slide-up">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary-400" />
            <h2 className="text-sm font-semibold text-surface-50">Members</h2>
            <span className="text-xs text-surface-500 bg-surface-800/50 px-2 py-0.5 rounded-full">
              {team.members?.length || 0}
            </span>
          </div>

          <MemberList
            members={team.members || []}
            currentUserId={user.id}
            userRole={team.user_role}
            onRemove={handleRemoveMember}
          />

          {/* Pending invitations */}
          {team.invitations?.filter((i) => i.status === 'pending').length > 0 && (
            <div className="mt-4">
              <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Pending Invitations</h3>
              <div className="space-y-2">
                {team.invitations.filter((i) => i.status === 'pending').map((inv) => (
                  <div key={inv.id} className="flex items-center gap-3 p-2 rounded-lg bg-surface-800/30 border border-surface-700/20">
                    <Mail className="w-4 h-4 text-warning-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-surface-300 truncate">{inv.email}</p>
                      <p className="text-[10px] text-surface-500">Pending</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tasks */}
        <div className="lg:col-span-2 space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-primary-400" />
            <h2 className="text-sm font-semibold text-surface-50">Tasks</h2>
            <span className="text-xs text-surface-500 bg-surface-800/50 px-2 py-0.5 rounded-full">
              {tasks.length}
            </span>
          </div>

          {tasks.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
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
            <div className="glass-light rounded-2xl p-10 text-center border border-surface-700/20">
              <ListTodo className="w-10 h-10 text-surface-600 mx-auto mb-2" />
              <p className="text-sm text-surface-400">No tasks yet</p>
              <p className="text-xs text-surface-500">Create your first task for this team</p>
            </div>
          )}
        </div>
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={taskModal.open}
        onClose={() => setTaskModal({ open: false, task: null })}
        onSubmit={taskModal.task ? handleUpdateTask : handleCreateTask}
        task={taskModal.task}
        teams={[team]}
        teamMembers={teamMembers}
      />

      {/* Edit Team Modal */}
      <TeamModal
        isOpen={editTeamModal}
        onClose={() => setEditTeamModal(false)}
        onSubmit={handleUpdateTeam}
        team={team}
      />

      {/* Add Member Modal */}
      <Modal isOpen={addMemberModal} onClose={() => setAddMemberModal(false)} title="Add Member" size="sm">
        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label htmlFor="member-email-input" className="block text-sm font-medium text-surface-300 mb-1.5">
              Member's email *
            </label>
            <input
              id="member-email-input"
              type="email"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              placeholder="member@example.com"
              className={inputClass}
              required
            />
            <p className="mt-1 text-xs text-surface-500">User must already have an account</p>
          </div>

          <div>
            <label htmlFor="member-role-input" className="block text-sm font-medium text-surface-300 mb-1.5">
              Role
            </label>
            <select
              id="member-role-input"
              value={memberRole}
              onChange={(e) => setMemberRole(e.target.value)}
              className={inputClass}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setAddMemberModal(false)} className="px-4 py-2 rounded-xl text-sm text-surface-300 hover:bg-surface-700/50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={actionLoading} className="px-5 py-2 rounded-xl gradient-primary text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all-300 flex items-center gap-2">
              {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Add Member
            </button>
          </div>
        </form>
      </Modal>

      {/* Invite Modal */}
      <Modal isOpen={inviteModal} onClose={() => setInviteModal(false)} title="Invite via Email" size="sm">
        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label htmlFor="invite-email-input" className="block text-sm font-medium text-surface-300 mb-1.5">
              Email address *
            </label>
            <input
              id="invite-email-input"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="invitee@example.com"
              className={inputClass}
              required
            />
            <p className="mt-1 text-xs text-surface-500">They'll be added automatically when they register</p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setInviteModal(false)} className="px-4 py-2 rounded-xl text-sm text-surface-300 hover:bg-surface-700/50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={actionLoading} className="px-5 py-2 rounded-xl gradient-primary text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all-300 flex items-center gap-2">
              {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <Mail className="w-4 h-4" />
              Send Invitation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
