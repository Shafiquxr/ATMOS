import { create } from 'zustand';
import { Vendor, VendorReview } from '../types';
import { storageGet, storageSet } from '../utils/storage';
import { generateUniqueId } from '../utils/idGenerator';

const VENDORS_STORAGE_KEY = 'atmos_vendors';
const VENDOR_REVIEWS_STORAGE_KEY = 'atmos_vendor_reviews';

interface VendorState {
    vendors: Vendor[];
    currentVendor: Vendor | null;
    reviews: VendorReview[];
    isLoading: boolean;
    error: string | null;

    // Vendor actions
    fetchVendors: (category?: string) => Promise<void>;
    fetchVendorById: (vendorId: string) => Promise<Vendor | null>;
    createVendor: (vendor: Partial<Vendor>) => Promise<Vendor>;
    updateVendor: (vendorId: string, updates: Partial<Vendor>) => Promise<void>;
    deleteVendor: (vendorId: string) => Promise<void>;

    // Review actions
    fetchReviews: (vendorId: string) => Promise<void>;
    addReview: (review: Partial<VendorReview>) => Promise<VendorReview>;

    // Utility
    searchVendors: (query: string) => Vendor[];
    getVendorsByCategory: (category: string) => Vendor[];
}

const loadVendorsFromStorage = (): Vendor[] => {
    return storageGet<Vendor[]>(VENDORS_STORAGE_KEY, []);
};

const loadReviewsFromStorage = (): VendorReview[] => {
    return storageGet<VendorReview[]>(VENDOR_REVIEWS_STORAGE_KEY, []);
};

export const useVendorStore = create<VendorState>((set, get) => ({
    vendors: [],
    currentVendor: null,
    reviews: [],
    isLoading: false,
    error: null,

    fetchVendors: async (category?: string) => {
        set({ isLoading: true });
        try {
            let vendors = loadVendorsFromStorage();
            if (category) {
                vendors = vendors.filter((v) => v.category === category);
            }
            set({ vendors });
        } catch (error) {
            console.error('Failed to fetch vendors:', error);
            set({ error: 'Failed to fetch vendors' });
        } finally {
            set({ isLoading: false });
        }
    },

    fetchVendorById: async (vendorId: string) => {
        try {
            const vendors = loadVendorsFromStorage();
            const vendor = vendors.find((v) => v.id === vendorId) || null;
            if (vendor) {
                set({ currentVendor: vendor });
            }
            return vendor;
        } catch (error) {
            console.error('Failed to fetch vendor:', error);
            return null;
        }
    },

    createVendor: async (vendorData: Partial<Vendor>) => {
        set({ isLoading: true });
        try {
            const vendors = loadVendorsFromStorage();
            const newVendor: Vendor = {
                id: generateUniqueId(),
                name: vendorData.name || 'New Vendor',
                category: vendorData.category || 'other',
                description: vendorData.description,
                contact_name: vendorData.contact_name,
                contact_phone: vendorData.contact_phone,
                contact_email: vendorData.contact_email,
                address: vendorData.address,
                rating: 0,
                total_reviews: 0,
                price_range: vendorData.price_range,
                created_at: new Date().toISOString(),
            };

            const updatedVendors = [...vendors, newVendor];
            storageSet(VENDORS_STORAGE_KEY, updatedVendors);
            set({ vendors: updatedVendors });

            return newVendor;
        } catch (error) {
            console.error('Failed to create vendor:', error);
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    updateVendor: async (vendorId: string, updates: Partial<Vendor>) => {
        try {
            const vendors = loadVendorsFromStorage();
            const updatedVendors = vendors.map((v) =>
                v.id === vendorId ? { ...v, ...updates } : v
            );
            storageSet(VENDORS_STORAGE_KEY, updatedVendors);
            set({ vendors: updatedVendors });

            if (get().currentVendor?.id === vendorId) {
                set({ currentVendor: updatedVendors.find((v) => v.id === vendorId) });
            }
        } catch (error) {
            console.error('Failed to update vendor:', error);
            throw error;
        }
    },

    deleteVendor: async (vendorId: string) => {
        try {
            const vendors = loadVendorsFromStorage();
            const updatedVendors = vendors.filter((v) => v.id !== vendorId);
            storageSet(VENDORS_STORAGE_KEY, updatedVendors);
            set({ vendors: updatedVendors });

            if (get().currentVendor?.id === vendorId) {
                set({ currentVendor: null });
            }
        } catch (error) {
            console.error('Failed to delete vendor:', error);
            throw error;
        }
    },

    fetchReviews: async (vendorId: string) => {
        try {
            const allReviews = loadReviewsFromStorage();
            const vendorReviews = allReviews.filter((r) => r.vendor_id === vendorId);
            set({ reviews: vendorReviews });
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        }
    },

    addReview: async (reviewData: Partial<VendorReview>) => {
        const reviews = loadReviewsFromStorage();
        const newReview: VendorReview = {
            id: generateUniqueId(),
            vendor_id: reviewData.vendor_id || '',
            booking_id: reviewData.booking_id || '',
            user_id: reviewData.user_id || '',
            rating: reviewData.rating || 5,
            review: reviewData.review,
            created_at: new Date().toISOString(),
        };

        const updatedReviews = [...reviews, newReview];
        storageSet(VENDOR_REVIEWS_STORAGE_KEY, updatedReviews);
        set({ reviews: updatedReviews.filter((r) => r.vendor_id === newReview.vendor_id) });

        // Update vendor rating
        const vendorReviews = updatedReviews.filter((r) => r.vendor_id === newReview.vendor_id);
        const avgRating = vendorReviews.reduce((acc, r) => acc + r.rating, 0) / vendorReviews.length;
        await get().updateVendor(newReview.vendor_id, {
            rating: avgRating,
            total_reviews: vendorReviews.length,
        });

        return newReview;
    },

    searchVendors: (query: string) => {
        const vendors = loadVendorsFromStorage();
        const lowerQuery = query.toLowerCase();
        return vendors.filter(
            (v) =>
                v.name.toLowerCase().includes(lowerQuery) ||
                v.description?.toLowerCase().includes(lowerQuery) ||
                v.category.toLowerCase().includes(lowerQuery)
        );
    },

    getVendorsByCategory: (category: string) => {
        const vendors = loadVendorsFromStorage();
        return vendors.filter((v) => v.category === category);
    },
}));

// Listen for storage events to sync across tabs
window.addEventListener('storage', (event) => {
    if (event.key === VENDORS_STORAGE_KEY) {
        useVendorStore.getState().fetchVendors();
    }
});
