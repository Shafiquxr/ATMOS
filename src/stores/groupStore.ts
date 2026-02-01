import { create } from 'zustand';
import { Group, GroupMember } from '../types';

interface GroupState {
  groups: Group[];
  currentGroup: Group | null;
  members: GroupMember[];
  isLoading: boolean;
  setGroups: (groups: Group[]) => void;
  setCurrentGroup: (group: Group | null) => void;
  setMembers: (members: GroupMember[]) => void;
  addGroup: (group: Group) => void;
  updateGroup: (id: string, updates: Partial<Group>) => void;
  deleteGroup: (id: string) => void;
}

export const useGroupStore = create<GroupState>((set) => ({
  groups: [],
  currentGroup: null,
  members: [],
  isLoading: false,

  setGroups: (groups) => set({ groups }),
  
  setCurrentGroup: (group) => set({ currentGroup: group }),
  
  setMembers: (members) => set({ members }),

  addGroup: (group) => set((state) => ({
    groups: [...state.groups, group]
  })),

  updateGroup: (id, updates) => set((state) => ({
    groups: state.groups.map((g) => g.id === id ? { ...g, ...updates } : g),
    currentGroup: state.currentGroup?.id === id
      ? { ...state.currentGroup, ...updates }
      : state.currentGroup
  })),

  deleteGroup: (id) => set((state) => ({
    groups: state.groups.filter((g) => g.id !== id),
    currentGroup: state.currentGroup?.id === id ? null : state.currentGroup
  })),
}));
