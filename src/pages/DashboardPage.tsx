import { Link } from 'react-router-dom';
import { Users, CheckSquare, Wallet as WalletIcon, Plus, AlertTriangle } from 'lucide-react';
import { AppLayout } from '../layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../stores/authStore';

export function DashboardPage() {
  const { user } = useAuthStore();

  // Mock data for demonstration
  const stats = {
    totalGroups: 3,
    pendingTasks: 5,
    totalBalance: 45000,
  };

  const alerts = [
    { id: 1, type: 'warning', message: 'Payment due for Tech Conference venue - ₹15,000', link: '/wallet' },
    { id: 2, type: 'urgent', message: '3 tasks overdue in Europe Trip', link: '/tasks' },
  ];

  const recentGroups = [
    {
      id: '1',
      name: 'Tech Conference 2024',
      role: 'owner',
      members: 12,
      balance: 25000,
      pendingTasks: 3,
      overdueTasks: 0,
    },
    {
      id: '2',
      name: 'Europe Trip Summer',
      role: 'organizer',
      members: 8,
      balance: 15000,
      pendingTasks: 2,
      overdueTasks: 1,
    },
    {
      id: '3',
      name: 'Photography Club',
      role: 'member',
      members: 25,
      balance: 5000,
      pendingTasks: 0,
      overdueTasks: 0,
    },
  ];

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
