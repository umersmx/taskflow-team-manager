import { AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

export default function DueReminders({ overdue = [], upcoming = [] }) {
  if (overdue.length === 0 && upcoming.length === 0) return null;

  return (
    <div className="space-y-3 animate-slide-up">
      {/* Overdue */}
      {overdue.length > 0 && (
        <div className="glass-light rounded-2xl border border-danger-500/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-danger-400" />
            <h3 className="text-sm font-semibold text-danger-400">
              Overdue Tasks ({overdue.length})
            </h3>
          </div>
          <div className="space-y-2">
            {overdue.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-danger-500/5 border border-danger-500/10"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-surface-200 truncate">{task.title}</p>
                  <p className="text-xs text-surface-500">
                    {task.team_name} • Due {formatDistanceToNow(new Date(task.due_date), { addSuffix: true })}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-surface-500 flex-shrink-0 ml-2" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="glass-light rounded-2xl border border-warning-500/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-warning-400" />
            <h3 className="text-sm font-semibold text-warning-400">
              Due Soon ({upcoming.length})
            </h3>
          </div>
          <div className="space-y-2">
            {upcoming.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-warning-500/5 border border-warning-500/10"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-surface-200 truncate">{task.title}</p>
                  <p className="text-xs text-surface-500">
                    {task.team_name} • Due {format(new Date(task.due_date), 'MMM d, h:mm a')}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-surface-500 flex-shrink-0 ml-2" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
