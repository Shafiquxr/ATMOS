import { useState, useEffect } from 'react';
import { Plus, Mail, MoreVertical, UserMinus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Modal, ModalFooter } from '../ui/Modal';
import { Group, GroupMember, UserRole } from '../../types';
import { useGroupStore } from '../../stores/groupStore';
import { useAuthStore } from '../../stores/authStore';
import { useToastStore } from '../../stores/toastStore';
import { useNotificationStore } from '../../stores/notificationStore';
import { sanitizeEmail, sanitizePhoneNumber } from '../../utils/security';

interface GroupMembersTabProps {
  group: Group;
}

export function GroupMembersTab({ group }: GroupMembersTabProps) {
  const { user } = useAuthStore();
  const { members, addMember, removeMember, updateMemberRole, fetchMembers } = useGroupStore();
  const { addToast } = useToastStore();
  const { addNotification } = useNotificationStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMemberMenuOpen, setIsMemberMenuOpen] = useState<string | null>(null);

  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<UserRole>('member');
  const [newMemberContact, setNewMemberContact] = useState('');

  const groupMembers = members.filter((m) => m.group_id === group.id);
  const { users: allUsers, fetchUsers } = useAuthStore();
  const isOwner = user?.id === group.owner_id;

  useEffect(() => {
    fetchUsers();
    fetchMembers(group.id);
  }, [group.id, fetchUsers, fetchMembers]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const sanitizedEmail = sanitizeEmail(newMemberEmail);

      if (!sanitizedEmail) {
        addToast('error', 'Invalid email address');
        return;
      }

      // Try to find if user exists
      const existingUser = allUsers.find(u => u.email === sanitizedEmail);

      await addMember(
        group.id,
        existingUser?.id || sanitizedEmail,
        newMemberRole
      );

      addNotification({
        user_id: user!.id,
        group_id: group.id,
        type: 'member_joined',
        title: 'New Member Added',
        message: `${existingUser?.full_name || sanitizedEmail} has been added to ${group.name}`,
        send_email: true,
        send_sms: false,
        email_sent: false,
        sms_sent: false,
      });

      addToast('success', 'Member added successfully');
      setNewMemberEmail('');
      setNewMemberRole('member');
      setNewMemberContact('');
      setIsAddModalOpen(false);
    } catch (error) {
      addToast('error', 'Failed to add member');
    }
  };

  const handleRemoveMember = (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) {
      return;
    }

    removeMember(group.id, memberId);
    addToast('success', 'Member removed successfully');
    setIsMemberMenuOpen(null);
  };

  const handleRoleChange = (memberId: string, newRole: UserRole) => {
    updateMemberRole(memberId, newRole);
    addToast('success', 'Member role updated');
    setIsMemberMenuOpen(null);
  };

  const roleLabels: Record<UserRole, string> = {
    owner: 'Owner',
    organizer: 'Organizer',
    team_lead: 'Team Lead',
    finance_rep: 'Finance Rep',
    member: 'Member',
    vendor: 'Vendor',
  };

  const roleColors: Record<UserRole, 'default' | 'success' | 'error' | 'warning'> = {
    owner: 'error',
    organizer: 'success',
    team_lead: 'warning',
    finance_rep: 'success',
    member: 'default',
    vendor: 'default',
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Group Members ({members.length})</CardTitle>
            {isOwner && (
              <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
                <Plus size={18} className="mr-2" />
                Add Member
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {members.length > 0 ? (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border-2 border-nostalgic-200 hover:bg-nostalgic-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-nostalgic-200 flex items-center justify-center">
                      <UserIcon member={member} />
                    </div>
                    <div>
                      <p className="font-medium">
                        {member.user?.full_name ||
                          allUsers.find(u => u.id === member.user_id)?.full_name ||
                          (member.user_id === user?.id ? user?.full_name : null) ||
                          'Pending Invite'}
                      </p>
                      <p className="text-sm text-nostalgic-600">
                        {member.user?.email ||
                          allUsers.find(u => u.id === member.user_id)?.email ||
                          (member.user_id === user?.id ? user?.email : null) ||
                          member.user_id}
                      </p>
                      {member.contact_info && (['owner', 'organizer', 'team_lead'].includes(
                        members.find(m => m.user_id === user?.id || m.user_id === user?.email)?.role || ''
                      ) || isOwner) && (
                          <p className="text-xs text-nostalgic-500 mt-0.5">
                            Contact: {member.contact_info}
                          </p>
                        )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant={roleColors[member.role]} size="sm">
                      {roleLabels[member.role]}
                    </Badge>

                    {isOwner && member.user_id !== group.owner_id && (
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsMemberMenuOpen(
                            isMemberMenuOpen === member.id ? null : member.id
                          )}
                        >
                          <MoreVertical size={18} />
                        </Button>

                        {isMemberMenuOpen === member.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-black shadow-retro-lg z-10">
                            <div className="py-2">
                              <p className="px-4 py-1 text-sm font-medium text-nostalgic-600">
                                Change Role
                              </p>
                              {(Object.keys(roleLabels) as UserRole[]).map((role) => (
                                <button
                                  key={role}
                                  onClick={() => handleRoleChange(member.id, role)}
                                  className={`w-full px-4 py-2 text-left hover:bg-nostalgic-100 text-sm ${member.role === role ? 'font-bold' : ''
                                    }`}
                                >
                                  {roleLabels[role]}
                                </button>
                              ))}
                              <div className="border-t border-nostalgic-200 my-2" />
                              <button
                                onClick={() => handleRemoveMember(member.id)}
                                className="w-full px-4 py-2 text-left hover:bg-red-50 text-red-600 text-sm flex items-center gap-2"
                              >
                                <UserMinus size={16} />
                                Remove Member
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Mail size={48} className="mx-auto text-nostalgic-400 mb-4" />
              <p className="text-lg font-medium mb-2">No members yet</p>
              <p className="text-nostalgic-600 mb-4">Add members to start collaborating</p>
              {isOwner && (
                <Button onClick={() => setIsAddModalOpen(true)}>
                  <Plus size={18} className="mr-2" />
                  Add First Member
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Member Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setNewMemberEmail('');
          setNewMemberRole('member');
        }}
        title="Add New Member"
      >
        <form onSubmit={handleAddMember}>
          <div className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              required
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              placeholder="Enter member's email"
            />

            <Input
              label="Contact Number (Optional)"
              type="text"
              value={newMemberContact}
              onChange={(e) => setNewMemberContact(e.target.value)}
              placeholder="Enter phone number or other contact info"
            />

            <div>
              <label className="block text-sm font-medium mb-1.5">Role</label>
              <select
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                <option value="member">Member</option>
                <option value="organizer">Organizer</option>
                <option value="team_lead">Team Lead</option>
                <option value="finance_rep">Finance Rep</option>
              </select>
            </div>
          </div>

          <ModalFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => {
              setIsAddModalOpen(false);
              setNewMemberEmail('');
              setNewMemberRole('member');
            }}>
              Cancel
            </Button>
            <Button type="submit">Add Member</Button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
}

function UserIcon({ member }: { member: GroupMember }) {
  const name = member.user?.full_name || member.user_id;
  const initial = name.charAt(0).toUpperCase();
  return <span className="text-lg font-bold text-nostalgic-700">{initial}</span>;
}
