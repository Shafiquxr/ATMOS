import { create } from 'zustand';
import { User } from '../types';
import { supabase } from '../utils/supabase';
import { storageGet, storageSet, storageRemove } from '../utils/storage';
import { generateUniqueId } from '../utils/idGenerator';
import { sanitizeEmail, sanitizePhoneNumber } from '../utils/security';

const AUTH_STORAGE_KEY = 'atmos_auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  users: User[];
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { full_name: string; email: string; phone: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  loadFromStorage: () => void;
  checkSession: () => Promise<void>;
  fetchUsers: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  users: [],

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },
  
  setLoading: (loading) => set({ isLoading: loading }),

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const sanitizedEmail = sanitizeEmail(email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Invalid email or password');
      }

      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        throw new Error('Failed to load user profile');
      }

      const user: User = {
        id: profileData.id,
        email: profileData.email,
        full_name: profileData.full_name,
        phone: profileData.phone,
        avatar_url: profileData.avatar_url,
        is_phone_verified: profileData.is_phone_verified || false,
        created_at: profileData.created_at,
        updated_at: profileData.updated_at,
      };

      set({ 
        user, 
        isAuthenticated: true,
      });
      
      storageSet(AUTH_STORAGE_KEY, user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signup: async (data) => {
    set({ isLoading: true });
    try {
      const sanitizedEmail = sanitizeEmail(data.email);
      const sanitizedPhone = sanitizePhoneNumber(data.phone);
      
      const { data: authData, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name.trim(),
            phone: sanitizedPhone,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!authData.user) {
        throw new Error('Failed to create user');
      }

      const userData = {
        id: authData.user.id,
        email: sanitizedEmail,
        full_name: data.full_name.trim(),
        phone: sanitizedPhone,
        is_phone_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error: insertError } = await supabase
        .from('users')
        .insert([userData]);

      if (insertError) {
        throw new Error('Failed to save user profile');
      }

      const user: User = {
        ...userData,
        avatar_url: undefined,
      };

      set({ 
        user, 
        isAuthenticated: true,
      });
      
      storageSet(AUTH_STORAGE_KEY, user);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      const { useGroupStore } = await import('./groupStore');
      useGroupStore.getState().clearLocalData();
      
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({ user: null, isAuthenticated: false });
      storageRemove(AUTH_STORAGE_KEY);
    }
  },

  loadFromStorage: () => {
    const savedUser = storageGet<User | null>(AUTH_STORAGE_KEY, null);
    set({ 
      user: savedUser, 
      isAuthenticated: !!savedUser,
    });
  },

  checkSession: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }

      if (session?.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (!profileError && profileData) {
          const user: User = {
            id: profileData.id,
            email: profileData.email,
            full_name: profileData.full_name,
            phone: profileData.phone,
            avatar_url: profileData.avatar_url,
            is_phone_verified: profileData.is_phone_verified || false,
            created_at: profileData.created_at,
            updated_at: profileData.updated_at,
          };

          set({ 
            user, 
            isAuthenticated: true,
          });
          
          storageSet(AUTH_STORAGE_KEY, user);
          return;
        }
      }
      
      set({ user: null, isAuthenticated: false });
      storageRemove(AUTH_STORAGE_KEY);
    } catch (error) {
      console.error('Session check error:', error);
      set({ user: null, isAuthenticated: false });
      storageRemove(AUTH_STORAGE_KEY);
    }
  },

  fetchUsers: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*');

      if (error) throw error;

      const users: User[] = (data || []).map(u => ({
        id: u.id,
        email: u.email,
        full_name: u.full_name,
        phone: u.phone,
        avatar_url: u.avatar_url,
        is_phone_verified: u.is_phone_verified || false,
        created_at: u.created_at,
        updated_at: u.updated_at,
      }));

      set({ users });
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));

useAuthStore.getState().checkSession();
