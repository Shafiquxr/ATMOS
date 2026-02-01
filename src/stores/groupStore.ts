import { create } from 'zustand';
import { Group, GroupMember, SubGroup } from '../types';
import { storageGet, storageSet, storageRemove } from '../utils/storage';
import { generateUniqueId } from '../utils/idGenerator';
import { useAuthStore } from './authStore';

const GROUPS_STORAGE_KEY = 'atmos_groups';
const MEMBERS_STORAGE_KEY = 'atmos_members';
const SUBGROUPS_STORAGE_KEY = 'atmos_subgroups';
const CURRENT_GROUP_KEY = 'atmos_current_group';

interface GroupState {
  groups: Group[];
  currentGroup: Group | null;
  members: GroupMember[];
  subGroups: SubGroup[];
  isLoading: boolean;
  setGroups: (groups: Group[]) => void;
  setCurrentGroup: (group: Group | null) => void;
  setMembers: (members: GroupMember[]) => void;
  addGroup: (group: Omit<Group, 'id' | 'owner_id' | 'status' | 'created_at' | 'updated_at'>) => Group;
  updateGroup: (id: string, updates: Partial<Group>) => void;
  deleteGroup: (id: string) => void;
  
  addMember: (groupId: string, member: Omit<GroupMember, 'id' | 'joined_at'>) => GroupMember;
  removeMember: (groupId: string, memberId: string) => void;
  updateMemberRole: (groupId: string, memberId: string, role: GroupMember['role']) => void;
  getGroupMembers: (groupId: string) => GroupMember[];
  
  addSubGroup: (subGroup: Omit<SubGroup, 'id' | 'created_at'>) => SubGroup;
  deleteSubGroup: (subGroupId: string) => void;
  getGroupSubGroups: (groupId: string) => SubGroup[];
  
  loadFromStorage: () => void;
  saveToStorage: () => void;
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
  groups: loadGroupsFromStorage(),
  currentGroup: storageGet<Group | null>(CURRENT_GROUP_KEY, null),
  members: loadMembersFromStorage(),
  subGroups: loadSubGroupsFromStorage(),
  isLoading: false,

  setGroups: (groups) => {
    set({ groups });
    storageSet(GROUPS_STORAGE_KEY, groups);
  },
  
  setCurrentGroup: (group) => {
    set({ currentGroup: group });
    if (group) {
      storageSet(CURRENT_GROUP_KEY, group);
    } else {
      storageRemove(CURRENT_GROUP_KEY);
    }
  },
  
  setMembers: (members) => {
    set({ members });
    storageSet(MEMBERS_STORAGE_KEY, members);
  },

  addGroup: (groupData) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('User must be logged in to create a group');

    const newGroup: Group = {
      id: generateUniqueId(),
      ...groupData,
      owner_id: user.id,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updatedGroups = [...get().groups, newGroup];
    
    set(() => ({
      groups: updatedGroups,
      currentGroup: newGroup,
    }));

    storageSet(GROUPS_STORAGE_KEY, updatedGroups);
    storageSet(CURRENT_GROUP_KEY, newGroup);

    const ownerMember: GroupMember = {
      id: generateUniqueId(),
      group_id: newGroup.id,
      user_id: user.id,
      role: 'owner',
      joined_at: new Date().toISOString(),
    };

    const updatedMembers = [...get().members, ownerMember];
    set({ members: updatedMembers });
    storageSet(MEMBERS_STORAGE_KEY, updatedMembers);

    return newGroup;
  },

  updateGroup: (id, updates) => {
    const updatedGroups = get().groups.map((g) =>
      g.id === id
        ? { ...g, ...updates, updated_at: new Date().toISOString() }
        : g
    );

    const current = get().currentGroup;
    const updatedCurrentGroup: Group | null = current?.id === id
      ? { ...current, ...updates, updated_at: new Date().toISOString() }
      : current;

    set({
      groups: updatedGroups,
      currentGroup: updatedCurrentGroup
    });

    storageSet(GROUPS_STORAGE_KEY, updatedGroups);
    if (updatedCurrentGroup) {
      storageSet(CURRENT_GROUP_KEY, updatedCurrentGroup);
    }
  },

  deleteGroup: (id) => {
    const updatedGroups = get().groups.filter((g) => g.id !== id);
    const updatedMembers = get().members.filter((m) => m.group_id !== id);
    const updatedSubGroups = get().subGroups.filter((sg) => sg.group_id !== id);
    const updatedCurrentGroup = get().currentGroup?.id === id ? null : get().currentGroup;

    set({ 
      groups: updatedGroups,
      currentGroup: updatedCurrentGroup,
      members: updatedMembers,
      subGroups: updatedSubGroups
    });

    storageSet(GROUPS_STORAGE_KEY, updatedGroups);
    storageSet(MEMBERS_STORAGE_KEY, updatedMembers);
    storageSet(SUBGROUPS_STORAGE_KEY, updatedSubGroups);
    if (updatedCurrentGroup) {
      storageSet(CURRENT_GROUP_KEY, updatedCurrentGroup);
    } else {
      storageRemove(CURRENT_GROUP_KEY);
    }
  },

  addMember: (_groupId, memberData) => {
    const newMember: GroupMember = {
      id: generateUniqueId(),
      ...memberData,
      joined_at: new Date().toISOString(),
    };

    const updatedMembers = [...get().members, newMember];
    set({ members: updatedMembers });
    storageSet(MEMBERS_STORAGE_KEY, updatedMembers);

    return newMember;
  },

  removeMember: (_groupId, memberId) => {
    const updatedMembers = get().members.filter((m) => m.id !== memberId);
    set({ members: updatedMembers });
    storageSet(MEMBERS_STORAGE_KEY, updatedMembers);
  },

  updateMemberRole: (_groupId, memberId, role) => {
    const updatedMembers = get().members.map((m) => 
      m.id === memberId ? { ...m, role } : m
    );
    set({ members: updatedMembers });
    storageSet(MEMBERS_STORAGE_KEY, updatedMembers);
  },

  getGroupMembers: (groupId) => {
    return get().members.filter((m) => m.group_id === groupId);
  },

  addSubGroup: (subGroupData) => {
    const newSubGroup: SubGroup = {
      id: generateUniqueId(),
      ...subGroupData,
      created_at: new Date().toISOString(),
    };

    const updatedSubGroups = [...get().subGroups, newSubGroup];
    set({ subGroups: updatedSubGroups });
    storageSet(SUBGROUPS_STORAGE_KEY, updatedSubGroups);

    return newSubGroup;
  },

  deleteSubGroup: (subGroupId) => {
    const updatedSubGroups = get().subGroups.filter((sg) => sg.id !== subGroupId);
    set({ subGroups: updatedSubGroups });
    storageSet(SUBGROUPS_STORAGE_KEY, updatedSubGroups);
  },

  getGroupSubGroups: (groupId) => {
    return get().subGroups.filter((sg) => sg.group_id === groupId);
  },

  loadFromStorage: () => {
    set({
      groups: loadGroupsFromStorage(),
      currentGroup: storageGet<Group | null>(CURRENT_GROUP_KEY, null),
      members: loadMembersFromStorage(),
      subGroups: loadSubGroupsFromStorage(),
    });
  },

  saveToStorage: () => {
    const { groups, currentGroup, members, subGroups } = get();
    storageSet(GROUPS_STORAGE_KEY, groups);
    storageSet(MEMBERS_STORAGE_KEY, members);
    storageSet(SUBGROUPS_STORAGE_KEY, subGroups);
    if (currentGroup) {
      storageSet(CURRENT_GROUP_KEY, currentGroup);
    } else {
      storageRemove(CURRENT_GROUP_KEY);
    }
  },
}));
