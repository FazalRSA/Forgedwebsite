import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import { BrandWheelItem } from '../data/catalogue';
import { NewWheelInput, createWheelEntry } from '../utils/wheelBuilder';

export interface SubmittedEnquiryRecord {
  id: string;
  subject: string;
  partNo?: string;
  finish?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vehicleRegistrationOrVin: string;
  notes: string;
  createdAt: string;
}

interface ForgedStoreState {
  // Admin Protected Route Auth State
  isAdminAuthenticated: boolean;
  loginAdmin: (passcode: string) => boolean;
  logoutAdmin: () => void;

  // Wheels added from the admin page; kept in this browser only. They show on the site only
  // while they have sets in stock, like every other listing.
  customBrandWheels: BrandWheelItem[];
  addCustomWheel: (input: NewWheelInput) => BrandWheelItem;
  removeCustomWheel: (wheelSlug: string) => void;

  // Enquiry Modal
  enquiryModal: {
    isOpen: boolean;
    subject: string;
    partNo?: string;
    finish?: string;
    priceZAR?: number;
    domain: 'brand' | 'store';
  };
  openEnquiryModal: (payload: {
    subject: string;
    partNo?: string;
    finish?: string;
    priceZAR?: number;
    domain: 'brand' | 'store';
  }) => void;
  closeEnquiryModal: () => void;
  submittedEnquiries: SubmittedEnquiryRecord[];
  submitEnquiryRecord: (record: Omit<SubmittedEnquiryRecord, 'id' | 'createdAt'>) => void;

}

/**
 * Persisted-state key. The previous key was inherited from the design template;
 * on first load after the rename, any state saved under it is copied across once
 * so returning visitors keep their enquiry history.
 */
const STORAGE_KEY = 'forged-custom-wheels-store';
const LEGACY_STORAGE_KEY = 'kahn-automotive-store-bmw-v2';

/**
 * localStorage can throw (storage disabled, private mode, quota). Treat any
 * failure as "no persisted state" rather than breaking the store.
 */
function safeStorage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

const migratingLocalStorage: StateStorage = {
  getItem: (name) => {
    const ls = safeStorage();
    if (!ls) return null;
    try {
      const current = ls.getItem(name);
      if (current !== null) return current;
      const legacy = ls.getItem(LEGACY_STORAGE_KEY);
      if (legacy !== null) {
        ls.setItem(name, legacy);
        ls.removeItem(LEGACY_STORAGE_KEY);
      }
      return legacy;
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      safeStorage()?.setItem(name, value);
    } catch {
      /* quota exceeded or storage blocked: the in-memory store still works */
    }
  },
  removeItem: (name) => {
    try {
      safeStorage()?.removeItem(name);
    } catch {
      /* ignore */
    }
  },
};

export const useForgedStore = create<ForgedStoreState>()(
  persist(
    (set, get) => ({
      isAdminAuthenticated: false,
      loginAdmin: (passcode: string) => {
        const cleaned = passcode.trim().toUpperCase();
        if (
          cleaned === 'FORGED-BMW-2026'
        ) {
          set({ isAdminAuthenticated: true });
          return true;
        }
        return false;
      },
      logoutAdmin: () => set({ isAdminAuthenticated: false }),
      customBrandWheels: [],
      addCustomWheel: (input: NewWheelInput) => {
        const brandWheel = createWheelEntry(input);
        set({
          customBrandWheels: [
            brandWheel,
            ...get().customBrandWheels.filter((w) => w.slug !== brandWheel.slug),
          ],
        });
        return brandWheel;
      },
      removeCustomWheel: (wheelSlug: string) => {
        const normalized = wheelSlug.toLowerCase();
        set({
          customBrandWheels: get().customBrandWheels.filter(
            (w) => w.slug.toLowerCase() !== normalized
          ),
        });
      },

      enquiryModal: {
        isOpen: false,
        subject: '',
        domain: 'brand',
      },
      openEnquiryModal: (payload) =>
        set({
          enquiryModal: {
            isOpen: true,
            ...payload,
          },
        }),
      closeEnquiryModal: () =>
        set((state) => ({
          enquiryModal: {
            ...state.enquiryModal,
            isOpen: false,
          },
        })),
      submittedEnquiries: [],
      submitEnquiryRecord: (record) => {
        const newRecord: SubmittedEnquiryRecord = {
          ...record,
          id: `ENQ-${Date.now().toString().slice(-6)}`,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        set({
          submittedEnquiries: [newRecord, ...get().submittedEnquiries],
        });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => migratingLocalStorage),
      // v3: the store, cart, wishlist and saved-vehicle features are gone, so their old
      // saved fields (and the pre-Rand currency key) are dropped from returning visitors' storage.
      version: 3,
      migrate: (persisted) => {
        const state = (persisted ?? {}) as Record<string, unknown>;
        for (const key of [
          'currency',
          'cartItems',
          'wishlistSlugs',
          'savedVehicle',
          'customStoreProducts',
        ]) {
          delete state[key];
        }
        return state as unknown as ForgedStoreState;
      },
      partialize: (state) => ({
        isAdminAuthenticated: state.isAdminAuthenticated,
        customBrandWheels: state.customBrandWheels,
        submittedEnquiries: state.submittedEnquiries,
      }),
    }
  )
);
