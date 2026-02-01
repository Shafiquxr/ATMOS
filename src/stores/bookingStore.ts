import { create } from 'zustand';
import { Booking } from '../types';
import { storageGet, storageSet } from '../utils/storage';
import { generateUniqueId } from '../utils/idGenerator';
import { useWalletStore } from './walletStore';

const BOOKINGS_STORAGE_KEY = 'atmos_bookings';

interface BookingState {
  bookings: Booking[];
  isLoading: boolean;
  
  setBookings: (bookings: Booking[]) => void;
  addBooking: (booking: Omit<Booking, 'id' | 'status' | 'created_at'>) => Booking;
  updateBooking: (id: string, updates: Partial<Booking>) => void;
  cancelBooking: (id: string) => void;
  confirmBooking: (id: string) => void;
  getGroupBookings: (groupId: string) => Booking[];
  getVendorBookings: (vendorId: string) => Booking[];
  getPendingBookings: (groupId: string) => Booking[];
  
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

const loadBookingsFromStorage = (): Booking[] => {
  return storageGet<Booking[]>(BOOKINGS_STORAGE_KEY, []);
};

export const useBookingStore = create<BookingState>((set, get) => ({
  bookings: loadBookingsFromStorage(),
  isLoading: false,

  setBookings: (bookings) => {
    set({ bookings });
    storageSet(BOOKINGS_STORAGE_KEY, bookings);
  },

  addBooking: (bookingData) => {
    const newBooking: Booking = {
      id: generateUniqueId(),
      ...bookingData,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    const updatedBookings = [...get().bookings, newBooking];
    set({ bookings: updatedBookings });
    storageSet(BOOKINGS_STORAGE_KEY, updatedBookings);

    return newBooking;
  },

  updateBooking: (id, updates) => {
    const updatedBookings = get().bookings.map((b) => 
      b.id === id ? { ...b, ...updates } : b
    );
    
    set({ bookings: updatedBookings });
    storageSet(BOOKINGS_STORAGE_KEY, updatedBookings);
  },

  cancelBooking: (id) => {
    const booking = get().bookings.find((b) => b.id === id);
    if (!booking) return;

    if (booking.escrow_transaction_id) {
      try {
        useWalletStore.getState().releaseEscrow(booking.group_id, booking.escrow_transaction_id);
      } catch (error) {
        console.error('Error releasing escrow:', error);
      }
    }

    const updatedBookings = get().bookings.map((b) => 
      b.id === id ? { ...b, status: 'cancelled' as const } : b
    );
    
    set({ bookings: updatedBookings });
    storageSet(BOOKINGS_STORAGE_KEY, updatedBookings);
  },

  confirmBooking: (id) => {
    const booking = get().bookings.find((b) => b.id === id);
    if (!booking) return;

    const updatedBookings = get().bookings.map((b) => 
      b.id === id 
        ? { 
            ...b, 
            status: 'confirmed' as const,
            confirmed_at: new Date().toISOString(),
          } 
        : b
    );
    
    set({ bookings: updatedBookings });
    storageSet(BOOKINGS_STORAGE_KEY, updatedBookings);
  },

  getGroupBookings: (groupId) => {
    return get().bookings
      .filter((b) => b.group_id === groupId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  getVendorBookings: (vendorId) => {
    return get().bookings.filter((b) => b.vendor_id === vendorId);
  },

  getPendingBookings: (groupId) => {
    return get().bookings.filter((b) => 
      b.group_id === groupId && b.status === 'pending'
    );
  },

  loadFromStorage: () => {
    set({
      bookings: loadBookingsFromStorage(),
    });
  },

  saveToStorage: () => {
    const { bookings } = get();
    storageSet(BOOKINGS_STORAGE_KEY, bookings);
  },
}));
