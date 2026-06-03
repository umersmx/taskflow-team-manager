import { Search, X } from 'lucide-react';

export default function TaskFilters({ filters, onChange, teams }) {
  function setFilter(key, value) {
    onChange({ ...filters, [key]: value });
  }

  function clearFilters() {
    onChange({ search: '', team_id: '', assigned_to: '', status: '', priority: '' });
  }

  const hasFilters = filters.search || filters.team_id || filters.assigned_to || filters.status || filters.priority;

  const selectClass = "px-3 py-2 rounded-xl bg-surface-800/50 border border-surface-700/50 text-sm text-surface-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all-300";

  const statusPills = [
    { value: '', label: 'All' },
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'review', label: 'Review' },
    { value: 'done', label: 'Done' },
  ];

  const priorityPills = [
    { value: '', label: 'All' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ];

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Search + Dropdowns */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-800/50 border border-surface-700/50 text-sm text-surface-200 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all-300"
          />
        </div>

        {/* Team filter */}
        <select
          value={filters.team_id}
          onChange={(e) => setFilter('team_id', e.target.value)}
          className={selectClass}
        >
          <option value="">All Teams</option>
          {teams?.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>

        {/* Assignee filter */}
        <select
          value={filters.assigned_to}
          onChange={(e) => setFilter('assigned_to', e.target.value)}
          className={selectClass}
        >
          <option value="">All Members</option>
          <option value="me">Assigned to Me</option>
          <option value="unassigned">Unassigned</option>
        </select>

        {/* Clear button */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-surface-400 hover:text-surface-200 hover:bg-surface-700/50 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Status pills */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-surface-500 py-1.5 mr-1">Status:</span>
        {statusPills.map((pill) => (
          <button
            key={pill.value}
            onClick={() => setFilter('status', pill.value)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all-300 ${
              filters.status === pill.value
                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                : 'text-surface-400 hover:bg-surface-700/50 border border-transparent'
            }`}
          >
            {pill.label}
          </button>
        ))}

        <span className="text-surface-700 mx-1">|</span>
        <span className="text-xs text-surface-500 py-1.5 mr-1">Priority:</span>
        {priorityPills.map((pill) => (
          <button
            key={pill.value}
            onClick={() => setFilter('priority', pill.value)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all-300 ${
              filters.priority === pill.value
                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                : 'text-surface-400 hover:bg-surface-700/50 border border-transparent'
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>
    </div>
  );
}
