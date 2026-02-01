import { create } from 'zustand';
import { User } from '../types';
import { storageGet, storageSet, storageRemove } from '../utils/storage';
import { generateUniqueId } from '../utils/idGenerator';
import { sanitizeEmail, sanitizePhoneNumber } from '../utils/security';

const AUTH_STORAGE_KEY = 'atmos_auth';
const USERS_STORAGE_KEY = 'atmos_users';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  users: User[];
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { full_name: string; email: string; phone: string; password: string }) => Promise<void>;
  logout: () => void;
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const loadUsersFromStorage = (): User[] => {
  return storageGet<User[]>(USERS_STORAGE_KEY, []);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _saveUsersToStorage = (users: User[]): void => {
  storageSet(USERS_STORAGE_KEY, users);
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  users: loadUsersFromStorage(),

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
    if (user) {
      storageSet(AUTH_STORAGE_KEY, user);
    } else {
      storageRemove(AUTH_STORAGE_KEY);
    }
  },
  
  setLoading: (loading) => set({ isLoading: loading }),

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const sanitizedEmail = sanitizeEmail(email);
      const users = get().users;
      
      const user = users.find(
        (u) => u.email === sanitizedEmail && u.password === password
      );

      if (!user) {
        throw new Error('Invalid email or password');
      }

      const { password: _, ...userWithoutPassword } = user as any;
      
      set({ 
        user: userWithoutPassword, 
        isAuthenticated: true,
        users 
      });
      
      storageSet(AUTH_STORAGE_KEY, userWithoutPassword);
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
      
      const users = get().users;
      
      if (users.some((u) => u.email === sanitizedEmail)) {
        throw new Error('User with this email already exists');
      }

      const newUser: User & { password: string } = {
        id: generateUniqueId(),
        email: sanitizedEmail,
        full_name: data.full_name.trim(),
        phone: sanitizedPhone,
        password: data.password,
        is_phone_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const updatedUsers = [...users, newUser];
      
      const { password: _, ...userWithoutPassword } = newUser;
      
      set({ 
        user: userWithoutPassword, 
        isAuthenticated: true,
        users: updatedUsers 
      });
      
      storageSet(USERS_STORAGE_KEY, updatedUsers);
      storageSet(AUTH_STORAGE_KEY, userWithoutPassword);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
    storageRemove(AUTH_STORAGE_KEY);
  },

  loadFromStorage: () => {
    const savedUser = storageGet<User | null>(AUTH_STORAGE_KEY, null);
    const savedUsers = loadUsersFromStorage();
    set({ 
      user: savedUser, 
      isAuthenticated: !!savedUser,
      users: savedUsers
    });
  },

  saveToStorage: () => {
    const { user, users } = get();
    if (user) {
      storageSet(AUTH_STORAGE_KEY, user);
    } else {
      storageRemove(AUTH_STORAGE_KEY);
    }
    storageSet(USERS_STORAGE_KEY, users);
  },
}));

useAuthStore.getState().loadFromStorage();
