import { useState, useEffect } from 'react';
import { CheckCircle2, Clock, AlertTriangle, Users, TrendingUp, ListTodo } from 'lucide-react';

function AnimatedValue({ value, suffix = '' }) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const numeric = typeof value === 'number' ? value : parseInt(value) || 0;
    if (numeric === 0) {
      setDisplayValue(0);
      return;
    }
    
    let start = 0;
    const end = numeric;
    const duration = 800;
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
      gradient: 'from-blue-500 to-indigo-600',
      iconBg: 'bg-blue-500/15',
      iconColor: 'text-blue-500',
      ringColor: 'ring-blue-500/20',
    },
    {
      label: 'In Progress',
      value: inProgressTasks,
      icon: Clock,
      gradient: 'from-amber-500 to-orange-600',
      iconBg: 'bg-amber-500/15',
      iconColor: 'text-amber-500',
      ringColor: 'ring-amber-500/20',
    },
    {
      label: 'Completed',
      value: completedTasks,
      icon: CheckCircle2,
      gradient: 'from-emerald-500 to-teal-600',
      iconBg: 'bg-emerald-500/15',
      iconColor: 'text-emerald-500',
      ringColor: 'ring-emerald-500/20',
    },
    {
      label: 'Overdue',
      value: overdueTasks,
      icon: AlertTriangle,
      gradient: 'from-rose-500 to-red-600',
      iconBg: 'bg-rose-500/15',
      iconColor: 'text-rose-500',
      ringColor: 'ring-rose-500/20',
      pulse: overdueTasks > 0,
    },
    {
      label: 'Teams',
      value: teams.length,
      icon: Users,
      gradient: 'from-violet-500 to-purple-600',
      iconBg: 'bg-violet-500/15',
      iconColor: 'text-violet-500',
      ringColor: 'ring-violet-500/20',
    },
    {
      label: 'Completion',
      value: completionRate,
      suffix: '%',
      icon: TrendingUp,
      gradient: 'from-cyan-500 to-sky-600',
      iconBg: 'bg-cyan-500/15',
      iconColor: 'text-cyan-500',
      ringColor: 'ring-cyan-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={`relative overflow-hidden rounded-2xl bg-white border border-surface-700/40 p-4 hover-glow group animate-slide-up ${stat.pulse ? 'ring-2 ring-rose-500/30' : ''}`}
          style={{ animationDelay: `${i * 0.06}s` }}
        >
          {/* Gradient accent at top */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient} opacity-80`} />
          
          <div className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center mb-3 ring-1 ${stat.ringColor} transition-transform group-hover:scale-110`}>
            <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
          </div>
          
          <p className="text-2xl font-extrabold text-surface-50 tracking-tight">
            <AnimatedValue value={stat.value} suffix={stat.suffix} />
          </p>
          <p className="text-xs text-surface-400 mt-0.5 font-medium">{stat.label}</p>

          {/* Subtle background pattern */}
          <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br opacity-[0.04] pointer-events-none" style={{ background: `linear-gradient(135deg, currentColor, transparent)` }} />
        </div>
      ))}
    </div>
  );
}
