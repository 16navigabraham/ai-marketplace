import { create } from 'zustand';
import { Agent, Portfolio } from '@/types';

interface AppStore {
  // UI State
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Wallet State
  userAddress: string | null;
  setUserAddress: (address: string | null) => void;
  chainId: number | null;
  setChainId: (id: number | null) => void;

  // Data Cache
  agents: Agent[];
  setAgents: (agents: Agent[]) => void;

  portfolio: Portfolio[];
  setPortfolio: (portfolio: Portfolio[]) => void;

  selectedAgent: Agent | null;
  setSelectedAgent: (agent: Agent | null) => void;

  // UI Preferences
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;

  // Clear all state
  reset: () => void;
}

const initialState = {
  isLoading: false,
  userAddress: null,
  chainId: null,
  agents: [],
  portfolio: [],
  selectedAgent: null,
  theme: 'dark' as const,
};

export const useAppStore = create<AppStore>((set) => ({
  ...initialState,

  setIsLoading: (loading) => set({ isLoading: loading }),
  setUserAddress: (address) => set({ userAddress: address }),
  setChainId: (id) => set({ chainId: id }),
  setAgents: (agents) => set({ agents }),
  setPortfolio: (portfolio) => set({ portfolio }),
  setSelectedAgent: (agent) => set({ selectedAgent: agent }),
  setTheme: (theme) => set({ theme }),

  reset: () => set(initialState),
}));
