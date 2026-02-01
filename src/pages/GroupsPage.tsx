import { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { AppLayout } from '../layouts/AppLayout';
import { Button } from '../components/ui/Button';
import { GroupCard } from '../components/groups/GroupCard';
import { CreateGroupModal } from '../components/groups/CreateGroupModal';
import { useGroupStore } from '../stores/groupStore';

export function GroupsPage() {
  const { groups } = useGroupStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'archived'>('all');

  // Mock data for demonstration
  const mockGroups = groups.length > 0 ? groups : [
    {
      id: '1',
      name: 'Tech Conference 2024',
      description: 'Annual technology conference with speakers from around the world',
      category: 'event' as const,
      start_date: '2024-06-15',
      location: 'San Francisco, CA',
      owner_id: '1',
      status: 'active' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Europe Trip Summer',
      description: '2-week backpacking trip across Europe',
      category: 'trip' as const,
      start_date: '2024-07-01',
      end_date: '2024-07-15',
      location: 'Europe',
      owner_id: '1',
      status: 'active' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Photography Club',
      description: 'Monthly meetups and photo walks',
      category: 'club' as const,
      location: 'New York, NY',
      owner_id: '1',
      status: 'active' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const filteredGroups = mockGroups.filter((group) => {
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
            {filteredGroups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                memberCount={12}
                balance={25000}
                pendingTasks={3}
                userRole="owner"
              />
            ))}
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
