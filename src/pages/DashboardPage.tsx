import { Link } from 'react-router-dom';
import { Users, CheckSquare, Wallet as WalletIcon, Plus, AlertTriangle } from 'lucide-react';
import { AppLayout } from '../layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../stores/authStore';
import { useGroupStore } from '../stores/groupStore';
import { useTaskStore } from '../stores/taskStore';
import { useWalletStore } from '../stores/walletStore';

export function DashboardPage() {
  const { user } = useAuthStore();
  const { groups, members } = useGroupStore();
  const { getGroupTasks } = useTaskStore();
  const { getGroupWallet } = useWalletStore();

  const userGroups = groups.filter((group) => 
    group.owner_id === user?.id || 
    members.some((m) => m.group_id === group.id && (m.user_id === user?.id || m.user_id === user?.email))
  );

  // Calculate stats from real data
  const totalBalance = userGroups.reduce((sum, group) => {
    const wallet = getGroupWallet(group.id);
    return sum + (wallet?.balance || 0);
  }, 0);

  const totalTasks = userGroups.reduce((sum, group) => {
    const tasks = getGroupTasks(group.id);
    return sum + tasks.length;
  }, 0);

  const pendingTasksCount = userGroups.reduce((sum, group) => {
    const tasks = getGroupTasks(group.id);
    return sum + tasks.filter((t) => t.status !== 'completed').length;
  }, 0);

  const stats = {
    totalGroups: userGroups.length,
    pendingTasks: pendingTasksCount,
    totalBalance,
  };

  // Generate alerts based on real data
  const alerts: Array<{ id: string; type: 'info' | 'urgent'; message: string; link: string }> = [];
  userGroups.forEach((group) => {
    const tasks = getGroupTasks(group.id);
    const wallet = getGroupWallet(group.id);
    const overdueTasks = tasks.filter((t) =>
      t.status !== 'completed' && t.deadline && new Date(t.deadline) < new Date()
    );

    if (wallet?.balance && wallet.balance > 0) {
      alerts.push({
        id: `wallet-${group.id}`,
        type: 'info' as const,
        message: `${group.name}: ₹${wallet.balance.toLocaleString()} available in wallet`,
        link: `/groups/${group.id}/wallet`,
      });
    }

    if (overdueTasks.length > 0) {
      alerts.push({
        id: `tasks-${group.id}`,
        type: 'urgent' as const,
        message: `${group.name}: ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}`,
        link: `/groups/${group.id}/tasks`,
      });
    }
  });

  const recentGroups = userGroups.slice(0, 3).map((group) => {
    const tasks = getGroupTasks(group.id);
    const wallet = getGroupWallet(group.id);
    const pendingTasksCount = tasks.filter((t) => t.status !== 'completed').length;
    const overdueTasks = tasks.filter((t) => 
      t.status !== 'completed' && t.deadline && new Date(t.deadline) < new Date()
    ).length;
    
    const groupMembers = members.filter(m => m.group_id === group.id);
    const userMember = groupMembers.find(m => m.user_id === user?.id || m.user_id === user?.email);

    return {
      id: group.id,
      name: group.name,
      role: userMember?.role || (group.owner_id === user?.id ? 'owner' : 'member'),
      members: groupMembers.length,
      balance: wallet?.balance || 0,
      pendingTasks: pendingTasksCount,
      overdueTasks,
    };
  });

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-mono font-bold mb-2">
            Welcome back, {user?.full_name || 'User'}!
          </h2>
          <p className="text-nostalgic-600">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-black text-white">
                  <Users size={32} />
                </div>
                <div>
                  <p className="text-2xl font-mono font-bold">{stats.totalGroups}</p>
                  <p className="text-sm text-nostalgic-600">My Groups</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-600 text-white">
                  <CheckSquare size={32} />
                </div>
                <div>
                  <p className="text-2xl font-mono font-bold">{stats.pendingTasks}</p>
                  <p className="text-sm text-nostalgic-600">Pending Tasks</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-600 text-white">
                  <WalletIcon size={32} />
                </div>
                <div>
                  <p className="text-2xl font-mono font-bold">₹{stats.totalBalance.toLocaleString()}</p>
                  <p className="text-sm text-nostalgic-600">Total Balance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>⚠️ Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <Link
                    key={alert.id}
                    to={alert.link}
                    className="flex items-start gap-3 p-3 border-2 border-amber-600 bg-amber-50 hover:bg-amber-100 transition-colors"
                  >
                    <AlertTriangle className="flex-shrink-0 text-amber-600" size={20} />
                    <p className="text-sm">{alert.message}</p>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Groups Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-mono font-bold">My Groups</h3>
            <Link to="/groups">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {recentGroups.map((group) => (
              <Link key={group.id} to={`/groups/${group.id}`}>
                <Card hover>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-mono font-bold text-lg">{group.name}</h4>
                          <Badge variant="default" size="sm">
                            {group.role.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex gap-6 text-sm text-nostalgic-600">
                          <span className="flex items-center gap-1">
                            <Users size={14} />
                            {group.members} members
                          </span>
                          <span className="flex items-center gap-1">
                            <WalletIcon size={14} />
                            ₹{group.balance.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckSquare size={14} />
                            {group.pendingTasks} tasks
                            {group.overdueTasks > 0 && (
                              <span className="text-red-600 font-medium">
                                ({group.overdueTasks} overdue)
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {recentGroups.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-block p-6 bg-white border-2 border-black shadow-retro-sm">
                <p className="text-lg font-medium mb-2">No groups yet</p>
                <p className="text-nostalgic-600 mb-4">Create your first group to get started</p>
                <Link to="/groups">
                  <Button>
                    <Plus size={20} className="mr-2" />
                    Create Group
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link to="/groups">
                <button className="w-full p-4 border-2 border-black hover:bg-nostalgic-100 transition-colors flex flex-col items-center gap-2">
                  <Plus size={24} />
                  <span className="font-medium">Create New Group</span>
                </button>
              </Link>
              <Link to="/groups">
                <button className="w-full p-4 border-2 border-black hover:bg-nostalgic-100 transition-colors flex flex-col items-center gap-2">
                  <Users size={24} />
                  <span className="font-medium">Join Group</span>
                </button>
              </Link>
              <Link to="/wallet">
                <button className="w-full p-4 border-2 border-black hover:bg-nostalgic-100 transition-colors flex flex-col items-center gap-2">
                  <WalletIcon size={24} />
                  <span className="font-medium">View Wallet</span>
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
