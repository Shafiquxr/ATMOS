import { create } from 'zustand';
import { Group, GroupMember, SubGroup } from '../types';
import { supabase } from '../utils/supabase';
import { storageGet, storageSet, storageRemove } from '../utils/storage';
import { generateUniqueId } from '../utils/idGenerator';
import { useAuthStore } from './authStore';

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
  addGroup: (group: Omit<Group, 'id' | 'owner_id' | 'status' | 'created_at' | 'updated_at'>) => Promise<Group>;
  updateGroup: (id: string, updates: Partial<Group>) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  fetchGroups: () => Promise<void>;
  
  addMember: (groupId: string, member: Omit<GroupMember, 'id' | 'joined_at'>) => Promise<GroupMember>;
  removeMember: (groupId: string, memberId: string) => Promise<void>;
  updateMemberRole: (groupId: string, memberId: string, role: GroupMember['role']) => Promise<void>;
  fetchGroupMembers: (groupId: string) => Promise<void>;
  getGroupMembers: (groupId: string) => GroupMember[];
  
  addSubGroup: (subGroup: Omit<SubGroup, 'id' | 'created_at'>) => Promise<SubGroup>;
  deleteSubGroup: (subGroupId: string) => Promise<void>;
  fetchGroupSubGroups: (groupId: string) => Promise<void>;
  getGroupSubGroups: (groupId: string) => SubGroup[];
  
  loadFromStorage: () => void;
  saveToStorage: () => void;
  clearLocalData: () => void;
}

export const useGroupStore = create<GroupState>((set, get) => ({
  groups: [],
  currentGroup: storageGet<Group | null>(CURRENT_GROUP_KEY, null),
  members: [],
  subGroups: [],
  isLoading: false,

  setGroups: (groups) => {
    set({ groups });
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
  },

  fetchGroups: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ isLoading: true });
    try {
      const { data: memberships, error: memberError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      const groupIds = memberships?.map(m => m.group_id) || [];
      
      if (groupIds.length === 0) {
        set({ groups: [], isLoading: false });
        return;
      }

      const { data: groups, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .in('id', groupIds);

      if (groupError) throw groupError;

      const typedGroups: Group[] = (groups || []).map(g => ({
        id: g.id,
        name: g.name,
        description: g.description,
        category: g.category,
        start_date: g.start_date,
        end_date: g.end_date,
        location: g.location,
        owner_id: g.owner_id,
        status: g.status,
        created_at: g.created_at,
        updated_at: g.updated_at,
      }));

      set({ groups: typedGroups });
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addGroup: async (groupData) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('User must be logged in to create a group');

    set({ isLoading: true });
    try {
      const newGroup = {
        id: generateUniqueId(),
        name: groupData.name,
        description: groupData.description || '',
        category: groupData.category || 'other',
        start_date: groupData.start_date,
        end_date: groupData.end_date,
        location: groupData.location,
        owner_id: user.id,
        status: 'active' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error: groupError } = await supabase
        .from('groups')
        .insert([newGroup]);

      if (groupError) throw groupError;

      const ownerMember = {
        id: generateUniqueId(),
        group_id: newGroup.id,
        user_id: user.id,
        role: 'owner' as const,
        joined_at: new Date().toISOString(),
      };

      const { error: memberError } = await supabase
        .from('group_members')
        .insert([ownerMember]);

      if (memberError) throw memberError;

      set((state) => ({
        groups: [...state.groups, newGroup],
        currentGroup: newGroup,
      }));

      storageSet(CURRENT_GROUP_KEY, newGroup);

      const updatedMembers = [...get().members, ownerMember];
      set({ members: updatedMembers });

      return newGroup as Group;
    } catch (error) {
      console.error('Failed to add group:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateGroup: async (id, updates) => {
    set({ isLoading: true });
    try {
      const updatedAt = new Date().toISOString();
      const { error } = await supabase
        .from('groups')
        .update({ ...updates, updated_at: updatedAt })
        .eq('id', id);

      if (error) throw error;

      const { data: updatedGroup, error: fetchError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      if (updatedGroup) {
        const typedGroup: Group = {
          id: updatedGroup.id,
          name: updatedGroup.name,
          description: updatedGroup.description,
          category: updatedGroup.category,
          start_date: updatedGroup.start_date,
          end_date: updatedGroup.end_date,
          location: updatedGroup.location,
          owner_id: updatedGroup.owner_id,
          status: updatedGroup.status,
          created_at: updatedGroup.created_at,
          updated_at: updatedGroup.updated_at,
        };

        set((state) => ({
          groups: state.groups.map(g => g.id === id ? typedGroup : g),
          currentGroup: state.currentGroup?.id === id ? typedGroup : state.currentGroup,
        }));

        if (typedGroup.id === get().currentGroup?.id) {
          storageSet(CURRENT_GROUP_KEY, typedGroup);
        }
      }
    } catch (error) {
      console.error('Failed to update group:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteGroup: async (id) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        groups: state.groups.filter((g) => g.id !== id),
        currentGroup: state.currentGroup?.id === id ? null : state.currentGroup,
        members: state.members.filter((m) => m.group_id !== id),
        subGroups: state.subGroups.filter((sg) => sg.group_id !== id),
      }));

      const currentGroup = get().currentGroup;
      if (currentGroup?.id === id) {
        storageRemove(CURRENT_GROUP_KEY);
      }
    } catch (error) {
      console.error('Failed to delete group:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  addMember: async (_groupId, memberData) => {
    set({ isLoading: true });
    try {
      const newMember = {
        id: generateUniqueId(),
        ...memberData,
        joined_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('group_members')
        .insert([newMember]);

      if (error) throw error;

      set((state) => ({
        members: [...state.members, newMember],
      }));

      return newMember as GroupMember;
    } catch (error) {
      console.error('Failed to add member:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchGroupMembers: async (groupId) => {
    set({ isLoading: true });
    try {
      const { data: members, error } = await supabase
        .from('group_members')
        .select(`
          *,
          user:users(*)
        `)
        .eq('group_id', groupId);

      if (error) throw error;

      const typedMembers: GroupMember[] = (members || []).map(m => ({
        id: m.id,
        group_id: m.group_id,
        user_id: m.user_id,
        role: m.role,
        joined_at: m.joined_at,
        user: m.user,
        contact_info: m.contact_info,
      }));

      set({ members: typedMembers });
    } catch (error) {
      console.error('Failed to fetch members:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  removeMember: async (_groupId, memberId) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      set((state) => ({
        members: state.members.filter((m) => m.id !== memberId),
      }));
    } catch (error) {
      console.error('Failed to remove member:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateMemberRole: async (_groupId, memberId, role) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase
        .from('group_members')
        .update({ role })
        .eq('id', memberId);

      if (error) throw error;

      set((state) => ({
        members: state.members.map((m) => 
          m.id === memberId ? { ...m, role } : m
        ),
      }));
    } catch (error) {
      console.error('Failed to update member role:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  getGroupMembers: (groupId) => {
    return get().members.filter((m) => m.group_id === groupId);
  },

  addSubGroup: async (subGroupData) => {
    set({ isLoading: true });
    try {
      const newSubGroup = {
        id: generateUniqueId(),
        ...subGroupData,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('subgroups')
        .insert([newSubGroup]);

      if (error) throw error;

      set((state) => ({
        subGroups: [...state.subGroups, newSubGroup],
      }));

      return newSubGroup as SubGroup;
    } catch (error) {
      console.error('Failed to add subgroup:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchGroupSubGroups: async (groupId) => {
    set({ isLoading: true });
    try {
      const { data: subGroups, error } = await supabase
        .from('subgroups')
        .select(`
          *,
          team_lead:users!subgroups_team_lead_id_fkey(*)
        `)
        .eq('group_id', groupId);

      if (error) throw error;

      const typedSubGroups: SubGroup[] = (subGroups || []).map(sg => ({
        id: sg.id,
        group_id: sg.group_id,
        name: sg.name,
        description: sg.description,
        team_lead_id: sg.team_lead_id,
        created_at: sg.created_at,
        team_lead: sg.team_lead,
      }));

      set({ subGroups: typedSubGroups });
    } catch (error) {
      console.error('Failed to fetch subgroups:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  deleteSubGroup: async (subGroupId) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase
        .from('subgroups')
        .delete()
        .eq('id', subGroupId);

      if (error) throw error;

      set((state) => ({
        subGroups: state.subGroups.filter((sg) => sg.id !== subGroupId),
      }));
    } catch (error) {
      console.error('Failed to delete subgroup:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  getGroupSubGroups: (groupId) => {
    return get().subGroups.filter((sg) => sg.group_id === groupId);
  },

  loadFromStorage: () => {
    set({
      currentGroup: storageGet<Group | null>(CURRENT_GROUP_KEY, null),
    });
  },

  saveToStorage: () => {
    const { currentGroup } = get();
    if (currentGroup) {
      storageSet(CURRENT_GROUP_KEY, currentGroup);
    } else {
      storageRemove(CURRENT_GROUP_KEY);
    }
  },

  clearLocalData: () => {
    storageRemove(CURRENT_GROUP_KEY);
    set({
      groups: [],
      currentGroup: null,
      members: [],
      subGroups: [],
    });
  },
}));

useGroupStore.getState().loadFromStorage();