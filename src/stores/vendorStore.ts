import { create } from 'zustand';
import { Vendor, VendorReview } from '../types';
import { storageGet, storageSet } from '../utils/storage';
import { generateUniqueId } from '../utils/idGenerator';

const VENDORS_STORAGE_KEY = 'atmos_vendors';
const REVIEWS_STORAGE_KEY = 'atmos_vendor_reviews';

interface VendorState {
  vendors: Vendor[];
  reviews: VendorReview[];
  isLoading: boolean;
  
  setVendors: (vendors: Vendor[]) => void;
  addVendor: (vendor: Omit<Vendor, 'id' | 'created_at'>) => Vendor;
  updateVendor: (id: string, updates: Partial<Vendor>) => void;
  deleteVendor: (id: string) => void;
  getVendorsByCategory: (category: Vendor['category']) => Vendor[];
  
  addReview: (review: Omit<VendorReview, 'id' | 'created_at'>) => VendorReview;
  deleteReview: (reviewId: string) => void;
  getVendorReviews: (vendorId: string) => VendorReview[];
  getAverageRating: (vendorId: string) => number;
  
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

const loadVendorsFromStorage = (): Vendor[] => {
  return storageGet<Vendor[]>(VENDORS_STORAGE_KEY, []);
};

const loadReviewsFromStorage = (): VendorReview[] => {
  return storageGet<VendorReview[]>(REVIEWS_STORAGE_KEY, []);
};

export const useVendorStore = create<VendorState>((set, get) => ({
  vendors: loadVendorsFromStorage(),
  reviews: loadReviewsFromStorage(),
  isLoading: false,

  setVendors: (vendors) => {
    set({ vendors });
    storageSet(VENDORS_STORAGE_KEY, vendors);
  },

  addVendor: (vendorData) => {
    const newVendor: Vendor = {
      id: generateUniqueId(),
      ...vendorData,
      rating: 0,
      total_reviews: 0,
      created_at: new Date().toISOString(),
    };

    const updatedVendors = [...get().vendors, newVendor];
    set({ vendors: updatedVendors });
    storageSet(VENDORS_STORAGE_KEY, updatedVendors);

    return newVendor;
  },

  updateVendor: (id, updates) => {
    const updatedVendors = get().vendors.map((v) => 
      v.id === id ? { ...v, ...updates } : v
    );
    
    set({ vendors: updatedVendors });
    storageSet(VENDORS_STORAGE_KEY, updatedVendors);
  },

  deleteVendor: (id) => {
    const updatedVendors = get().vendors.filter((v) => v.id !== id);
    const updatedReviews = get().reviews.filter((r) => r.vendor_id !== id);

    set({ 
      vendors: updatedVendors,
      reviews: updatedReviews
    });

    storageSet(VENDORS_STORAGE_KEY, updatedVendors);
    storageSet(REVIEWS_STORAGE_KEY, updatedReviews);
  },

  getVendorsByCategory: (category) => {
    return get().vendors.filter((v) => v.category === category);
  },

  addReview: (reviewData) => {
    const newReview: VendorReview = {
      id: generateUniqueId(),
      ...reviewData,
      created_at: new Date().toISOString(),
    };

    const updatedReviews = [...get().reviews, newReview];
    
    const vendorReviews = updatedReviews.filter((r) => r.vendor_id === reviewData.vendor_id);
    const avgRating = vendorReviews.length > 0
      ? vendorReviews.reduce((sum, r) => sum + r.rating, 0) / vendorReviews.length
      : 0;

    const updatedVendors = get().vendors.map((v) =>
      v.id === reviewData.vendor_id
        ? {
            ...v,
            rating: Math.round(avgRating * 10) / 10,
            total_reviews: vendorReviews.length,
          }
        : v
    );

    set({ 
      reviews: updatedReviews,
      vendors: updatedVendors
    });

    storageSet(REVIEWS_STORAGE_KEY, updatedReviews);
    storageSet(VENDORS_STORAGE_KEY, updatedVendors);

    return newReview;
  },

  deleteReview: (reviewId) => {
    const review = get().reviews.find((r) => r.id === reviewId);
    if (!review) return;

    const updatedReviews = get().reviews.filter((r) => r.id !== reviewId);
    
    const vendorReviews = updatedReviews.filter((r) => r.vendor_id === review.vendor_id);
    const avgRating = vendorReviews.length > 0
      ? vendorReviews.reduce((sum, r) => sum + r.rating, 0) / vendorReviews.length
      : 0;

    const updatedVendors = get().vendors.map((v) =>
      v.id === review.vendor_id
        ? {
            ...v,
            rating: Math.round(avgRating * 10) / 10,
            total_reviews: vendorReviews.length,
          }
        : v
    );

    set({ 
      reviews: updatedReviews,
      vendors: updatedVendors
    });

    storageSet(REVIEWS_STORAGE_KEY, updatedReviews);
    storageSet(VENDORS_STORAGE_KEY, updatedVendors);
  },

  getVendorReviews: (vendorId) => {
    return get().reviews.filter((r) => r.vendor_id === vendorId);
  },

  getAverageRating: (vendorId) => {
    const vendorReviews = get().getVendorReviews(vendorId);
    if (vendorReviews.length === 0) return 0;
    return vendorReviews.reduce((sum, r) => sum + r.rating, 0) / vendorReviews.length;
  },

  loadFromStorage: () => {
    set({
      vendors: loadVendorsFromStorage(),
      reviews: loadReviewsFromStorage(),
    });
  },

  saveToStorage: () => {
    const { vendors, reviews } = get();
    storageSet(VENDORS_STORAGE_KEY, vendors);
    storageSet(REVIEWS_STORAGE_KEY, reviews);
  },
}));
