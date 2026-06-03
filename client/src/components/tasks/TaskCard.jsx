import { format } from 'date-fns';
import { Calendar, User, Flag, Pencil, Trash2 } from 'lucide-react';

const statusConfig = {
  todo: { label: 'To Do', color: 'bg-surface-800 text-surface-300 border-surface-700' },
  in_progress: { label: 'In Progress', color: 'bg-primary-500/10 text-primary-600 border-primary-500/20' },
  review: { label: 'Review', color: 'bg-warning-500/10 text-warning-600 border-warning-500/20' },
  done: { label: 'Done', color: 'bg-accent-500/10 text-accent-600 border-accent-500/20' },
};

const priorityConfig = {
  low: { label: 'Low', color: 'text-surface-400', dot: 'bg-surface-400' },
  medium: { label: 'Medium', color: 'text-primary-600', dot: 'bg-primary-500' },
  high: { label: 'High', color: 'text-warning-600', dot: 'bg-warning-500' },
  urgent: { label: 'Urgent', color: 'text-danger-600', dot: 'bg-danger-500' },
};

export default function TaskCard({ task, onEdit, onDelete }) {
  const status = statusConfig[task.status] || statusConfig.todo;
  const priority = priorityConfig[task.priority] || priorityConfig.medium;
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';

  return (
    <div className={`glass rounded-xl p-4 pl-5 border border-surface-700/60 hover-glow group animate-fade-in card-accent-left card-accent-${task.status}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Status + Priority */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${status.color}`}>
              {status.label}
            </span>
            <span className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
              <span className={`text-[11px] font-semibold ${priority.color}`}>{priority.label}</span>
            </span>
          </div>

          {/* Title */}
          <h3 className={`text-sm font-semibold mb-1 ${task.status === 'done' ? 'text-surface-500 line-through' : 'text-surface-50'}`}>
            {task.title}
          </h3>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-surface-400 mb-3 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-3 flex-wrap">
            {task.team_name && (
              <span className="text-[11px] text-surface-500 flex items-center gap-1">
                <span className="w-4 h-4 rounded bg-surface-700/50 flex items-center justify-center text-[9px] font-bold text-surface-300">
                  {task.team_name.charAt(0)}
                </span>
                {task.team_name}
              </span>
            )}

            {task.assigned_to_name && (
              <span className="text-[11px] text-surface-500 flex items-center gap-1">
                <User className="w-3 h-3" />
                {task.assigned_to_name}
              </span>
            )}

            {task.due_date && (
              <span className={`text-[11px] flex items-center gap-1 ${isOverdue ? 'text-danger-400 animate-pulse-soft font-semibold' : 'text-surface-500'}`}>
                <Calendar className="w-3 h-3" />
                {format(new Date(task.due_date), 'MMM d')}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-lg hover:bg-surface-800 text-surface-400 hover:text-primary-400 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 rounded-lg hover:bg-surface-800 text-surface-400 hover:text-danger-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
