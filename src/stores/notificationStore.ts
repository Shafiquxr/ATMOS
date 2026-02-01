import { create } from 'zustand';
import { Notification } from '../types';
import { storageGet, storageSet } from '../utils/storage';
import { generateUniqueId } from '../utils/idGenerator';

const NOTIFICATIONS_STORAGE_KEY = 'atmos_notifications';

interface NotificationState {
  notifications: Notification[];
  isLoading: boolean;
  
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'is_read' | 'created_at'>) => Notification;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: (userId: string) => void;
  deleteNotification: (notificationId: string) => void;
  getUserNotifications: (userId: string) => Notification[];
  getUnreadCount: (userId: string) => number;
  
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

const loadNotificationsFromStorage = (): Notification[] => {
  return storageGet<Notification[]>(NOTIFICATIONS_STORAGE_KEY, []);
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: loadNotificationsFromStorage(),
  isLoading: false,

  setNotifications: (notifications) => {
    set({ notifications });
    storageSet(NOTIFICATIONS_STORAGE_KEY, notifications);
  },

  addNotification: (notificationData) => {
    const newNotification: Notification = {
      id: generateUniqueId(),
      ...notificationData,
      is_read: false,
      email_sent: false,
      sms_sent: false,
      created_at: new Date().toISOString(),
    };

    const updatedNotifications = [...get().notifications, newNotification];
    set({ notifications: updatedNotifications });
    storageSet(NOTIFICATIONS_STORAGE_KEY, updatedNotifications);

    return newNotification;
  },

  markAsRead: (notificationId) => {
    const updatedNotifications = get().notifications.map((n) =>
      n.id === notificationId ? { ...n, is_read: true } : n
    );
    
    set({ notifications: updatedNotifications });
    storageSet(NOTIFICATIONS_STORAGE_KEY, updatedNotifications);
  },

  markAllAsRead: (userId) => {
    const updatedNotifications = get().notifications.map((n) =>
      n.user_id === userId ? { ...n, is_read: true } : n
    );
    
    set({ notifications: updatedNotifications });
    storageSet(NOTIFICATIONS_STORAGE_KEY, updatedNotifications);
  },

  deleteNotification: (notificationId) => {
    const updatedNotifications = get().notifications.filter((n) => n.id !== notificationId);
    set({ notifications: updatedNotifications });
    storageSet(NOTIFICATIONS_STORAGE_KEY, updatedNotifications);
  },

  getUserNotifications: (userId) => {
    return get().notifications
      .filter((n) => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  getUnreadCount: (userId) => {
    return get().notifications.filter(
      (n) => n.user_id === userId && !n.is_read
    ).length;
  },

  loadFromStorage: () => {
    set({
      notifications: loadNotificationsFromStorage(),
    });
  },

  saveToStorage: () => {
    const { notifications } = get();
    storageSet(NOTIFICATIONS_STORAGE_KEY, notifications);
  },
}));
