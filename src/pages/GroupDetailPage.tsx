import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Users, CheckSquare, Wallet, Calendar, 
  Building2, FileText, MoreVertical, Edit, Trash2, Share2
} from 'lucide-react';
import { AppLayout } from '../layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuthStore } from '../stores/authStore';
import { useGroupStore } from '../stores/groupStore';
import { useWalletStore } from '../stores/walletStore';
import { useTaskStore } from '../stores/taskStore';
import { useBookingStore } from '../stores/bookingStore';
import { useNotificationStore } from '../stores/notificationStore';
import { GroupMembersTab } from '../components/groups/GroupMembersTab';
import { GroupTasksTab } from '../components/groups/GroupTasksTab';
import { GroupWalletTab } from '../components/groups/GroupWalletTab';
import { GroupBookingsTab } from '../components/groups/GroupBookingsTab';
import { GroupVendorsTab } from '../components/groups/GroupVendorsTab';
import { GroupReportsTab } from '../components/groups/GroupReportsTab';
import { EditGroupModal } from '../components/groups/EditGroupModal';

type TabType = 'overview' | 'members' | 'tasks' | 'wallet' | 'bookings' | 'vendors' | 'reports';

export function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { groups, currentGroup, setCurrentGroup, deleteGroup, members } = useGroupStore();
  const { fetchGroupWallet: getGroupWallet, createGroupWallet } = useWalletStore();
  const { getGroupTasks } = useTaskStore();
  const { getGroupBookings } = useBookingStore();
  const { addNotification } = useNotificationStore();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [wallet, setWallet] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const group = currentGroup?.id === groupId ? currentGroup : groups.find((g) => g.id === groupId);
  const groupMembers = members.filter(m => m.group_id === group?.id);

  useEffect(() => {
    if (group && group.id !== currentGroup?.id) {
      setCurrentGroup(group);
    }
  }, [group, currentGroup, setCurrentGroup]);

  useEffect(() => {
    const loadGroupData = async () => {
      if (!group) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        await createGroupWallet(group.id);
        const groupWallet = await getGroupWallet(group.id);
        setWallet(groupWallet);
      } catch (error) {
        console.error('Failed to load group data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadGroupData();
  }, [group, createGroupWallet, getGroupWallet]);

  if (!group) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <h2 className="text-2xl font-mono font-bold mb-4">Group not found</h2>
          <Button onClick={() => navigate('/groups')}>
            <ArrowLeft size={20} className="mr-2" />
            Back to Groups
          </Button>
        </div>
      </AppLayout>
    );
  }

  const tasks = getGroupTasks(group.id);
  const bookings = getGroupBookings(group.id);

  const isMember = group.owner_id === user?.id || groupMembers.some(m => m.user_id === user?.id || m.user_id === user?.email);

  if (!isMember) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <h2 className="text-2xl font-mono font-bold mb-4 text-red-600">Access Denied</h2>
          <p className="text-nostalgic-600 mb-6">You do not have permission to access this group.</p>
          <Button onClick={() => navigate('/groups')}>
            <ArrowLeft size={20} className="mr-2" />
            Back to My Groups
          </Button>
        </div>
      </AppLayout>
    );
  }

  const isOwner = user?.id === group.owner_id;

  const handleDeleteGroup = async () => {
    if (!confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return;
    }

    try {
      deleteGroup(group.id);
      addNotification({
        user_id: user!.id,
        type: 'group_update',
        title: 'Group Deleted',
        message: `Group "${group.name}" has been deleted`,
        send_email: false,
        send_sms: false,
        email_sent: false,
        sms_sent: false,
      });
      navigate('/groups');
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };

  const handleShareGroup = async () => {
    const shareLink = `${window.location.origin}/groups/${group.id}`;
    await navigator.clipboard.writeText(shareLink);
    alert('Group link copied to clipboard!');
  };

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: FileText },
    { id: 'members' as TabType, label: 'Members', icon: Users },
    { id: 'tasks' as TabType, label: 'Tasks', icon: CheckSquare },
    { id: 'wallet' as TabType, label: 'Wallet', icon: Wallet },
    { id: 'bookings' as TabType, label: 'Bookings', icon: Calendar },
    { id: 'vendors' as TabType, label: 'Vendors', icon: Building2 },
    { id: 'reports' as TabType, label: 'Reports', icon: FileText },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/groups">
              <Button variant="ghost" size="sm">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-mono font-bold">{group.name}</h1>
                <Badge variant={group.status === 'active' ? 'success' : 'default'} size="sm">
                  {group.status.toUpperCase()}
                </Badge>
              </div>
              <p className="text-nostalgic-600 mt-1">{group.description || 'No description'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Button variant="outline" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <MoreVertical size={20} />
              </Button>
              
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-black shadow-retro-lg z-10">
                  {isOwner && (
                    <>
                      <button
                        onClick={() => {
                          setIsEditModalOpen(true);
                          setIsMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-nostalgic-100 flex items-center gap-2"
                      >
                        <Edit size={16} />
                        Edit Group
                      </button>
                      <button
                        onClick={handleShareGroup}
                        className="w-full px-4 py-2 text-left hover:bg-nostalgic-100 flex items-center gap-2"
                      >
                        <Share2 size={16} />
                        Share Group
                      </button>
                      <button
                        onClick={handleDeleteGroup}
                        className="w-full px-4 py-2 text-left hover:bg-nostalgic-100 text-red-600 flex items-center gap-2"
                      >
                        <Trash2 size={16} />
                        Delete Group
                      </button>
                    </>
                  )}
                  {!isOwner && (
                    <button
                      onClick={handleShareGroup}
                      className="w-full px-4 py-2 text-left hover:bg-nostalgic-100 flex items-center gap-2"
                    >
                      <Share2 size={16} />
                      Share Group
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b-2 border-black">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-black bg-black text-white'
                      : 'border-transparent hover:bg-nostalgic-100'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Users className="text-nostalgic-600" size={24} />
                      <div>
                        <p className="text-2xl font-mono font-bold">
                          {groupMembers.length}
                        </p>
                        <p className="text-sm text-nostalgic-600">Members</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <CheckSquare className="text-nostalgic-600" size={24} />
                      <div>
                        <p className="text-2xl font-mono font-bold">{tasks.length}</p>
                        <p className="text-sm text-nostalgic-600">Tasks</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Wallet className="text-nostalgic-600" size={24} />
                      <div>
                        <p className="text-2xl font-mono font-bold">
                          ₹{wallet?.balance?.toLocaleString() || 0}
                        </p>
                        <p className="text-sm text-nostalgic-600">Balance</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="text-nostalgic-600" size={24} />
                      <div>
                        <p className="text-2xl font-mono font-bold">{bookings.length}</p>
                        <p className="text-sm text-nostalgic-600">Bookings</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Group Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Group Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-nostalgic-600 mb-1">Category</p>
                      <Badge>{group.category?.toUpperCase() || 'OTHER'}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-nostalgic-600 mb-1">Status</p>
                      <Badge variant={group.status === 'active' ? 'success' : 'default'}>
                        {group.status.toUpperCase()}
                      </Badge>
                    </div>
                    {group.start_date && (
                      <div>
                        <p className="text-sm text-nostalgic-600 mb-1">Start Date</p>
                        <p className="font-medium">
                          {new Date(group.start_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {group.end_date && (
                      <div>
                        <p className="text-sm text-nostalgic-600 mb-1">End Date</p>
                        <p className="font-medium">
                          {new Date(group.end_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {group.location && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-nostalgic-600 mb-1">Location</p>
                        <p className="font-medium">{group.location}</p>
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <p className="text-sm text-nostalgic-600 mb-1">Group ID</p>
                      <p className="font-mono text-sm">{group.id}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'members' && (
            <GroupMembersTab group={group} />
          )}

          {activeTab === 'tasks' && (
            <GroupTasksTab group={group} />
          )}

          {activeTab === 'wallet' && (
            <GroupWalletTab group={group} />
          )}

          {activeTab === 'bookings' && (
            <GroupBookingsTab group={group} />
          )}

          {activeTab === 'vendors' && (
            <GroupVendorsTab group={group} />
          )}

          {activeTab === 'reports' && (
            <GroupReportsTab group={group} />
          )}
        </div>
      </div>

      <EditGroupModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        group={group}
      />
    </AppLayout>
  );
}
