import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Auth Store
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) =>
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        }),

      updateUser: (userData) =>
        set((state) => ({
          user: { ...state.user, ...userData },
        })),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Prediction Store
export const usePredictionStore = create((set) => ({
  currentPrediction: null,
  isLoading: false,
  error: null,
  isSaved: false,

  setPrediction: (prediction) =>
    set({
      currentPrediction: prediction,
      isLoading: false,
      error: null,
      isSaved: false,
    }),

  setIsSaved: (val) => 
    set({ isSaved: val }),

  setLoading: (loading) =>
    set({ isLoading: loading }),

  setError: (error) =>
    set({
      error,
      isLoading: false,
    }),

  clearPrediction: () =>
    set({
      currentPrediction: null,
      error: null,
    }),
}));

// History Store
export const useHistoryStore = create((set) => ({
  history: [],
  stats: null,
  filters: {
    crop: null,
    limit: 20,
    offset: 0,
  },

  setHistory: (history) => set({ history }),

  addToHistory: (prediction) =>
    set((state) => ({
      history: [prediction, ...state.history],
    })),

  updateHistoryItem: (id, data) =>
    set((state) => ({
      history: state.history.map((item) =>
        item.id === id ? { ...item, ...data } : item
      ),
    })),

  deleteFromHistory: (id) =>
    set((state) => ({
      history: state.history.filter((item) => item.id !== id),
    })),

  setStats: (stats) => set({ stats }),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  clearHistory: () => set({ history: [] }),
}));

// UI Store
export const useUIStore = create((set) => ({
  selectedCrop: 'cassava',
  captureMode: 'camera', // 'camera' or 'upload'
  sidebarOpen: false,
  theme: 'light',

  setSelectedCrop: (crop) => set({ selectedCrop: crop }),

  setCaptureMode: (mode) => set({ captureMode: mode }),

  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  setTheme: (theme) => set({ theme }),
}));

// Analytics Store
export const useAnalyticsStore = create((set) => ({
  dashboard: null,
  trends: null,
  distribution: null,
  isLoading: false,

  setDashboard: (dashboard) =>
    set({ dashboard, isLoading: false }),

  setTrends: (trends) =>
    set({ trends, isLoading: false }),

  setDistribution: (distribution) =>
    set({ distribution, isLoading: false }),

  setLoading: (loading) =>
    set({ isLoading: loading }),

  clearAnalytics: () =>
    set({
      dashboard: null,
      trends: null,
      distribution: null,
    }),
}));
