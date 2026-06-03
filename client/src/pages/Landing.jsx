import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import {
  Sparkles, ArrowRight, Lock, ListTodo, Users, CheckCircle, Clock,
  Zap, Shield, BarChart3, Star
} from 'lucide-react';

/* Animated counter hook */
function useCounter(target, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const num = typeof target === 'number' ? target : parseInt(target) || 0;
    if (num === 0) return;
    let start = 0;
    const step = Math.ceil(num / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= num) { setCount(num); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

/* Floating particle component */
function FloatingParticles() {
  const particles = [
    { size: 6, top: '12%', left: '8%', delay: '0s', color: 'bg-primary-400/20' },
    { size: 4, top: '25%', left: '85%', delay: '1s', color: 'bg-primary-300/15' },
    { size: 8, top: '60%', left: '15%', delay: '2s', color: 'bg-accent-400/10' },
    { size: 5, top: '45%', left: '92%', delay: '0.5s', color: 'bg-primary-500/12' },
    { size: 10, top: '80%', left: '50%', delay: '1.5s', color: 'bg-accent-300/8' },
    { size: 3, top: '35%', left: '70%', delay: '3s', color: 'bg-primary-400/15' },
    { size: 7, top: '70%', left: '30%', delay: '2.5s', color: 'bg-primary-300/10' },
  ];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <div
          key={i}
          className={`particle ${p.color} animate-float`}
          style={{
            width: p.size, height: p.size,
            top: p.top, left: p.left,
            animationDelay: p.delay,
            animationDuration: `${5 + i * 0.8}s`,
          }}
        />
      ))}
    </div>
  );
}

/* Social proof stat */
function ProofStat({ value, label, suffix = '' }) {
  const count = useCounter(value);
  return (
    <div className="text-center">
      <p className="text-2xl sm:text-3xl font-extrabold text-surface-50 stat-value">
        {count}{suffix}
      </p>
      <p className="text-xs sm:text-sm text-surface-400 mt-0.5">{label}</p>
    </div>
  );
}

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100 gradient-mesh-rich flex flex-col relative">
      <FloatingParticles />

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 glass-deep border-b border-surface-700/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-md shadow-primary-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-surface-50 text-lg tracking-tight">TaskFlow</span>
          </div>

          <nav className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl gradient-animated text-white text-sm font-semibold hover:opacity-95 transition-all shadow-md shadow-primary-500/20"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-surface-300 hover:text-surface-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1 px-4 py-2 rounded-xl bg-surface-800 border border-surface-700/80 text-sm font-semibold text-surface-50 hover:bg-surface-700/50 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 max-w-5xl mx-auto px-4 pt-20 pb-12 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center animate-fade-in relative">

        {/* Version badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-xs font-semibold text-primary-600 mb-6 animate-bounce-in">
          <Sparkles className="w-3.5 h-3.5" />
          TaskFlow v1.0 — Minimalist Team Management
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-surface-50 tracking-tight leading-[1.1] mb-6 max-w-3xl">
          A minimalist canvas for{' '}
          <span className="gradient-text-animated">
            team collaboration.
          </span>
        </h1>

        <p className="text-lg text-surface-400 max-w-2xl mb-8 leading-relaxed">
          Ditch the clutter of traditional tools. Collaborate with your team, assign tasks, and track project velocities on a clean, modern dashboard inspired by Nordic minimalist aesthetics.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl gradient-animated text-white font-semibold hover:opacity-95 transition-all shadow-lg shadow-primary-500/25"
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl gradient-animated text-white font-semibold hover:opacity-95 transition-all shadow-lg shadow-primary-500/25"
              >
                Get Started for Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="px-7 py-3.5 rounded-xl bg-surface-900 border border-surface-700 text-surface-50 font-semibold hover:bg-surface-800 hover:border-surface-600 transition-colors"
              >
                Sign In
              </Link>
            </>
          )}
        </div>

        {/* Social Proof Stats */}
        <div className="w-full max-w-lg mx-auto grid grid-cols-3 gap-6 mb-16 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <ProofStat value={500} suffix="+" label="Teams Created" />
          <ProofStat value={12} suffix="k" label="Tasks Tracked" />
          <ProofStat value={99} suffix="%" label="Uptime" />
        </div>

        {/* Product Preview Card */}
        <div className="w-full glass-deep rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/5 border border-surface-700/80 mb-20 animate-slide-up hover-glow relative" style={{ animationDelay: '0.4s' }}>
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />

          {/* Header element of mockup */}
          <div className="flex items-center justify-between pb-6 border-b border-surface-700/60 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-danger-500/80" />
              <span className="w-3.5 h-3.5 rounded-full bg-warning-500/80" />
              <span className="w-3.5 h-3.5 rounded-full bg-primary-500/80" />
            </div>
            <div className="text-xs font-semibold text-surface-500 uppercase tracking-widest bg-surface-800 px-3 py-1 rounded-full border border-surface-700/30">
              Live Interactive Preview
            </div>
          </div>

          {/* Body element of mockup */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
            {/* Sidebar Mockup */}
            <div className="md:col-span-1 border-r border-surface-700/30 pr-4 space-y-4 hidden md:block">
              <div className="space-y-1">
                <div className="px-3 py-2 rounded-xl bg-primary-500/10 text-primary-600 font-semibold text-sm flex items-center gap-2">
                  <BarChart3 className="w-3.5 h-3.5" />
                  Dashboard
                </div>
                <div className="px-3 py-2 text-surface-400 text-sm hover:text-surface-200">
                  Settings
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-surface-500 uppercase tracking-wider px-3 mb-2">Teams</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-surface-300">
                    <div className="w-6 h-6 rounded bg-primary-500/15 flex items-center justify-center text-xs font-bold text-primary-600">L</div>
                    Lahore Tech Hub
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-surface-300">
                    <div className="w-6 h-6 rounded bg-warning-500/15 flex items-center justify-center text-xs font-bold text-warning-600">K</div>
                    Karachi Creative
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Workspace Mockup */}
            <div className="md:col-span-3 pl-0 md:pl-2 space-y-6">
              {/* Mini Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-surface-800/40 border border-surface-700/40 rounded-xl hover-glow">
                  <span className="text-xs text-surface-500">Tasks</span>
                  <p className="text-xl font-bold text-surface-50">12</p>
                  <div className="mt-1.5 h-1 bg-surface-700/40 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-primary-500/40 rounded-full" />
                  </div>
                </div>
                <div className="p-3 bg-surface-800/40 border border-surface-700/40 rounded-xl hover-glow">
                  <span className="text-xs text-surface-500">In Progress</span>
                  <p className="text-xl font-bold text-primary-600">4</p>
                  <div className="mt-1.5 h-1 bg-surface-700/40 rounded-full overflow-hidden">
                    <div className="h-full w-1/3 bg-primary-500/40 rounded-full" />
                  </div>
                </div>
                <div className="p-3 bg-surface-800/40 border border-surface-700/40 rounded-xl hover-glow">
                  <span className="text-xs text-surface-500">Completed</span>
                  <p className="text-xl font-bold text-accent-600">8</p>
                  <div className="mt-1.5 h-1 bg-surface-700/40 rounded-full overflow-hidden">
                    <div className="h-full w-2/3 bg-accent-500/40 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Tasks List Mockup */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Active Tasks</p>

                {/* Task Item 1 */}
                <div className="p-3 bg-surface-900 border border-surface-700/80 rounded-xl flex items-center justify-between gap-4 card-accent-left card-accent-done">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-accent-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-surface-400 line-through">Setup server configuration</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-accent-500/10 text-accent-600 border border-accent-500/20 font-semibold">Done</span>
                </div>

                {/* Task Item 2 */}
                <div className="p-3 bg-surface-900 border border-surface-700/80 rounded-xl flex items-center justify-between gap-4 card-accent-left card-accent-in_progress">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-primary-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-surface-50">Integrate Passport authentication</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-primary-500/10 text-primary-600 border border-primary-500/20 font-semibold">In Progress</span>
                </div>

                {/* Task Item 3 (new) */}
                <div className="p-3 bg-surface-900 border border-surface-700/80 rounded-xl flex items-center justify-between gap-4 card-accent-left card-accent-todo">
                  <div className="flex items-center gap-3">
                    <ListTodo className="w-4 h-4 text-surface-400 flex-shrink-0" />
                    <span className="text-sm font-medium text-surface-50">Design team dashboard UI</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-surface-800 text-surface-400 border border-surface-700/50 font-semibold">To Do</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div id="features" className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 text-left mb-20">
          {[
            {
              icon: Users,
              title: 'Secure Team Spaces',
              desc: 'Create workspace teams for different projects, invite members via email, and control actions with Owner/Admin/Member role hierarchies.',
              gradient: 'from-primary-500/10 to-primary-500/5',
            },
            {
              icon: ListTodo,
              title: 'Minimalist Task Tracking',
              desc: 'Assign tasks, pick priorities, and choose due dates on a card interface without redundant clicks or complex configuration fields.',
              gradient: 'from-accent-500/10 to-accent-500/5',
            },
            {
              icon: Shield,
              title: 'Due Date Reminders',
              desc: 'Get clear, visual warning banners for overdue tasks and notification badges for upcoming milestones due within 24 hours.',
              gradient: 'from-warning-500/10 to-warning-500/5',
            },
          ].map((feature, i) => (
            <div
              key={feature.title}
              className="group p-6 bg-surface-900 border border-surface-700/80 rounded-2xl hover-glow animate-slide-up relative overflow-hidden"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {/* Decorative gradient blob */}
              <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${feature.gradient} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-surface-50 mb-2">{feature.title}</h3>
                <p className="text-sm text-surface-400 leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Features Row */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 mb-20 text-left">
          {[
            { icon: Zap, label: 'Lightning Fast', desc: 'Sub-second load times' },
            { icon: Lock, label: 'Secure Auth', desc: 'Session-based with bcrypt' },
            { icon: Star, label: 'Premium Design', desc: 'Nordic minimalist UI' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-4 p-4 rounded-xl bg-surface-900/60 border border-surface-700/40 hover-glow">
              <div className="w-10 h-10 rounded-lg bg-primary-500/8 flex items-center justify-center text-primary-500 flex-shrink-0">
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-surface-100">{item.label}</p>
                <p className="text-xs text-surface-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Banner Card */}
        <div className="w-full glass-deep rounded-3xl p-8 sm:p-12 text-center border border-surface-700/80 mb-12 relative overflow-hidden animate-glow-pulse">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-accent-500/3 pointer-events-none" />
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-primary-500/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-accent-500/5 blur-3xl" />

          <div className="relative">
            <h2 className="text-3xl font-bold text-surface-50 mb-4">Ready to simplify your team's workflow?</h2>
            <p className="text-surface-400 max-w-lg mx-auto mb-8">
              Create an account to start managing teams, delegating tasks, and running clean development cycles today.
            </p>
            <div className="flex justify-center">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl gradient-animated text-white font-semibold hover:opacity-95 transition-all shadow-md shadow-primary-500/20"
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl gradient-animated text-white font-semibold hover:opacity-95 transition-all shadow-md shadow-primary-500/20"
                >
                  Create Free Account
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-700/40 bg-surface-900/80 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-surface-500 text-sm">
            <Sparkles className="w-4 h-4 text-primary-500" />
            <span>TaskFlow © {new Date().getFullYear()}. All rights reserved.</span>
          </div>
          <div className="flex gap-6 text-xs text-surface-500 font-medium">
            <span>Free Evaluation Version</span>
            <span>Made with ❤</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
