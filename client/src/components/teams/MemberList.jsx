import { Crown, Shield, User, Trash2 } from 'lucide-react';

const roleConfig = {
  owner: { label: 'Owner', icon: Crown, color: 'text-warning-400 bg-warning-500/10 border-warning-500/20' },
  admin: { label: 'Admin', icon: Shield, color: 'text-primary-400 bg-primary-500/10 border-primary-500/20' },
  member: { label: 'Member', icon: User, color: 'text-surface-400 bg-surface-500/10 border-surface-500/20' },
};

export default function MemberList({ members, currentUserId, userRole, onRemove }) {
  const canManageMembers = userRole === 'owner' || userRole === 'admin';

  return (
    <div className="space-y-2">
      {members.map((member) => {
        const role = roleConfig[member.role] || roleConfig.member;
        const RoleIcon = role.icon;
        const isSelf = member.id === currentUserId;

        return (
          <div
            key={member.id}
            className="flex items-center justify-between p-3 rounded-xl glass-light border border-surface-700/20 hover:border-surface-600/30 transition-all-300 group"
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full gradient-accent flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                {member.name?.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-surface-200 truncate">
                    {member.name}
                    {isSelf && <span className="text-xs text-surface-500 ml-1">(you)</span>}
                  </span>
                </div>
                <p className="text-xs text-surface-500 truncate">{member.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Role badge */}
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${role.color}`}>
                <RoleIcon className="w-3 h-3" />
                {role.label}
              </span>

              {/* Remove button */}
              {canManageMembers && !isSelf && member.role !== 'owner' && (
                <button
                  onClick={() => onRemove(member.id)}
                  className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-danger-500/10 text-surface-500 hover:text-danger-400 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
