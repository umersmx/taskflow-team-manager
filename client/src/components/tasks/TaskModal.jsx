import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { Loader2 } from 'lucide-react';

export default function TaskModal({ isOpen, onClose, onSubmit, task, teams, teamMembers }) {
  const isEdit = !!task;

  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    due_date: '',
    team_id: '',
    assigned_to: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        due_date: task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : '',
        team_id: task.team_id?.toString() || '',
        assigned_to: task.assigned_to?.toString() || '',
      });
    } else {
      setForm({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        due_date: '',
        team_id: teams?.[0]?.id?.toString() || '',
        assigned_to: '',
      });
    }
  }, [task, isOpen, teams]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...form,
        team_id: parseInt(form.team_id),
        assigned_to: form.assigned_to ? parseInt(form.assigned_to) : null,
        due_date: form.due_date || null,
      };
      await onSubmit(data);
      onClose();
    } catch (err) {
      // Error handled by parent
    } finally {
      setLoading(false);
    }
  }

  // Get members of selected team
  const currentTeamMembers = teamMembers?.[form.team_id] || [];

  const inputClass = "w-full px-3 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/50 text-surface-50 text-sm placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all-300";
  const labelClass = "block text-sm font-medium text-surface-300 mb-1.5";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Task' : 'Create Task'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="task-title" className={labelClass}>Title *</label>
          <input
            id="task-title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Task title..."
            className={inputClass}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="task-desc" className={labelClass}>Description</label>
          <textarea
            id="task-desc"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Add a description..."
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Team + Assignee Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="task-team" className={labelClass}>Team *</label>
            <select
              id="task-team"
              name="team_id"
              value={form.team_id}
              onChange={handleChange}
              className={inputClass}
              required
              disabled={isEdit}
            >
              <option value="">Select team</option>
              {teams?.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="task-assignee" className={labelClass}>Assign to</label>
            <select
              id="task-assignee"
              name="assigned_to"
              value={form.assigned_to}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Unassigned</option>
              {currentTeamMembers.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status + Priority Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="task-status" className={labelClass}>Status</label>
            <select
              id="task-status"
              name="status"
              value={form.status}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div>
            <label htmlFor="task-priority" className={labelClass}>Priority</label>
            <select
              id="task-priority"
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label htmlFor="task-due" className={labelClass}>Due Date</label>
          <input
            id="task-due"
            type="datetime-local"
            name="due_date"
            value={form.due_date}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-surface-300 hover:bg-surface-700/50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all-300 flex items-center gap-2 shadow-lg shadow-primary-500/20"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
