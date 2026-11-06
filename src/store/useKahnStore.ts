import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  BrandWheelItem,
  CurrencyCode,
  StoreProductItem,
  WheelFinishId,
} from '../data/kahnData';
import {
  NewWheelInput,
  createWheelAndProductEntries,
} from '../utils/wheelBuilder';

export interface SavedVehicleSession {
  make: string;
  model: string;
  year: string;
  part: string;
  collectionSlug: string;
  label: string;
}

export interface CartItem {
  productSlug: string;
  title: string;
  partNo: string;
  finish: WheelFinishId;
  priceGBP: number;
  quantity: number;
}

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

export interface ChatMessage {
  id: string;
  sender: 'concierge' | 'user';
  text: string;
  timestamp: string;
}

interface KahnStoreState {
  // Admin Protected Route Auth State
  isAdminAuthenticated: boolean;
  loginAdmin: (passcode: string) => boolean;
  logoutAdmin: () => void;

  // Custom Wheels & Store Products added via UI or Manager
  customBrandWheels: BrandWheelItem[];
  customStoreProducts: StoreProductItem[];
  isAddWheelModalOpen: boolean;
  setAddWheelModalOpen: (open: boolean) => void;
  addCustomWheelAndProduct: (input: NewWheelInput) => {
    brandWheel: BrandWheelItem;
    storeProduct: StoreProductItem;
  };
  removeCustomWheel: (wheelSlug: string) => void;

  // Vehicle Fitment Finder Current Form State
  selectedMake: string;
  selectedModel: string;
  selectedYear: string;
  selectedPart: string;
  setSelectedMake: (make: string) => void;
  setSelectedModel: (model: string) => void;
  setSelectedYear: (year: string) => void;
  setSelectedPart: (part: string) => void;

  // Persisted Vehicle Recall ("CONTINUE WITH YOUR PORSCHE MACAN (2014 ONWARDS)")
  savedVehicle: SavedVehicleSession;
  saveVehicleSession: (session: SavedVehicleSession) => void;

  // Currency & Locale
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;

  // Wishlist
  wishlistSlugs: string[];
  toggleWishlist: (slug: string) => void;

  // Shopping Bag / Reserve Cart
  cartItems: CartItem[];
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (productSlug: string, finish: WheelFinishId) => void;
  updateCartQuantity: (productSlug: string, finish: WheelFinishId, quantity: number) => void;
  clearCart: () => void;

  // Enquiry Modal (Brand & Store)
  enquiryModal: {
    isOpen: boolean;
    subject: string;
    partNo?: string;
    finish?: string;
    priceGBP?: number;
    domain: 'brand' | 'store';
  };
  openEnquiryModal: (payload: {
    subject: string;
    partNo?: string;
    finish?: string;
    priceGBP?: number;
    domain: 'brand' | 'store';
  }) => void;
  closeEnquiryModal: () => void;
  submittedEnquiries: SubmittedEnquiryRecord[];
  submitEnquiryRecord: (record: Omit<SubmittedEnquiryRecord, 'id' | 'createdAt'>) => void;

  // Live Concierge Chat
  isChatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  chatMessages: ChatMessage[];
  sendChatMessage: (text: string) => void;
}

export const useKahnStore = create<KahnStoreState>()(
  persist(
    (set, get) => ({
      isAdminAuthenticated: false,
      loginAdmin: (passcode: string) => {
        const cleaned = passcode.trim().toUpperCase();
        if (
          cleaned === 'FORGED-BMW-2026' ||
          cleaned === 'KAHN-BMW-2026' ||
          cleaned === 'ADMIN' ||
          cleaned === 'BMW2026'
        ) {
          set({ isAdminAuthenticated: true });
          return true;
        }
        return false;
      },
      logoutAdmin: () => set({ isAdminAuthenticated: false }),
      customBrandWheels: [],
      customStoreProducts: [],
      isAddWheelModalOpen: false,
      setAddWheelModalOpen: (open: boolean) => set({ isAddWheelModalOpen: open }),
      addCustomWheelAndProduct: (input: NewWheelInput) => {
        const { brandWheel, storeProduct } = createWheelAndProductEntries(input);
        set({
          customBrandWheels: [
            brandWheel,
            ...get().customBrandWheels.filter((w) => w.slug !== brandWheel.slug),
          ],
          customStoreProducts: [
            storeProduct,
            ...get().customStoreProducts.filter((p) => p.slug !== storeProduct.slug),
          ],
        });
        return { brandWheel, storeProduct };
      },
      removeCustomWheel: (wheelSlug: string) => {
        const normalized = wheelSlug.toLowerCase();
        set({
          customBrandWheels: get().customBrandWheels.filter(
            (w) => w.slug.toLowerCase() !== normalized
          ),
          customStoreProducts: get().customStoreProducts.filter(
            (p) =>
              p.wheelSlug.toLowerCase() !== normalized &&
              p.slug.toLowerCase() !== normalized
          ),
        });
      },
      selectedMake: '',
      selectedModel: '',
      selectedYear: '',
      selectedPart: '',

      setSelectedMake: (make: string) => {
        if (!make) {
          set({ selectedMake: '', selectedModel: '', selectedYear: '', selectedPart: '' });
          return;
        }
        set({
          selectedMake: make,
          selectedModel: '',
          selectedYear: '',
          selectedPart: '',
        });
      },

      setSelectedModel: (model: string) => {
        if (!model) {
          set({ selectedModel: '', selectedYear: '', selectedPart: '' });
          return;
        }
        // Auto-populate default year and ALLOY WHEELS when model is chosen (as specified in prompt)
        const defaultYearMap: Record<string, string> = {
          M3: '2024 ONWARDS',
          M2: '2023 ONWARDS',
          M4: '2024 ONWARDS',
          M5: '2024 ONWARDS',
        };
        set({
          selectedModel: model,
          selectedYear: defaultYearMap[model] || '2024 ONWARDS',
          selectedPart: 'ALLOY WHEELS',
        });
      },

      setSelectedYear: (year: string) => set({ selectedYear: year }),
      setSelectedPart: (part: string) => set({ selectedPart: part }),

      savedVehicle: {
        make: 'BMW',
        model: 'M3',
        year: '2024 ONWARDS',
        part: 'ALLOY WHEELS',
        collectionSlug: 'bmw-m3-2024-onwards-alloy-wheels',
        label: 'BMW M3 (2024 ONWARDS)',
      },

      saveVehicleSession: (session: SavedVehicleSession) => set({ savedVehicle: session }),

      currency: 'GBP',
      setCurrency: (currency: CurrencyCode) => set({ currency }),

      wishlistSlugs: ['bmw-m3-type-52-forged'],
      toggleWishlist: (slug: string) => {
        const current = get().wishlistSlugs;
        if (current.includes(slug)) {
          set({ wishlistSlugs: current.filter((s) => s !== slug) });
        } else {
          set({ wishlistSlugs: [...current, slug] });
        }
      },

      cartItems: [],
      isCartOpen: false,
      setCartOpen: (open: boolean) => set({ isCartOpen: open }),

      addToCart: (item) => {
        get().openEnquiryModal({
          subject: item.title,
          partNo: item.partNo,
          finish: item.finish,
          priceGBP: item.priceGBP,
          domain: 'store',
        });
      },

      removeFromCart: (productSlug, finish) => {
        set({
          cartItems: get().cartItems.filter(
            (i) => !(i.productSlug === productSlug && i.finish === finish)
          ),
        });
      },

      updateCartQuantity: (productSlug, finish, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productSlug, finish);
          return;
        }
        set({
          cartItems: get().cartItems.map((i) =>
            i.productSlug === productSlug && i.finish === finish ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ cartItems: [] }),

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

      isChatOpen: false,
      setChatOpen: (open: boolean) => set({ isChatOpen: open }),
      chatMessages: [
        {
          id: 'welcome-1',
          sender: 'concierge',
          text: 'Welcome to FORGED Custom wheels Technical Fitment Concierge. Share your vehicle model or wheel enquiry for immediate hub-centric fitment verification.',
          timestamp: '11:18',
        },
      ],
      sendChatMessage: (text: string) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        const userMsg: ChatMessage = {
          id: `u-${Date.now()}`,
          sender: 'user',
          text: trimmed,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        const lower = trimmed.toLowerCase();
        let replyText =
          'Our Chelsea & Bradford technical specialists have logged your query. All forged sets ship with TUV certification and direct hub-centric bore machining.';
        if (lower.includes('m3') || lower.includes('bmw')) {
          replyText =
            'For the G80/G81 BMW M3 (2024 Onwards), our Type 52 and RS 3.0 Forged sets use staggered 9.5x20 ET18 front and 10.5x21 ET20 rear specs—100% flush with M Carbon Ceramic clearance.';
        }
        const replyMsg: ChatMessage = {
          id: `c-${Date.now() + 1}`,
          sender: 'concierge',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        set({ chatMessages: [...get().chatMessages, userMsg, replyMsg] });
      },
    }),
    {
      name: 'kahn-automotive-store-bmw-v2',
      partialize: (state) => ({
        isAdminAuthenticated: state.isAdminAuthenticated,
        customBrandWheels: state.customBrandWheels,
        customStoreProducts: state.customStoreProducts,
        savedVehicle: state.savedVehicle,
        currency: state.currency,
        wishlistSlugs: state.wishlistSlugs,
        cartItems: state.cartItems,
        submittedEnquiries: state.submittedEnquiries,
      }),
    }
  )
);
