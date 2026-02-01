import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { full_name: string; email: string; phone: string; password: string }) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setLoading: (loading) => set({ isLoading: loading }),

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          // TODO: Implement actual Supabase authentication
          // For now, simulate login
          console.log('Login attempt:', { email, password });
          
          // Simulated user - Replace with actual Supabase auth
          const mockUser: User = {
            id: '1',
            email,
            full_name: 'Demo User',
            is_phone_verified: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          
          set({ user: mockUser, isAuthenticated: true });
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
          // TODO: Implement actual Supabase signup
          console.log('Signup attempt:', data);
          
          // Simulated user - Replace with actual Supabase auth
          const mockUser: User = {
            id: '1',
            email: data.email,
            full_name: data.full_name,
            phone: data.phone,
            is_phone_verified: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          
          set({ user: mockUser, isAuthenticated: true });
        } catch (error) {
          console.error('Signup error:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    })
);
