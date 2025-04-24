import { create } from 'zustand';
import { getCompaniesAction, selectCompanyAction } from '@/actions/company/actions';
import { useUserStore } from './userStore';

export interface Company {
  id: string;
  name: string;
  logo?: string;
  [key: string]: any;
}

interface CompanyState {
  // State
  companies: Company[];
  selectedCompanyId: string | null;
  selectedCompany: Company | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  isSelecting: boolean;

  // Actions
  fetchCompanies: () => Promise<void>;
  selectCompany: (companyId: string) => Promise<void>;
  getSelectedCompany: () => Company | null;
  hydrate: () => void;
}

export const useCompanyStore = create<CompanyState>((set, get) => ({
  // Initial state
  companies: [],
  selectedCompanyId: null,
  selectedCompany: null,
  isLoading: false,
  isError: false,
  error: null,
  isSelecting: false,

  // Fetch companies
  fetchCompanies: async () => {
    set({ isLoading: true, isError: false, error: null });
    try {
      const user = useUserStore.getState().user
      if (!user) {
        set({ 
          isLoading: false, 
          isError: true, 
          error: 'User not found' 
        });
        return;
      }

      const result = await getCompaniesAction({ userId: user.id });
      if (result.success) {
        set({ 
          companies: result.companies as Company[],
          isLoading: false 
        });

        // Select first company if none selected
        const state = get();
        if (!state.selectedCompanyId && result.companies?.length > 0) {
          const firstCompanyId = result.companies[0].id;
          get().selectCompany(firstCompanyId);
        } 
        // Validate selected company exists in list
        else if (state.selectedCompanyId && result.companies?.length > 0) {
          const companyExists = result.companies.some(c => c.id === state.selectedCompanyId);
          if (!companyExists) {
            get().selectCompany(result.companies[0].id);
          }
        }
      } else {
        set({ 
          isLoading: false, 
          isError: true, 
          error: result.error || 'Unknown error' 
        });
      }
    } catch (error) {
      set({ 
        isLoading: false, 
        isError: true, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  },

  // Select company
  selectCompany: async (companyId: string) => {
    const state = get();
    if (companyId === state.selectedCompanyId) return;
    
    // Update immediately for responsive UI
    set({ 
      selectedCompanyId: companyId,
      selectedCompany: state.companies.find(c => c.id === companyId) || null,
      isSelecting: true 
    });
    
    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedCompanyId', companyId);
    }
    
    try {
      const user = useUserStore.getState().user
      if (!user) {
        set({ 
          isSelecting: false, 
          isError: true, 
          error: 'User not found' 
        });
        return;
      }

      const result = await selectCompanyAction({ userId: user.id, companyId: companyId });
      if (!result.success) {
        set({ 
          isSelecting: false,
          isError: true,
          error: result.error || 'Failed to select company' 
        });
      } else {
        set({ isSelecting: false });
      }
    } catch (error) {
      set({ 
        isSelecting: false,
        isError: true,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Get currently selected company
  getSelectedCompany: () => {
    const state = get();
    return state.selectedCompany;
  },

  // Hydrate state from localStorage
  hydrate: () => {
    if (typeof window !== 'undefined') {
      const storedCompanyId = localStorage.getItem('selectedCompanyId');
      if (storedCompanyId) {
        const state = get();
        const matchingCompany = state.companies.find(c => c.id === storedCompanyId);
        set({ 
          selectedCompanyId: storedCompanyId,
          selectedCompany: matchingCompany || null 
        });
      }
    }
  }
})); 