import { create } from 'zustand';
import { Group, GroupMember, SubGroup, User } from '../types';
import { storageGet, storageSet } from '../utils/storage';
import { generateUniqueId } from '../utils/idGenerator';

const GROUPS_STORAGE_KEY = 'atmos_groups';
const MEMBERS_STORAGE_KEY = 'atmos_group_members';
const SUBGROUPS_STORAGE_KEY = 'atmos_subgroups';

interface GroupState {
    groups: Group[];
    currentGroup: Group | null;
    members: GroupMember[];
    subGroups: SubGroup[];
    isLoading: boolean;
    error: string | null;

    // Group actions
    setGroups: (groups: Group[]) => void;
    setCurrentGroup: (group: Group | null) => void;
    fetchGroups: () => Promise<void>;
    fetchGroupById: (groupId: string) => Promise<Group | null>;
    createGroup: (groupData: Partial<Group>) => Promise<Group>;
    updateGroup: (groupId: string, updates: Partial<Group>) => Promise<void>;
    deleteGroup: (groupId: string) => Promise<void>;

    // Member actions
    fetchMembers: (groupId: string) => Promise<void>;
    addMember: (groupId: string, userId: string, role?: string) => Promise<void>;
    removeMember: (groupId: string, userId: string) => Promise<void>;
    updateMemberRole: (memberId: string, role: string) => Promise<void>;

    // SubGroup actions
    fetchSubGroups: (groupId: string) => Promise<void>;
    createSubGroup: (groupId: string, name: string, description?: string) => Promise<SubGroup>;
    deleteSubGroup: (subGroupId: string) => Promise<void>;

    // Utility
    clearLocalData: () => void;
    subscribeToRealtimeUpdates: () => void;
    getUserRole: (groupId: string, userId: string) => string | null;
}

const loadGroupsFromStorage = (): Group[] => {
    return storageGet<Group[]>(GROUPS_STORAGE_KEY, []);
};

const loadMembersFromStorage = (): GroupMember[] => {
    return storageGet<GroupMember[]>(MEMBERS_STORAGE_KEY, []);
};

const loadSubGroupsFromStorage = (): SubGroup[] => {
    return storageGet<SubGroup[]>(SUBGROUPS_STORAGE_KEY, []);
};

export const useGroupStore = create<GroupState>((set, get) => ({
    groups: [],
    currentGroup: null,
    members: [],
    subGroups: [],
    isLoading: false,
    error: null,

    setGroups: (groups) => set({ groups }),

    setCurrentGroup: (group) => set({ currentGroup: group }),

    fetchGroups: async () => {
        set({ isLoading: true, error: null });
        try {
            const groups = loadGroupsFromStorage();
            const members = loadMembersFromStorage();

            // Add member count to each group
            const groupsWithCount = groups.map((group) => ({
                ...group,
                member_count: members.filter((m) => m.group_id === group.id).length,
            }));

            set({ groups: groupsWithCount });
        } catch (error) {
            console.error('Failed to fetch groups:', error);
            set({ error: 'Failed to fetch groups' });
        } finally {
            set({ isLoading: false });
        }
    },

    fetchGroupById: async (groupId: string) => {
        try {
            const groups = loadGroupsFromStorage();
            const group = groups.find((g) => g.id === groupId) || null;
            if (group) {
                set({ currentGroup: group });
            }
            return group;
        } catch (error) {
            console.error('Failed to fetch group:', error);
            return null;
        }
    },

    createGroup: async (groupData) => {
        set({ isLoading: true });
        try {
            const { useAuthStore } = await import('./authStore');
            const currentUser = useAuthStore.getState().user;

            if (!currentUser) {
                throw new Error('User not authenticated');
            }

            const newGroup: Group = {
                id: generateUniqueId(),
                name: groupData.name || 'New Group',
                description: groupData.description,
                category: groupData.category,
                start_date: groupData.start_date,
                end_date: groupData.end_date,
                location: groupData.location,
                owner_id: currentUser.id,
                status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                member_count: 1,
            };

            const groups = loadGroupsFromStorage();
            const updatedGroups = [...groups, newGroup];
            storageSet(GROUPS_STORAGE_KEY, updatedGroups);

            // Add owner as a member
            const members = loadMembersFromStorage();
            const ownerMember: GroupMember = {
                id: generateUniqueId(),
                group_id: newGroup.id,
                user_id: currentUser.id,
                role: 'owner',
                joined_at: new Date().toISOString(),
            };
            const updatedMembers = [...members, ownerMember];
            storageSet(MEMBERS_STORAGE_KEY, updatedMembers);

            set({ groups: updatedGroups, members: updatedMembers });

            return newGroup;
        } catch (error) {
            console.error('Failed to create group:', error);
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    updateGroup: async (groupId, updates) => {
        try {
            const groups = loadGroupsFromStorage();
            const updatedGroups = groups.map((g) =>
                g.id === groupId
                    ? { ...g, ...updates, updated_at: new Date().toISOString() }
                    : g
            );
            storageSet(GROUPS_STORAGE_KEY, updatedGroups);
            set({ groups: updatedGroups });

            if (get().currentGroup?.id === groupId) {
                set({ currentGroup: updatedGroups.find((g) => g.id === groupId) || null });
            }
        } catch (error) {
            console.error('Failed to update group:', error);
            throw error;
        }
    },

    deleteGroup: async (groupId) => {
        try {
            const groups = loadGroupsFromStorage();
            const updatedGroups = groups.filter((g) => g.id !== groupId);
            storageSet(GROUPS_STORAGE_KEY, updatedGroups);

            const members = loadMembersFromStorage();
            const updatedMembers = members.filter((m) => m.group_id !== groupId);
            storageSet(MEMBERS_STORAGE_KEY, updatedMembers);

            set({ groups: updatedGroups, members: updatedMembers });

            if (get().currentGroup?.id === groupId) {
                set({ currentGroup: null });
            }
        } catch (error) {
            console.error('Failed to delete group:', error);
            throw error;
        }
    },

    fetchMembers: async (groupId) => {
        set({ isLoading: true });
        try {
            const allMembers = loadMembersFromStorage();
            const groupMembers = allMembers.filter((m) => m.group_id === groupId);

            // Load user data for each member
            const { useAuthStore } = await import('./authStore');
            const users = useAuthStore.getState().users;

            const membersWithUsers = groupMembers.map((member) => ({
                ...member,
                user: users.find((u) => u.id === member.user_id),
            }));

            set({ members: membersWithUsers });
        } catch (error) {
            console.error('Failed to fetch members:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    addMember: async (groupId, userId, role = 'member') => {
        try {
            const members = loadMembersFromStorage();

            // Check if already a member
            const existing = members.find(
                (m) => m.group_id === groupId && m.user_id === userId
            );
            if (existing) {
                throw new Error('User is already a member');
            }

            const newMember: GroupMember = {
                id: generateUniqueId(),
                group_id: groupId,
                user_id: userId,
                role: role as any,
                joined_at: new Date().toISOString(),
            };

            const updatedMembers = [...members, newMember];
            storageSet(MEMBERS_STORAGE_KEY, updatedMembers);

            // Refresh members list
            await get().fetchMembers(groupId);

            // Update group member count
            await get().fetchGroups();
        } catch (error) {
            console.error('Failed to add member:', error);
            throw error;
        }
    },

    removeMember: async (groupId, userId) => {
        try {
            const members = loadMembersFromStorage();
            const updatedMembers = members.filter(
                (m) => !(m.group_id === groupId && m.user_id === userId)
            );
            storageSet(MEMBERS_STORAGE_KEY, updatedMembers);

            await get().fetchMembers(groupId);
            await get().fetchGroups();
        } catch (error) {
            console.error('Failed to remove member:', error);
            throw error;
        }
    },

    updateMemberRole: async (memberId, role) => {
        try {
            const members = loadMembersFromStorage();
            const updatedMembers = members.map((m) =>
                m.id === memberId ? { ...m, role: role as any } : m
            );
            storageSet(MEMBERS_STORAGE_KEY, updatedMembers);
            set({ members: updatedMembers.filter((m) => get().currentGroup && m.group_id === get().currentGroup?.id) });
        } catch (error) {
            console.error('Failed to update member role:', error);
            throw error;
        }
    },

    fetchSubGroups: async (groupId) => {
        try {
            const allSubGroups = loadSubGroupsFromStorage();
            const groupSubGroups = allSubGroups.filter((sg) => sg.group_id === groupId);
            set({ subGroups: groupSubGroups });
        } catch (error) {
            console.error('Failed to fetch subgroups:', error);
        }
    },

    createSubGroup: async (groupId, name, description) => {
        try {
            const subGroups = loadSubGroupsFromStorage();
            const newSubGroup: SubGroup = {
                id: generateUniqueId(),
                group_id: groupId,
                name,
                description,
                created_at: new Date().toISOString(),
            };

            const updatedSubGroups = [...subGroups, newSubGroup];
            storageSet(SUBGROUPS_STORAGE_KEY, updatedSubGroups);
            set({ subGroups: updatedSubGroups.filter((sg) => sg.group_id === groupId) });

            return newSubGroup;
        } catch (error) {
            console.error('Failed to create subgroup:', error);
            throw error;
        }
    },

    deleteSubGroup: async (subGroupId) => {
        try {
            const subGroups = loadSubGroupsFromStorage();
            const updatedSubGroups = subGroups.filter((sg) => sg.id !== subGroupId);
            storageSet(SUBGROUPS_STORAGE_KEY, updatedSubGroups);
            set({ subGroups: updatedSubGroups });
        } catch (error) {
            console.error('Failed to delete subgroup:', error);
            throw error;
        }
    },

    clearLocalData: () => {
        set({
            groups: [],
            currentGroup: null,
            members: [],
            subGroups: [],
        });
    },

    subscribeToRealtimeUpdates: () => {
        // No-op for localStorage version
        // Real-time updates would require a backend
        console.log('[groupStore] Real-time updates not available in localStorage mode');
    },

    getUserRole: (groupId, userId) => {
        const members = loadMembersFromStorage();
        const member = members.find(
            (m) => m.group_id === groupId && m.user_id === userId
        );
        return member?.role || null;
    },
}));

// Listen for storage events to sync across tabs
window.addEventListener('storage', (event) => {
    if (event.key === GROUPS_STORAGE_KEY || event.key === MEMBERS_STORAGE_KEY) {
        useGroupStore.getState().fetchGroups();
    }
});
