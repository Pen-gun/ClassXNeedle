import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminDeleteUser, adminGetUsers, adminToggleUserStatus } from '../../../lib/api';
import SectionShell from '../SectionShell';
import { formatCurrency } from '../utils';

const UsersSection = () => {
  const qc = useQueryClient();
  const { data: usersData } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminGetUsers({ page: 1, limit: 100 })
  });
  const users = usersData?.users ?? [];

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => adminToggleUserStatus(id, active),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] })
  });
  const deleteMutation = useMutation({
    mutationFn: adminDeleteUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] })
  });

  return (
    <SectionShell title="Users" subtitle="Manage customer access and activity.">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-medium">User list</h3>
        <div className="mt-4 space-y-3">
          {users.map((user) => (
            <div
              key={user._id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-black/30 px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">{user.fullName || user.username}</p>
                <p className="text-xs text-stone-400">{user.email || 'No email'}</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-stone-400">Orders: {user.totalOrders ?? 0}</span>
                <span className="text-stone-400">Spent: {formatCurrency(user.totalSpent)}</span>
                <button
                  onClick={() => toggleMutation.mutate({ id: user._id, active: !user.active })}
                  className="btn-secondary text-xs"
                >
                  {user.active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => deleteMutation.mutate(user._id)}
                  className="btn-ghost text-xs text-red-400 hover:text-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {users.length === 0 && <p className="text-stone-400">No users available.</p>}
        </div>
      </div>
    </SectionShell>
  );
};

export default UsersSection;
