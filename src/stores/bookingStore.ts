import { create } from 'zustand';
import { Booking } from '../types';
import { storageGet, storageSet } from '../utils/storage';
import { generateUniqueId } from '../utils/idGenerator';

const BOOKINGS_STORAGE_KEY = 'atmos_bookings';

interface BookingState {
    bookings: Booking[];
    currentBooking: Booking | null;
    isLoading: boolean;
    error: string | null;

    // Booking actions
    fetchBookings: (groupId: string) => Promise<void>;
    fetchBookingById: (bookingId: string) => Promise<Booking | null>;
    createBooking: (booking: Partial<Booking>) => Promise<Booking>;
    updateBooking: (bookingId: string, updates: Partial<Booking>) => Promise<void>;
    deleteBooking: (bookingId: string) => Promise<void>;
    updateBookingStatus: (bookingId: string, status: string) => Promise<void>;

    // Utility
    getBookingsByGroup: (groupId: string) => Booking[];
    getBookingsByVendor: (vendorId: string) => Booking[];
    getBookingStats: (groupId: string) => { total: number; confirmed: number; pending: number; completed: number };
}

const loadBookingsFromStorage = (): Booking[] => {
    return storageGet<Booking[]>(BOOKINGS_STORAGE_KEY, []);
};

export const useBookingStore = create<BookingState>((set, get) => ({
    bookings: [],
    currentBooking: null,
    isLoading: false,
    error: null,

    fetchBookings: async (groupId: string) => {
        set({ isLoading: true });
        try {
            const allBookings = loadBookingsFromStorage();
            const groupBookings = allBookings.filter((b) => b.group_id === groupId);
            set({ bookings: groupBookings });
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
            set({ error: 'Failed to fetch bookings' });
        } finally {
            set({ isLoading: false });
        }
    },

    fetchBookingById: async (bookingId: string) => {
        try {
            const bookings = loadBookingsFromStorage();
            const booking = bookings.find((b) => b.id === bookingId) || null;
            if (booking) {
                set({ currentBooking: booking });
            }
            return booking;
        } catch (error) {
            console.error('Failed to fetch booking:', error);
            return null;
        }
    },

    createBooking: async (bookingData: Partial<Booking>) => {
        set({ isLoading: true });
        try {
            const { useAuthStore } = await import('./authStore');
            const currentUser = useAuthStore.getState().user;

            const bookings = loadBookingsFromStorage();
            const newBooking: Booking = {
                id: generateUniqueId(),
                group_id: bookingData.group_id || '',
                vendor_id: bookingData.vendor_id || '',
                created_by: currentUser?.id || '',
                booking_date: bookingData.booking_date || new Date().toISOString(),
                amount: bookingData.amount || 0,
                advance_amount: bookingData.advance_amount || 0,
                terms: bookingData.terms,
                status: 'pending',
                created_at: new Date().toISOString(),
            };

            const updatedBookings = [...bookings, newBooking];
            storageSet(BOOKINGS_STORAGE_KEY, updatedBookings);
            set({ bookings: updatedBookings.filter((b) => b.group_id === newBooking.group_id) });

            return newBooking;
        } catch (error) {
            console.error('Failed to create booking:', error);
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    updateBooking: async (bookingId: string, updates: Partial<Booking>) => {
        try {
            const bookings = loadBookingsFromStorage();
            const updatedBookings = bookings.map((b) =>
                b.id === bookingId ? { ...b, ...updates } : b
            );
            storageSet(BOOKINGS_STORAGE_KEY, updatedBookings);

            const currentGroupId = get().bookings[0]?.group_id;
            if (currentGroupId) {
                set({ bookings: updatedBookings.filter((b) => b.group_id === currentGroupId) });
            }

            if (get().currentBooking?.id === bookingId) {
                set({ currentBooking: updatedBookings.find((b) => b.id === bookingId) });
            }
        } catch (error) {
            console.error('Failed to update booking:', error);
            throw error;
        }
    },

    deleteBooking: async (bookingId: string) => {
        try {
            const bookings = loadBookingsFromStorage();
            const updatedBookings = bookings.filter((b) => b.id !== bookingId);
            storageSet(BOOKINGS_STORAGE_KEY, updatedBookings);

            const currentGroupId = get().bookings[0]?.group_id;
            if (currentGroupId) {
                set({ bookings: updatedBookings.filter((b) => b.group_id === currentGroupId) });
            }

            if (get().currentBooking?.id === bookingId) {
                set({ currentBooking: null });
            }
        } catch (error) {
            console.error('Failed to delete booking:', error);
            throw error;
        }
    },

    updateBookingStatus: async (bookingId: string, status: string) => {
        await get().updateBooking(bookingId, {
            status: status as any,
            confirmed_at: status === 'confirmed' ? new Date().toISOString() : undefined,
        });
    },

    getBookingsByGroup: (groupId: string) => {
        const bookings = loadBookingsFromStorage();
        return bookings.filter((b) => b.group_id === groupId);
    },

    getBookingsByVendor: (vendorId: string) => {
        const bookings = loadBookingsFromStorage();
        return bookings.filter((b) => b.vendor_id === vendorId);
    },

    getBookingStats: (groupId: string) => {
        const bookings = loadBookingsFromStorage().filter((b) => b.group_id === groupId);
        return {
            total: bookings.length,
            confirmed: bookings.filter((b) => b.status === 'confirmed').length,
            pending: bookings.filter((b) => b.status === 'pending').length,
            completed: bookings.filter((b) => b.status === 'completed').length,
        };
    },
}));

// Listen for storage events to sync across tabs
window.addEventListener('storage', (event) => {
    if (event.key === BOOKINGS_STORAGE_KEY) {
        // Refresh data on storage change
    }
});
