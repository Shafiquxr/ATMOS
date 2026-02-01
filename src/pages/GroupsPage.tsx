import { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { AppLayout } from '../layouts/AppLayout';
import { Button } from '../components/ui/Button';
import { GroupCard } from '../components/groups/GroupCard';
import { CreateGroupModal } from '../components/groups/CreateGroupModal';
import { useGroupStore } from '../stores/groupStore';
import { useAuthStore } from '../stores/authStore';
import { useTaskStore } from '../stores/taskStore';
import { useWalletStore } from '../stores/walletStore';

export function GroupsPage() {
  const { groups, members } = useGroupStore();
  const { user } = useAuthStore();
  const { getGroupTasks } = useTaskStore();
  const { getGroupWallet } = useWalletStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'archived'>('all');

  const userGroups = groups.filter((group) => 
    group.owner_id === user?.id || 
    members.some((m) => m.group_id === group.id && (m.user_id === user?.id || m.user_id === user?.email))
  );

  const filteredGroups = userGroups.filter((group) => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || group.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-mono font-bold">My Groups</h1>
            <p className="text-nostalgic-600 mt-1">
              Manage your groups and collaborations
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={20} className="mr-2" />
            Create Group
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-nostalgic-500" size={20} />
              <input
                type="text"
                placeholder="Search groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter size={20} className="text-nostalgic-600" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="px-4 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Groups Grid */}
        {filteredGroups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => {
              const tasks = getGroupTasks(group.id);
              const wallet = getGroupWallet(group.id);
              const pendingTasks = tasks.filter((t) => t.status !== 'completed').length;
              
              const groupMembers = members.filter((m) => m.group_id === group.id);
              const memberCount = groupMembers.length;
              const userMember = groupMembers.find(
                (m) => m.user_id === user?.id || m.user_id === user?.email
              );
              const userRole = userMember?.role || (group.owner_id === user?.id ? 'owner' : 'member');

              return (
                <GroupCard
                  key={group.id}
                  group={group}
                  memberCount={memberCount}
                  balance={wallet?.balance || 0}
                  pendingTasks={pendingTasks}
                  userRole={userRole}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-block p-6 bg-white border-2 border-black shadow-retro-sm">
              <p className="text-lg font-medium mb-2">No groups found</p>
              <p className="text-nostalgic-600 mb-4">
                {searchQuery ? 'Try adjusting your search' : 'Create your first group to get started'}
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus size={20} className="mr-2" />
                  Create Group
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </AppLayout>
  );
}
