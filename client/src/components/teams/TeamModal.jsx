import { useState } from 'react';
import Modal from '../ui/Modal';
import { Loader2 } from 'lucide-react';

export default function TeamModal({ isOpen, onClose, onSubmit, team }) {
  const isEdit = !!team;
  const [name, setName] = useState(team?.name || '');
  const [description, setDescription] = useState(team?.description || '');
  const [loading, setLoading] = useState(false);

  // Reset form when modal opens
  useState(() => {
    if (isOpen) {
      setName(team?.name || '');
      setDescription(team?.description || '');
    }
  }, [isOpen, team]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ name, description });
      onClose();
    } catch {
      // Error handled by parent
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Team' : 'Create Team'} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="team-name" className="block text-sm font-medium text-surface-300 mb-1.5">
            Team name *
          </label>
          <input
            id="team-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Engineering"
            className="w-full px-3 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/50 text-white text-sm placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all-300"
            required
          />
        </div>

        <div>
          <label htmlFor="team-desc" className="block text-sm font-medium text-surface-300 mb-1.5">
            Description
          </label>
          <textarea
            id="team-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this team work on?"
            rows={3}
            className="w-full px-3 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/50 text-white text-sm placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all-300 resize-none"
          />
        </div>

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
            disabled={loading || !name.trim()}
            className="px-6 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all-300 flex items-center gap-2 shadow-lg shadow-primary-500/20"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit ? 'Update' : 'Create Team'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
