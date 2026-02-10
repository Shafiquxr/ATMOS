import { create } from 'zustand';
import { User } from '../types';
import { storageGet, storageSet, storageRemove } from '../utils/storage';
import { generateUniqueId } from '../utils/idGenerator';
import { sanitizeEmail, sanitizePhoneNumber, hashPassword, verifyPassword } from '../utils/security';

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
    logout: () => Promise<void>;
    loadFromStorage: () => void;
    checkSession: () => Promise<void>;
    fetchUsers: () => Promise<void>;
}

const loadUsersFromStorage = (): User[] => {
    return storageGet<User[]>(USERS_STORAGE_KEY, []);
};

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    users: loadUsersFromStorage(),

    setUser: (user) => {
        set({ user, isAuthenticated: !!user });
    },

    setLoading: (loading) => set({ isLoading: loading }),

    login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
            const sanitizedEmail = sanitizeEmail(email);
            const users = loadUsersFromStorage();

            const foundUser = users.find(
                (u) => u.email.toLowerCase() === sanitizedEmail.toLowerCase()
            );

            if (!foundUser || !foundUser.passwordHash) {
                throw new Error('Invalid email or password');
            }

            const isValid = await verifyPassword(password, foundUser.passwordHash);
            if (!isValid) {
                throw new Error('Invalid email or password');
            }

            const user: User = {
                id: foundUser.id,
                email: foundUser.email,
                full_name: foundUser.full_name,
                phone: foundUser.phone,
                avatar_url: foundUser.avatar_url,
                is_phone_verified: foundUser.is_phone_verified || false,
                created_at: foundUser.created_at,
                updated_at: foundUser.updated_at,
            };

            set({
                user,
                isAuthenticated: true,
            });

            storageSet(AUTH_STORAGE_KEY, user);

            // Trigger group store initialization
            const { useGroupStore } = await import('./groupStore');
            await useGroupStore.getState().fetchGroups();
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
            const users = loadUsersFromStorage();

            // Check if email already exists
            const existingUser = users.find(
                (u) => u.email.toLowerCase() === sanitizedEmail.toLowerCase()
            );

            if (existingUser) {
                throw new Error('Email already exists');
            }

            const newUser: User = {
                id: generateUniqueId(),
                email: sanitizedEmail,
                full_name: data.full_name.trim(),
                phone: sanitizedPhone,
                avatar_url: undefined,
                is_phone_verified: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                passwordHash: await hashPassword(data.password),
            };

            // Save to users list
            const updatedUsers = [...users, newUser];
            storageSet(USERS_STORAGE_KEY, updatedUsers);
            set({ users: updatedUsers });

            // Create user without password for session
            const sessionUser: User = {
                id: newUser.id,
                email: newUser.email,
                full_name: newUser.full_name,
                phone: newUser.phone,
                avatar_url: newUser.avatar_url,
                is_phone_verified: newUser.is_phone_verified,
                created_at: newUser.created_at,
                updated_at: newUser.updated_at,
            };

            set({
                user: sessionUser,
                isAuthenticated: true,
            });

            storageSet(AUTH_STORAGE_KEY, sessionUser);
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
            isLoading: false,
            users: loadUsersFromStorage(),
        });
    },

    checkSession: async () => {
        console.log('[checkSession] Starting session check...');
        try {
            const savedUser = storageGet<User | null>(AUTH_STORAGE_KEY, null);

            if (savedUser) {
                set({
                    user: savedUser,
                    isAuthenticated: true,
                });

                // Initialize group store
                const { useGroupStore } = await import('./groupStore');
                await useGroupStore.getState().fetchGroups();
                return;
            }

            set({ user: null, isAuthenticated: false });
            storageRemove(AUTH_STORAGE_KEY);
        } catch (error) {
            console.error('Session check error:', error);
            set({ user: null, isAuthenticated: false });
            storageRemove(AUTH_STORAGE_KEY);
        } finally {
            set({ isLoading: false });
        }
    },

    fetchUsers: async () => {
        set({ isLoading: true });
        try {
            const users = loadUsersFromStorage();
            set({ users });
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            set({ isLoading: false });
        }
    },
}));

// Initialize session check
useAuthStore.getState().checkSession();
