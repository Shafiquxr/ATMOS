import { create } from 'zustand';
import { Toast, ToastType } from '../components/ui/Toast';

interface ToastState {
  toasts: Toast[];
  addToast: (type: ToastType, title: string, message?: string) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (type, title, message) => {
    const id = Math.random().toString(36).substring(7);
    const toast: Toast = { id, type, title, message };
    
    set((state) => ({
      toasts: [...state.toasts, toast]
    }));
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id)
    }));
  },

  clearToasts: () => {
    set({ toasts: [] });
  },
}));
