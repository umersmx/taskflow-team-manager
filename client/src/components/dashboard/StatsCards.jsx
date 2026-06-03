import { CheckCircle2, Clock, AlertTriangle, Users, TrendingUp, ListTodo } from 'lucide-react';

export default function StatsCards({ tasks, teams }) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const overdueTasks = tasks.filter(
    (t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done'
  ).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const stats = [
    {
      label: 'Total Tasks',
      value: totalTasks,
      icon: ListTodo,
      color: 'text-primary-400',
      bg: 'bg-primary-500/10',
      border: 'border-primary-500/20',
    },
    {
      label: 'In Progress',
      value: inProgressTasks,
      icon: Clock,
      color: 'text-warning-400',
      bg: 'bg-warning-500/10',
      border: 'border-warning-500/20',
    },
    {
      label: 'Completed',
      value: completedTasks,
      icon: CheckCircle2,
      color: 'text-accent-400',
      bg: 'bg-accent-500/10',
      border: 'border-accent-500/20',
    },
    {
      label: 'Overdue',
      value: overdueTasks,
      icon: AlertTriangle,
      color: 'text-danger-400',
      bg: 'bg-danger-500/10',
      border: 'border-danger-500/20',
    },
    {
      label: 'Teams',
      value: teams.length,
      icon: Users,
      color: 'text-primary-300',
      bg: 'bg-primary-400/10',
      border: 'border-primary-400/20',
    },
    {
      label: 'Completion',
      value: `${completionRate}%`,
      icon: TrendingUp,
      color: 'text-accent-300',
      bg: 'bg-accent-400/10',
      border: 'border-accent-400/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={`glass-light rounded-2xl p-4 border ${stat.border} hover:scale-[1.02] transition-all-300 animate-slide-up`}
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </div>
          <p className="text-2xl font-bold text-white">{stat.value}</p>
          <p className="text-xs text-surface-400 mt-0.5">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
