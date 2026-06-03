import { useState, useEffect } from 'react';
import { CheckCircle2, Clock, AlertTriangle, Users, TrendingUp, ListTodo } from 'lucide-react';

function AnimatedValue({ value, suffix = '' }) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const numeric = typeof value === 'number' ? value : parseInt(value) || 0;
    if (numeric === 0) {
      setDisplayValue(value);
      return;
    }
    
    let start = 0;
    const end = numeric;
    const duration = 600; // ms
    const stepTime = 16;
    const totalSteps = duration / stepTime;
    const increment = end / totalSteps;
    
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      start += increment;
      if (currentStep >= totalSteps) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, stepTime);
    
    return () => clearInterval(timer);
  }, [value]);
  
  if (typeof value === 'string' && value.includes('%')) {
    return <span>{displayValue}{suffix || '%'}</span>;
  }
  return <span>{displayValue}{suffix}</span>;
}

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
      color: 'text-primary-600',
      bg: 'bg-primary-500/10',
      border: 'border-primary-500/20',
      progress: 100,
      progressBarColor: 'bg-primary-500',
    },
    {
      label: 'In Progress',
      value: inProgressTasks,
      icon: Clock,
      color: 'text-warning-600',
      bg: 'bg-warning-500/10',
      border: 'border-warning-500/20',
      progress: totalTasks > 0 ? Math.round((inProgressTasks / totalTasks) * 100) : 0,
      progressBarColor: 'bg-warning-500',
    },
    {
      label: 'Completed',
      value: completedTasks,
      icon: CheckCircle2,
      color: 'text-accent-600',
      bg: 'bg-accent-500/10',
      border: 'border-accent-500/20',
      progress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      progressBarColor: 'bg-accent-500',
    },
    {
      label: 'Overdue',
      value: overdueTasks,
      icon: AlertTriangle,
      color: 'text-danger-600',
      bg: 'bg-danger-500/10',
      border: 'border-danger-500/20',
      progress: totalTasks > 0 ? Math.round((overdueTasks / totalTasks) * 100) : 0,
      progressBarColor: 'bg-danger-500',
    },
    {
      label: 'Teams',
      value: teams.length,
      icon: Users,
      color: 'text-primary-600',
      bg: 'bg-primary-500/10',
      border: 'border-primary-500/20',
      progress: undefined,
    },
    {
      label: 'Completion',
      value: completionRate,
      suffix: '%',
      icon: TrendingUp,
      color: 'text-accent-600',
      bg: 'bg-accent-500/10',
      border: 'border-accent-500/20',
      progress: completionRate,
      progressBarColor: 'bg-accent-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={`glass rounded-2xl p-4 border ${stat.border} hover-glow flex flex-col justify-between animate-slide-up`}
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          <div>
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-extrabold text-surface-50">
              <AnimatedValue value={stat.value} suffix={stat.suffix} />
            </p>
            <p className="text-xs text-surface-400 mt-0.5">{stat.label}</p>
          </div>
          
          {stat.progress !== undefined && (
            <div className="mt-4 h-1.5 w-full bg-surface-800 rounded-full overflow-hidden progress-bar">
              <div 
                className={`h-full ${stat.progressBarColor} transition-all duration-1000 ease-out`}
                style={{ width: `${stat.progress}%` }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
