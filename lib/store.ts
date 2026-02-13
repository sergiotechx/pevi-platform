import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * User state interface
 * TODO: Update with actual User type from Prisma when auth is implemented
 */
interface User {
  user_id: number;
  email: string;
  full_name: string;
  role?: string;
  // Add more fields as needed
}

/**
 * Authentication state
 */
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  login: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

/**
 * Auth store with persistence
 * Automatically saves to localStorage
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({
        user,
        isAuthenticated: !!user
      }),

      login: (user) => set({
        user,
        isAuthenticated: true,
        isLoading: false
      }),

      logout: () => set({
        user: null,
        isAuthenticated: false,
        isLoading: false
      }),

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

/**
 * UI state (modals, sidebars, etc.)
 */
interface UIState {
  isSidebarOpen: boolean;
  activeModal: string | null;

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
}

/**
 * UI store (not persisted)
 */
export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: false,
  activeModal: null,

  toggleSidebar: () => set((state) => ({
    isSidebarOpen: !state.isSidebarOpen
  })),

  setSidebarOpen: (open) => set({ isSidebarOpen: open }),

  openModal: (modalId) => set({ activeModal: modalId }),

  closeModal: () => set({ activeModal: null }),
}));

/**
 * App settings/preferences
 */
interface SettingsState {
  language: string;
  currency: string;

  // Actions
  setLanguage: (lang: string) => void;
  setCurrency: (currency: string) => void;
}

/**
 * Settings store with persistence
 */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'en',
      currency: 'USD',

      setLanguage: (lang) => set({ language: lang }),
      setCurrency: (currency) => set({ currency }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
